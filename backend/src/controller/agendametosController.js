const conexao = require('../uses/conexao');
const moment = require("moment");
module.exports = {
    async list(request, response) {
        const {page = 1} = request.query;
        const { usuario } = request.params;
        const [{ total }] = await conexao('vw_agendamentos').count('agendamento_id as total').where({usuario_id: usuario, status:'F'});
        const agendamentos = await conexao('vw_agendamentos')
                    .limit(5)
                    .offset((page-1)*5)
                    .orderBy('vw_agendamentos.cliente')
                    .where({usuario_id: usuario, status:'F'})
                    .select(['*']);
					
        console.log('rotina agendamento list -- usuario:'+usuario);
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
		response.header('X-Total-Count', total);                      
        return response.json({auth: true, message: 'Sucesso', sucesso: true, agendamentos: agendamentos});
    },
};