const conexao = require('../uses/conexao');
const moment = require("moment");
require("dotenv-safe").config();
var jwt = require('jsonwebtoken');
const crypto = require('crypto');

const DADOS_CRIPTOGRAFAR = {
    algoritmo: "aes256",
    codificacao: "utf8",
    segredo: "SRM@VED",
    tipo: "hex"
};

function descriptografar(senha) {
    const decipher = crypto.createDecipher(DADOS_CRIPTOGRAFAR.algoritmo, DADOS_CRIPTOGRAFAR.segredo);
    decipher.update(senha, DADOS_CRIPTOGRAFAR.tipo);
    return decipher.final();
};

function criptografar(senha) {
    const cipher = crypto.createCipher(DADOS_CRIPTOGRAFAR.algoritmo, DADOS_CRIPTOGRAFAR.segredo);
    cipher.update(senha);
    return cipher.final(DADOS_CRIPTOGRAFAR.tipo);
};

module.exports = {
    async login(request, response) {
        //esse teste abaixo deve ser feito no seu banco de dados
        const { usuario, password } = request.body;
        const usuarios = await conexao('usuarios')
            .where('usuario', usuario)
            .select('senha', 'id', 'obrigatorioagenda');
        if (usuarios.length == 0) {
            return response.json({ auth: false, token: null, message: 'Usuario não existe!' });
        }
        const [{ senha, id,  obrigatorioagenda}] = usuarios;
        console.log(criptografar(password).toUpperCase());
        console.log('rotina session login -- usuario:' + id);
        console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        if (senha === criptografar(password).toUpperCase()) {
            //auth ok
            var token = jwt.sign({ id }, process.env.SECRET, {
                expiresIn: 43200 // 12 horas
            });
            return response.json({ auth: true, token: token, id: id, obrigatorioagenda: obrigatorioagenda });
        }

        return response.json({ auth: false, token: null, message: 'Login inválido!' });
    },
    async sair(request, response) {
        console.log('rotina session sair');
        console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        return response.json({ auth: false, token: null, message: 'logouf' });
    },
    async loginclient(request, response) {
        //esse teste abaixo deve ser feito no seu banco de dados
        const { usuario, password } = request.body;
        const usuarios = await conexao('usercli')
            .join('clientes', 'clientes.id', '=', 'usercli.cliente_id')
            .join('usuarios', 'usuarios.id', '=', 'clientes.usuario')
            .where('usercli.usuario', usuario)
            .select('usercli.senha', 'usercli.id', 
                    'usercli.cliente_id as cliente', 
                    'clientes.usuario as motorista', 
                    'usuarios.userfone', 
                    'usuarios.agffone', 
                    'clientes.nome as clinome');
        if (usuarios.length == 0) {
            return response.json({ auth: false, token: null, message: 'Usuario não existe!' });
        }
        const [{ senha, id }] = usuarios;
        console.log(criptografar(password).toUpperCase());
        console.log('rotina session login -- usuario:' + id);
        console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        if (senha === criptografar(password).toUpperCase()) {
            //auth ok
            var token = jwt.sign({ id }, process.env.SECRET, {
                expiresIn: 43200 // 12 horas
            });
            return response.json({ auth: true, token: token, usuario: usuarios[0] });
        }

        return response.json({ auth: false, token: null, message: 'Login inválido!' });
    },async index(request, response) {
        //esse teste abaixo deve ser feito no seu banco de dados
        const { senha } = request.params;
        console.log(criptografar(senha).toUpperCase());
        console.log('rotina session index');
        console.log(moment().local().format('yyyy-MM-DD HH:mm:ss'));
        return response.json({ auth: true,  senha: criptografar(senha).toUpperCase() });
    },
};