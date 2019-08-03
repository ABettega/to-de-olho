require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Deputado = require('./models/Deputado');

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
  })
  .then((x) => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
  })
  .catch((err) => {
    console.error('Error connecting to mongo', err);
  });

// Por Comissão
const baseUrl = 'https://dadosabertos.camara.leg.br/api/v2/deputados?idLegislatura=51';

const arrDeputados = [];

axios.get(`${baseUrl}`, { headers: { Accept: 'application/json' } })
  .then((res) => {
    res.data.dados.forEach(dep => {
      arrDeputados.push(dep);
      Deputado.create({
        id: dep.id,
        nomeDeputado: dep.nome,
        siglaPartido: dep.siglaPartido,
        siglaUf: dep.siglaUf,
        idLegislatura: dep.idLegislatura,
        urlFoto: dep.urlFoto,
        email: dep.email
      })
        .then(() => console.log('deu certo para', dep.nome))
        .catch(e => console.log(e))
    })
  console.log(arrDeputados.length)
  })
  .catch((e) => {
    console.log(e);
});

/*
  id: {type: Number, unique: true},
  nomeDeputado: String,
  siglaPartido: String,
  siglaUf: String,
  idLegislatura: Number,
  urlFoto: String,
  email: String,
  */