const moment = require("moment");
const conexao = require('../uses/conexao');
module.exports = {
    async create(request, response) {
        const dthr = moment().local().format('yyyy-MM-DD HH:mm:ss');
        console.log(request.body.objetos);
        console.log(request.params);
        const { apikey } = request.params;
        const { objetos } = request.body;
        //return response.json({ statusProcessamento: 0, status: 'sucesso', total: 1, Objetos: [{ objeto: "GG767688657BR" }] });
        console.log('rotina envioapiweb create');
        console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        try {
            var t = await conexao.transaction();
            try {
                const clientes = await conexao('clientes').transacting(t).
                    join('enderecos', 'clientes.id', '=', 'enderecos.cliente').
                    select(['clientes.id', 'Nome', 'Endereco', 'Numero', 'Complemento', 'Bairro',
                            'Cidade', 'UF', 'CepNumero' ]).
                    where({ apikey });

                if (clientes.length == 0) {
                    console.log('falha -- rotina cliente nao encontrado.');
                    await t.rollback();
                    return response.json({ statusProcessamento: 0, status: 'Falha: Api Key inválida', total: 0, Objetos: [] });            
                }
                console.log(clientes);
                const [{ id, Nome, Endereco, Numero, Complemento, Bairro, Cidade, UF, CepNumero  }] = clientes;
                var retArray = [];
                for(let i = 0; i < objetos.length; i++){
                    console.log(objetos[i])
                    var [{ total }] = await conexao('CorreioObjetos').transacting(t).
                            count('id as total').
                            where({duplicidade: objetos[i].endereco.trim()+objetos[i].cep.trim(), 
                                   cliente_id: id });

                    if (total>0){
                        console.log('falha -- rotina duplicidade no arquivo.');
                        await t.rollback();
                        return response.json({ statusProcessamento: 0, status: 'Falha: Duplicidade no envio', total: 0, Objetos: [] });            
                    }

                    var etiquetas = await conexao('CorreioEtiquetas').transacting(t).
                            select('objeto').
                            where({codigo: objetos[i].servico_correios, 
                                   status: 'F', cliente_id: id });
                                
                    console.log(etiquetas);
                    if (etiquetas.length==0){
                        console.log('falha -- rotina etiquetas nao encontrada ' + id);
                        await t.rollback();
                        return response.json({ statusProcessamento: 0, status: 'Falha: Etiqueta não disponível', total: 0, Objetos: [] });            
    
                    }
                    var [{ objeto }] = etiquetas;
                    console.log(objeto);

                    var codigo = await conexao('CorreioObjetos').transacting(t).
                    returning('id as codigo').
                    insert({
                        Cliente_id: id,
                        Objeto: objeto,
                        NomeDestino: objetos[i].destinatario,
                        UFDestino: objetos[i].uf,
                        CidadeDestino: objetos[i].cidade,
                        BairroDestino: objetos[i].bairro,
                        EnderecoDestino: objetos[i].endereco,
                        NumeroDestino: objetos[i].numero,
                        CepDestino: objetos[i].cep,
                        Departamento: objetos[i].departamento,
                        Cartao: objetos[i].cartao,
                        Servico: objetos[i].servico_correios,
                        Duplicidade: objetos[i].endereco.trim()+objetos[i].cep.trim(),
                        DtHr: dthr,
                        NomeRemetente: Nome,
                        UFRemetente: UF,
                        CidadeRemetente: Cidade,
                        BairroRemetente: Bairro,
                        EnderecoRemetente: Endereco,
                        NumeroRemetente: Numero+' '+Complemento,
                        CepRemetente: CepNumero,
                    });

                    await conexao('CorreioEtiquetas').transacting(t).
                            update({status:'T'}).
                            where({Objeto: objeto});
                    
                    retArray.push({
                        "destinatario": objetos[i].destinatario,
                        "endereco": objetos[i].endereco,
                        "numero": objetos[i].numero,
                        "cep": objetos[i].cep,
                        "servico_correios": objetos[i].servico_correios,
                        "bairro": objetos[i].bairro,
                        "cidade": objetos[i].cidade,
                        "uf": objetos[i].uf,
                        "cep_remetente": CepNumero,
                        "bairro_remetente": Bairro,
                        "cidade_remetente": Cidade,
                        "uf_remetente": UF,
                        "departamento": objetos[i].departamento,
                        "cartao": objetos[i].cartao,
                        "contrato": "",
                        "remetente": Nome,
                        "endereco_remetente": Endereco,
                        "numero_remetente": Numero + ' ' + Complemento,
                        "objeto": objeto
                        }
                    );

                }
                var retorno = {
                    "status_processamento": 1,
                    "status": "Processado com sucesso",
                    "total": retArray.length,
                    "objetos": retArray
                }; 

                t.commit();
                
                return response.json(retorno);
        
                }
            catch (e) {
                await t.rollback();
                // As you can see, if you don't rethrow here
                // the outer catch is never triggered
                console.log('falha -- rotina api envio web create 1');
                console.log(e);
                //return response.json({ statusProcessamento: 0, status: 'Falha: Erro no envio dos parametros', total: 0, Objetos: [] });            
                throw e;
            
            }
        }
        catch (e) {
            //It failed
            console.log('falha -- rotina api envio web create 1');
            console.log(e);
            return response.json({ statusProcessamento: 0, status: 'Falha: Erro no envio dos parametros', total: 0, Objetos: [] });            
        }
    },

};