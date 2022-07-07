const conexao = require('../uses/conexao');
const moment = require("moment");
module.exports = {
    async list(request, response) {
        const {page = 1} = request.query;
        const [{ total }] = await conexao('remessaitens').count('Remessa as total');
        const clientes = await conexao('remessa')
                    .join('clientes', 'clientes.id', '=', 'remessa.cliente')
                    .join('remessaitens', 'remessaitens.remessa', '=', 'remessa.id')
                    .limit(5)
                    .offset((page-1)*5)
                    .orderBy('remessa.id')
                    .select(['clientes.nome as cliente', 
                            'remessa.dthr', 
                            'remessaitens.objeto', 
                            'remessaitens.datapostagem', 
                            'remessaitens.dataentrega', 
                            'remessaitens.apelido', 
                            'remessaitens.descricao']);
        console.log('rotina remessa list');
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));       
        response.header('X-Total-Count', total);                      
        return response.json({auth: true, message: 'Sucesso', sucesso: true, clientes: clientes});
    },
    async index(request, response) {
        const { objeto } = request.params;
        const clientes = await conexao('remessa')
                    .join('clientes', 'clientes.id', '=', 'remessa.cliente')
                    .join('remessaitens', 'remessaitens.remessa', '=', 'remessa.id')
                    .where('remessaitens.objeto', objeto)
                    .select(['clientes.nome as cliente', 
                            'remessa.dthr', 
                            'remessaitens.objeto', 
                            'remessaitens.datapostagem', 
                            'remessaitens.dataentrega', 
                            'remessaitens.apelido', 
                            'remessaitens.descricao']);
		console.log('rotina remessa index');
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        response.header('X-Total-Count', clientes.length);                       
        return response.json({auth: true, message: 'Sucesso', sucesso: true, clientes: clientes});
    },
    async count(request, response) {
        const { objeto } = request.params;
        const [{ total }] = await conexao('remessaitens')
                    .where('remessaitens.objeto', objeto).count('Remessa as total');
        
        console.log('rotina remessa count');
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        response.header('X-Total-Count', total);                      
        return response.json({auth: true, message: 'Sucesso', sucesso: true, total: total});
    },

    async create(request, response) {
        const data = moment().format("yyyy-MM-DD") ;
        const dthrlocal = moment().local().format('yyyy-MM-DD HH:mm:ss');
        const { cliente, usuario, dthr, latitude, longitude, veiculo_id,  itens} = request.body;
        const qtde = itens.length;
        console.log('rotina remessa create -- usuario:'+usuario);
		console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
		try {
            var t = await conexao.transaction();
            try {
                console.log(data);
                await conexao('agendamento').transacting(t).
                            update({dthrcoleta:dthrlocal, usercoleta:usuario, status:'T'}).
                            where({cliente: cliente, status:'F', data:data});

                const id = await conexao('remessa').transacting(t).
                                    returning('id').
                                    insert({cliente, usuario, qtde, dthr: dthrlocal, latitude, longitude, veiculo_id});

                const remessa = id[0];
                for (var i = 0; i < itens.length; i++) {
                    const {objeto} = itens[i];
                    const item = i;
                    await conexao('remessaitens').
                        transacting(t).
                        insert({
                            remessa,
                            item, 
                            objeto
                        });
                }
                t.commit();
                console.log('sucesso -- rotina remessa create');
                return response.json({auth: true, message: 'Sucesso', sucesso: true, codigo: id[0]});
            }
            catch (e) {
                await t.rollback();
                // As you can see, if you don't rethrow here
                // the outer catch is never triggered
				
                console.log('falha -- rotina remessa create 1');
                console.log(e);
                throw e;
            }
        }
        catch (e) {
            //It failed
            console.log('falha -- rotina remessa create 2');
            console.log(e);
            return response.json({auth: true, message: 'Falha', sucesso: false, codigo: 0});
        }
    }
};