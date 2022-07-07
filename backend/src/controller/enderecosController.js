const conexao = require('../uses/conexao');
const moment = require("moment");
module.exports = {
    async index(request, response) {
        const { id } = request.params;
        const enderecos = await conexao('enderecos')
                    .where('enderecos.cliente', id)
                    .select(['latitude', 'longitude', 'EnderecoExtenso as endereco']);
		console.log('rotina endereco index');
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        response.header('X-Total-Count', enderecos.length);                       
        return response.json({auth: true, message: 'Sucesso', sucesso: true, enderecos: enderecos});
    }
};