const conexao = require('../uses/conexao');
const moment = require("moment");
module.exports = {
    async list(request, response) {
        const { usuario } = request.params;
        const rotas = await conexao('VW_ROTAANDAMENTO')
                    .orderBy('dthr', 'desc')
                    .where('usuario', usuario)
                    .select('*');
		console.log('rotina rotafinaliza list -- Usuario:'+usuario);
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        return response.json({auth: true, message: 'Sucesso', sucesso: true, rotas});
    },
    async create(request, response) {
        const { usuario, rota, fimlatitude, fimlongitude } = request.body;
        const dthrlocal = moment().local().format('yyyy-MM-DD HH:mm:ss');
		console.log('rotina rotafinaliza create -- usuario:'+usuario);
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        try {
            var t = await conexao.transaction();
            try {
                await conexao('rota').transacting(t).
                            update({dthrfinal :dthrlocal, userfinal:usuario, status:'T', fimlatitude, fimlongitude}).
                            where({id: rota, status:'F'});

                await conexao('rotaitens').transacting(t)
                       .del().where({rota})
                       .whereIn('agendamento_id', function() {
                        this.select('id')
                            .from('Agendamento')
                            .where('status', 'F');
                      });
                                    
                t.commit();
				console.log('sucesso -- rotina rotafinaliza create');
		        return response.json({auth: true, message: 'Sucesso', sucesso: true, codigo: 1});
            }
            catch (e) {
                await t.rollback();
                // As you can see, if you don't rethrow here
                // the outer catch is never triggered
                console.log('falha -- rotina rotafinaliza create 1');
		        console.log(e);
                throw e;
            }
        }
        catch (e) {
            //It failed
            console.log('falha -- rotina rotafinaliza create 2');
		    console.log(e);
            return response.json({auth: true, message: 'Falha', sucesso: false, codigo: 0});
        }
    }
};