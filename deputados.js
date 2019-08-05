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

// // Por Comissão
// const baseUrl = 'https://dadosabertos.camara.leg.br/api/v2/deputados?idLegislatura=56';

const arrDeputados = [];

axios.get(`${baseUrl}`, { headers: { Accept: 'application/json' } })
  .then((res) => {
    res.data.dados.forEach(dep => {
      Deputado.findOneAndUpdate({id: dep.id}, {
        id: dep.id,
        nomeDeputado: dep.nome,
        siglaPartido: dep.siglaPartido,
        siglaUf: dep.siglaUf,
        $push: {idLegislatura: dep.idLegislatura},
        urlFoto: dep.urlFoto,
        email: dep.email,
      }, {new: true, upsert: true})
      .then(() => console.log(dep.nome))
      .catch(e => console.log(e));
    })
  })
  .catch((e) => {
    console.log(e);
});