const conexao = require('../uses/conexao');
const moment = require("moment");
module.exports = {
    async list(request, response) {
        const { usuario } = request.params;
        const rota = await conexao('VW_ROTAANDAMENTO')
                    .limit(1)
                    .orderBy('dthr', 'desc')
                    .where('usuario', usuario)
                    .select('id');
		console.log('rotina rota list -- Usuario:'+usuario);
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        const id = (rota.length==0?0:rota[0].id); 
        return response.json({auth: true, message: 'Sucesso', sucesso: true, id: id});
    },

    async index(request, response) {
        const { id } = request.params;
        const rota = await conexao('rota')
                    .where('id', id)
                    .select(['latinicial', 'loginicial', 'descinicial', 
                             'latfinal', 'logfinal', 'descfinal', 'veiculo']);


        const points = await conexao('VW_ROTA')
                    .where('id', id)
                    .select(['*']);
        let rotas = {
            rota: rota, 
            points: points
        }
		console.log('rotina rota index -- rota:'+id);
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        response.header('X-Total-Count', points.length);                       
        return response.json({auth: true, message: 'Sucesso', sucesso: true, rotas: rotas});
    },
    async create(request, response) {
        const { usuario, dthr, distancia, duracao, latinicial, loginicial, descinicial, veiculo,
                latfinal, logfinal, descfinal, points, iniciolatitude, iniciolongitude} = request.body;
        const dthrlocal = moment().local().format('yyyy-MM-DD HH:mm:ss');
		console.log('rotina rota create -- usuario:'+usuario);
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        try {
            var t = await conexao.transaction();
            try {
                const id = await conexao('rota').transacting(t).
                                    returning('id').
                                    insert({usuario, dthr: dthrlocal, distancia, duracao, 
                                            latinicial, loginicial, descinicial, veiculo,
                                            latfinal, logfinal, descfinal, iniciolongitude, iniciolatitude });

                const rota = id[0];
                for (var i = 0; i < points.length; i++) {
                    const item = i;
                    const {cliente_id, longitude, latitude, descricao, agendamento_id} = points[i];
                    await conexao('rotaitens').
                        transacting(t).
                        insert({
                            rota,
                            item, 
                            cliente: cliente_id, 
                            longitude,
                            latitude, 
                            descricao, 
                            agendamento_id
                        });
                }
                t.commit();
				console.log('sucesso -- rotina rota create');
		        return response.json({auth: true, message: 'Sucesso', sucesso: true, codigo: id[0]});
            }
            catch (e) {
                await t.rollback();
                // As you can see, if you don't rethrow here
                // the outer catch is never triggered
                console.log('falha -- rotina rota create 1');
		        console.log(e);
                throw e;
            }
        }
        catch (e) {
            //It failed
            console.log('falha -- rotina rota create 2');
		    console.log(e);
            return response.json({auth: true, message: 'Falha', sucesso: false, codigo: 0});
        }
    }
};