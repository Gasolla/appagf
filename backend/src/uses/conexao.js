const knex = require("knex");
const configuracao = require("../../knexfile");
const conexao = knex(configuracao.development);
module.exports = conexao;