const conexao = require('../uses/conexao');
const moment = require("moment");
module.exports = {
    async list(request, response) {
        const {page = 1} = request.query;
        const [count] = await conexao('usuarios').count();
        const usuarios = await conexao('usuarios')
                               .limit(5)
                               .offset((page - 1)*5)
                               .orderBy('id')
                               .select('usuarios.*');
		console.log('rotina usuario list');
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        response.header('X-Total-Count', count['count(*)']);
        return response.json({auth: true, message: 'Sucesso', sucesso: true, usuarios: usuarios});
    },
    async create(request, response) {
        const { nome, sobrenome, usuario, senha, cpf, inativo, dthrcadastro} = request.body;
        try {
            var t = await conexao.transaction();
            try {
                const id = await conexao('usuarios').transacting(t).
                                    returning('id').
                                    insert({nome, sobrenome, usuario, senha, cpf, inativo, dthrcadastro});
				console.log('rotina usuario create -- usuario:'+usuario);
				console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
                t.commit();
                return response.json({auth: true, message: 'Sucesso', sucesso: true, codigo: id[0]});
            }
            catch (e) {
                await t.rollback();
                // As you can see, if you don't rethrow here
                // the outer catch is never triggered
                console.log('falha -- rotina usuario create 1');
				console.log(e);
                throw e;
            }
        }
        catch (e) {
            //It failed
            console.log('falha -- rotina usuario create 2');
			console.log(e);
            return response.json({auth: true, message: 'Falha', sucesso: false, codigo: 0});
        }
    }
};