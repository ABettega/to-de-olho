require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const passport = require('./config/passport')
const session = require('express-session');
const cors = require('cors');

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(x => {
    console.log(`Conectado ao MongoDB! Nome da Database: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// default value for title local
app.locals.title = 'Tô de Olho!';

app.use(session({
  secret: "rest-api-nitido",
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000']
}));

app.use('/api/deputados/votacoes/', require('./routes/deputados/votacoes'));
app.use('/api/deputados/sessoes/', require('./routes/deputados/sessoes'));
app.use('/api/deputados/propostas/', require('./routes/deputados/propostas'));
app.use('/api/deputados/', require('./routes/deputados/deputados'));
app.use('/api/auth/', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'))
app.use('/api/', require('./routes/index'));

module.exports = app;