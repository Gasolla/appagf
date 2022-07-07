const moment = require("moment");
const conexao = require('../uses/conexao');
module.exports = {
    async count(request, response) {
        const { cliente, data } = request.params;
        const [{ total }] = await conexao('agendamento')
                    .where({cliente: cliente, status:'F', data:data})
                    .count('id as total');    
        console.log('rotina agentamento count');
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        response.header('X-Total-Count', total);                      
        return response.json({auth: true, message: 'Sucesso', sucesso: true, total: total});
    },
    async data(request, response) {
        const [{ data }] = await conexao('VW_DIASAGENDA')
                    .max('data as data');    
        console.log(data);
        console.log('rotina agentamento data');
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        return response.json({auth: true, message: 'Sucesso', sucesso: true, data: data});
    },
    async create(request, response) {
        const dthrlocal = moment().local().format('yyyy-MM-DD HH:mm:ss');
        const { cliente, usercadastro, data, veiculo, tpcadastro } = request.body;
        console.log('rotina agendamento create -- usuario:'+ usercadastro);
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        try {
            var t = await conexao.transaction();
            try {
                const [{motorista}] = await conexao('clientes').transacting(t).
                            select(['usuario as motorista']).
                            where({id: cliente});
                if (motorista===0){
                    console.log('falha -- rotina agendacoleta motorista nao cadastrado');
                    return response.json({auth: true, message: 'Falha', sucesso: true, codigo: 0, descricao: "motorista não cadastrado para o cliente!"});
                }

                const [{ total }] = await conexao('dias_agenda').transacting(t).
                            count('dt_referencia as total').
                            where({Dt_Referencia: data});
                if (total===0){
                    console.log('falha -- rotina agendacoleta data invalida');
                    return response.json({auth: true, message: 'Falha', sucesso: true, codigo: 0, descricao: "data inválida!"});
                }
                
                const id = await conexao('agendamento').transacting(t).
                                    returning('id').
                                    insert({cliente, 
                                             usuario: motorista, 
                                             data, 
                                             dthr: dthrlocal, 
                                             usercadastro, 
                                             tpcadastro, 
                                            veiculo });

                t.commit();
                console.log('sucesso -- rotina agendacoleta create');
                return response.json({auth: true, message: 'Sucesso', sucesso: true, codigo: id[0], descricao: "Sucesso!"});
            }
            catch (e) {
                await t.rollback();
                // As you can see, if you don't rethrow here
                // the outer catch is never triggered
                console.log('falha -- rotina agendacoleta create 1');
                console.log(e);
                throw e;
            }
        }
        catch (e) {
            //It failed
            console.log('falha -- rotina agendacoleta create 1');
            console.log(e);
            return response.json({auth: true, message: 'Falha', sucesso: false, codigo: 0});
        }
    },
    async list(request, response) {
        const {page = 1} = request.query;
        const { cliente } = request.params;
        const [{ total }] = await conexao('VW_AGENDAMENTORELATORIO').count('cliente_id as total').where({cliente_id: cliente});
        const agendamentos = await conexao('VW_AGENDAMENTORELATORIO')
                    .limit(5)
                    .offset((page-1)*5)
                    .orderBy('VW_AGENDAMENTORELATORIO.data', 'desc')
                    .where({cliente_id: cliente})
                    .select(['datainput', 'datarealizar', 'datacoleta', 'descricao', 'id', 'statuscoleta as status']);
					
        console.log('rotina agendacoleta list -- cliente:' + cliente);
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
		response.header('X-Total-Count', total);                      
        return response.json({auth: true, message: 'Sucesso', sucesso: true, agendas: agendamentos});
    },
};