const conexao = require('../uses/conexao');
const moment = require("moment");
module.exports = {
    async create(request, response) {
        const { usuario, base64 } = request.body;
        const dthrlocal = moment().local().format('yyyy-MM-DD HH:mm:ss');
        console.log('rotina trocaoleo create -- usuario:' + usuario);
        console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        try {
            var t = await conexao.transaction();
            try {

                const id = await conexao('trocaoleo').transacting(t).
                    returning('id').
                    insert({ usuario, base64, dthr: dthrlocal });

                await conexao('rota').transacting(t).
                    update({ trocaoleo_id: id }).
                    where({ usuario: usuario, trocaoleo_id: 0, veiculo: '1' });

                await conexao('usuarios').transacting(t).
                    update({ bloqueio: '0', bloqueiotipo: ''}).
                    where({ id: usuario, bloqueio: '1',  bloqueiotipo: 'T' });

                t.commit();
                console.log('sucesso -- rotina trocaoleo create');
                return response.json({ auth: true, message: 'Sucesso', sucesso: true, codigo: id[0] });
            }
            catch (e) {
                await t.rollback();
                // As you can see, if you don't rethrow here
                // the outer catch is never triggered
                console.log('falha -- rotina trocaoleo create 1');
                console.log(e);
                throw e;
            }
        }
        catch (e) {
            //It failed
            console.log('falha -- rotina trocaoleo create 2');
            console.log(e);
            return response.json({ auth: true, message: 'Falha', sucesso: false, codigo: 0 });
        }
    }
};