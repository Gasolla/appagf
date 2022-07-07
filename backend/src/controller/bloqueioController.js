const conexao = require('../uses/conexao');
const moment = require("moment");
module.exports = {
    async index(request, response) {
        const dthragendamento = moment().subtract(1, 'days').local().format('yyyy-MM-DD');
        const dthrtrocaoleo = moment().local().format('yyyy-MM-DD')
        
        const { usuario } = request.params;
        try {
            var t = await conexao.transaction();
            try {
                const TROCAOLEO = await conexao('VW_TROCAOLEO').transacting(t)
                    .where('usuario', usuario)
                    .select('distancia');
                const { distancia } = TROCAOLEO[0];

                const AGENDAMENTOATRASO = await conexao('VW_AGENDAMENTOATRASO').transacting(t)
                    .where('usuario', usuario)
                    .select('total');
                const total = ((AGENDAMENTOATRASO.length>0)?AGENDAMENTOATRASO[0].total:0);
                if  (parseFloat(total) > 0) {
                    await conexao('usuarios').transacting(t).
                    update({ bloqueio: '1', bloqueiotipo: 'A', bloqueiodthr: dthragendamento }).
                    where({ id: usuario, bloqueio: '0' });
                }else if (parseFloat(distancia) > 1000) {
                    await conexao('usuarios').transacting(t).
                        update({ bloqueio: '1', bloqueiotipo: 'T', bloqueiodthr: dthrtrocaoleo }).
                        where({ id: usuario, bloqueio: '0' });
                }

                const retorno = await conexao('VW_BLOQUEIO').transacting(t)
                    .where('id', usuario)
                    .select(['*']);

                let bloqueio = {
                    distancia,
                    bloquear: retorno.length,
                    bloqueiotipo: retorno
                }
                t.commit();
                console.log('rotina bloqueio index -- Usuario:' + usuario);
                console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
                return response.json({ auth: true, message: 'Sucesso', sucesso: true, bloqueio: bloqueio });
            }
            catch (e) {
                await t.rollback();
                // As you can see, if you don't rethrow here
                // the outer catch is never triggered
                console.log('falha -- rotina bloqueio create 1');
                console.log(e);
                throw e;
            }
        }
        catch (e) {
            //It failed
            console.log('falha -- rotina bloqueio create 2');
            console.log(e);
            return response.json({ auth: true, message: 'Falha', sucesso: false, codigo: 0 });
        }
    }

};