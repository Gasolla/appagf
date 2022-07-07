const conexao = require('../uses/conexao');
const moment = require("moment");
module.exports = {
    async list(request, response) {
        const { usuario } = request.params;
        const [count] = await conexao('VW_CLIENTEROTAANDAMENTO').count().where('usuario', usuario);
        const clientes = await conexao('VW_CLIENTEROTAANDAMENTO').where('usuario', usuario)
                               .orderBy('nome')
                               .select('ID as id', 'nome as name');
        console.log('rotina cliente list -- usuario:'+usuario);
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
		response.header('X-Total-Count', count['count(*)']);
        return response.json({auth: true, message: 'Sucesso', sucesso: true, clientes: clientes});
    },
    async lists(request, response) {
        const { usuario } = request.params;
        const [count] = await conexao('VW_CLIENTES').count().where('usuario', usuario);
        const clientes = await conexao('VW_CLIENTES').where('usuario', usuario)
                               .orderBy('nome')
                               .select('ID as id', 'nome as name');
        console.log('rotina cliente list -- usuario:'+usuario);
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
		response.header('X-Total-Count', count['count(*)']);
        return response.json({auth: true, message: 'Sucesso', sucesso: true, clientes: clientes});
    },
    async index(request, response) {
        const { id } = request.params;
        const clientes = await conexao('clientes')
                    .where('clientes.id', id)
                    .select(['email', 'nome', 'numerofone']);

        console.log('rotina cliente index -- cliente:'+id);
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
		response.header('X-Total-Count', clientes.length);                       
        return response.json({auth: true, message: 'Sucesso', sucesso: true, clientes: clientes});
    },
    async create(request, response) {
        const { nome, cpf, inativo, dthrcadastro} = request.body;
		console.log('rotina cliente create');
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        try {
            var t = await conexao.transaction();
            try {
                const id = await conexao('clientes').transacting(t).
                                    returning('id').
                                    insert({nome, cpf, inativo, dthrcadastro});
                console.log('sucesso -- rotina cliente create');
				t.commit();
                return response.json({auth: true, message: 'Sucesso', sucesso: true, clientes: clientes, codigo: id[0]});
            }
            catch (e) {
                await t.rollback();
                // As you can see, if you don't rethrow here
                // the outer catch is never triggered
                console.log('falha -- rotina cliente create 1');
				console.log(e);
                throw e;
            }
        }
        catch (e) {
            //It failed
            console.log('falha -- rotina cliente create 2');
			console.log(e);
            return response.json({auth: true, message: 'Falha', sucesso: false, clientes: clientes, codigo: 0});
        }
    }
};