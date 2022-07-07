const conexao = require('../uses/conexao');
const moment = require("moment");
module.exports = {
    async list(request, response) {
        const { usuario } = request.params;
        const veiculo = await conexao('VW_VEICULOS')
                    .where('usuario', usuario)
                    .select(['id', 'name']);
		console.log('rotina veiculo list -- Usuario:'+usuario);
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        return response.json({auth: true, message: 'Sucesso', sucesso: true, veiculo: veiculo});
    }
}