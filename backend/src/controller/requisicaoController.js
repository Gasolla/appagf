const moment = require("moment");
const conexao = require('../uses/conexao');
module.exports = {
    async list(request, response) {
        const {page = 1} = request.query;
        const [{ total }] = await conexao('requisicaoitens').count('Requisicao as total');
        const clientes = await conexao('requisicao')
                    .join('clientes', 'clientes.id', '=', 'requisicao.cliente')
                    .join('requisicaoitens', 'requisicaoitens.requisicao', '=', 'requisicao.id')
                    .limit(5)
                    .offset((page-1)*5)
                    .orderBy('requisicao.id')
                    .select(['clientes.nome as cliente', 
                            'requisicao.dthr', 
                            'requisicaoitens.base64']);
        console.log('rotina requisicao list');
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        response.header('X-Total-Count', total);                      
        return response.json({auth: true, message: 'Sucesso', sucesso: true, clientes: clientes});
    },
    async create(request, response) {
        const data = moment().format("yyyy-MM-DD") ;
        const dthrlocal = moment().local().format('yyyy-MM-DD HH:mm:ss');
        const { cliente, usuario, dthr, arquivos, latitude, longitude, coleta, veiculo_id} = request.body;
        const qtde = arquivos.length;
		console.log('rotina requisicao create -- usuario:'+usuario);
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        try {
            var t = await conexao.transaction();
            try {
                await conexao('agendamento').transacting(t).
                            update({dthrcoleta:dthrlocal, usercoleta:usuario, status:'T'}).
                            where({cliente: cliente, status:'F', data:data});


                const id = await conexao('requisicao').transacting(t).
                                    returning('id').
                                    insert({cliente, usuario, qtde, dthr: dthrlocal, latitude, longitude, coleta, veiculo_id});

                const requisicao = id[0];
                for (var i = 0; i < arquivos.length; i++) {
                    const {base64} = arquivos[i];
                    const item = i;
                    await conexao('requisicaoitens').
                        transacting(t).
                        insert({
                            requisicao,
                            item, 
                            base64,
                        });
                }
                t.commit();
                console.log('sucesso -- rotina requisicao create');
                return response.json({auth: true, message: 'Sucesso', sucesso: true, codigo: id[0]});
            }
            catch (e) {
                await t.rollback();
                // As you can see, if you don't rethrow here
                // the outer catch is never triggered
                console.log('falha -- rotina requisicao create 1');
                console.log(e);
                throw e;
            }
        }
        catch (e) {
            //It failed
            console.log('falha -- rotina requisicao create 1');
            console.log(e);
            return response.json({auth: true, message: 'Falha', sucesso: false, codigo: 0});
        }
    }
};