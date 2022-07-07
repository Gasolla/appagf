const express = require('express');
require("dotenv-safe").config();
var jwt = require('jsonwebtoken');
const routes = express.Router();
const usuraiosController = require('./controller/usuariosController');
const clientesController = require('./controller/clientesController');
const enderecosController = require('./controller/enderecosController');
const remessaController = require('./controller/remessaController');
const sessionController = require('./controller/sessionController');
const requisicaoController = require('./controller/requisicaoController');
const rotaController = require('./controller/rotaController');
const rotafinalizarController = require('./controller/rotafinalizarController');
const agendamentosController = require('./controller/agendametosController');
const bloqueiController = require('./controller/bloqueioController');
const trocaoleoController = require('./controller/trocaoleoController');
const agendacoletaController = require('./controller/agendacoletaController');
const apienviowebController = require('./controller/apienviowebController')
const veiculoController = require("./controller/veiculoController");

function verifyJWT(req, res, next) {
  //console.log(req.headers.authorization);
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      var token = req.headers.authorization.split(' ')[1];
      if (!token) return res.status(401).json({ auth: false, sucesso: false, message: 'Nenhum token fornecido.' });
      //console.log(token);
      jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) return res.json({ auth: false, sucesso: false, message: 'Falha na autenticação do tokem.' });
        req.userId = decoded.id;
        next();
      });

  } else {
     return res.json({ auth: false, sucesso: false, message: 'Token não reconhecido.' });
    
  }
}

//rotas dos usuarios
routes.post('/usuarios', verifyJWT, usuraiosController.create);
routes.get('/usuarios', verifyJWT, usuraiosController.list);

//rotas dos clientes
routes.post('/clientes', verifyJWT, clientesController.create);
routes.get('/clientes/:usuario', verifyJWT, clientesController.list);
routes.get('/clientes/todos/:usuario', verifyJWT, clientesController.lists);

routes.get('/clientes/index/:id', verifyJWT, clientesController.index);

//rotas dos enderecos
routes.get('/enderecos/:id', verifyJWT, enderecosController.index);


//rotas dos remessa
routes.post('/remessa', verifyJWT, remessaController.create);
routes.get('/remessa/:objeto', verifyJWT, remessaController.index);
routes.get('/remessa', verifyJWT, remessaController.list);
routes.get('/remessa/count/:objeto', verifyJWT, remessaController.count);

//rotas dos requisicao
routes.post('/requisicao', verifyJWT, requisicaoController.create);
routes.get('/requisicao', verifyJWT, requisicaoController.list);

//rotas dos rota
routes.post('/rota', verifyJWT, rotaController.create);
routes.get('/rota/:usuario', verifyJWT, rotaController.list);
routes.get('/rota/index/:id', verifyJWT, rotaController.index);

//rotas dos rotafinaliza
routes.post('/rotafinalizar', verifyJWT, rotafinalizarController.create);
routes.get('/rotafinalizar/:usuario', verifyJWT, rotafinalizarController.list);

//rotas dos agendamento
routes.get('/agendamento/:usuario', verifyJWT, agendamentosController.list);

//rotas dos bloqueio
routes.get('/bloqueio/:usuario', verifyJWT, bloqueiController.index);

//rotas das troca oleo
routes.post('/trocaoleo', verifyJWT, trocaoleoController.create);

//rotas dos session
routes.post('/usuario/login', sessionController.login);
routes.post('/usuario/loginclient', sessionController.loginclient);
routes.get('/usuario/sair', sessionController.sair);
routes.get('/usuario/crypt/:senha', sessionController.index);

//rotas dos remessa
routes.post('/agendacoleta', verifyJWT, agendacoletaController.create);

//rotas dos veiculo
routes.get('/veiculo/:usuario', verifyJWT, veiculoController.list);

//routes.get('/agendacoletaController/:cliente', verifyJWT, agendacoletaController.index);
routes.get('/agendacoleta/:cliente', verifyJWT, agendacoletaController.list);
routes.get('/agendacoleta/count/:cliente/:data', verifyJWT, agendacoletaController.count);
routes.get('/agendacoletadata', verifyJWT, agendacoletaController.data);


//rotas dos api
routes.post('/apienvioweb/:apikey', apienviowebController.create);


module.exports = routes;