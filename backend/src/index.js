const express = require('express');
const routes = require('./routes');
var cookieParser = require('cookie-parser'); 
const bodyParser = require('body-parser');
var cors = require('cors');
const app = express();
app.use(cors());

//aqui estamos informando que vamos utilizar formato json para as requisiçoes
//app.use(express.json());
//app.use(bodyParser.urlencoded({ extended: true })); 
//app.use(bodyParser.json());
//app.use(express.json({limit: '50mb'}));
//app.use(express.urlencoded({limit: '50mb'}));
app.use(bodyParser.json({
    limit: '500mb'
 }));
  
  app.use(bodyParser.urlencoded({
    limit: '500mb',
    parameterLimit: 100000,
    extended: true 
  }))
app.use(cookieParser()); 

app.use(routes);
app.listen(3333);
