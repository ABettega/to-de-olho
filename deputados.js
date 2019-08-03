require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Deputado = require('./models/Deputado');
const ProposicaoDep = require('./models/ProposicaoDep');

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
const basePart = 'https://dadosabertos.camara.leg.br/api/v2/partidos?itens=100&ordem=ASC&ordenarPor=sigla';
const baseProp = 'https://dadosabertos.camara.leg.br/api/v2/proposicoes?ano=2019,2018,2017,2016,2015,2014,2013,2012,2011,2010,2009,2008,2007,2006,2005,2004,2003,2002,2001&ordem=ASC&ordenarPor=id&itens=100';

const arrDeputados = [];

// // COLOCA OS DEPUTADOS NA BASE (Deve-se mudar no baseUrl da última legislatura até a 51
// // necessariamente nessa ordem)
// axios.get(`${baseUrl}`, { headers: { Accept: 'application/json' } })
//   .then((res) => {
//     res.data.dados.forEach(dep => {
//       arrDeputados.push(dep);
//       Deputado.create({
//         id: dep.id,
//         nomeDeputado: dep.nome,
//         siglaPartido: dep.siglaPartido,
//         siglaUf: dep.siglaUf,
//         idLegislatura: dep.idLegislatura,
//         urlFoto: dep.urlFoto,
//         email: dep.email
//       })
//         .then()
//         .catch(e => console.log(e))
//     })
//   console.log(arrDeputados.length)
//   })
//   .catch((e) => {
//     console.log(e);
// });

// // Coloca o nome do partido no modelo dos deputados
// axios.get(`${basePart}`, { headers: { Accept: 'application/json' } })
//   .then((res) => {
//     res.data.dados.forEach(partido => {
//       console.log(partido.sigla);
//       Deputado.updateMany({siglaPartido: partido.sigla}, {$set: {nomePartido: partido.nome}})
//       .then(res => console.log(res))
//       .catch((e) => {
//         console.log(e);
//     });
//     });
//   })
//   .catch((e) => {
//     console.log(e);
// });

// Pega todas as proposições até 2001
const addProp = (url) => {
  axios.get(`${url}`, { headers: { Accept: 'application/json' } })
    .then((res) => {
  
      res.data.dados.forEach(prop => {
        ProposicaoDep.create({
          id: prop.id,
          siglaTipo: prop.siglaTipo,
          codTipo: prop.codTipo,
          numero: prop.numero,
          ano: prop.ano,
          ementa: prop.ementa,
        }).then().catch(e => console.log(e));
      });

      console.log('rodou');

      res.data.links.forEach(link => {
        if (link.rel === 'next') {
          addProp(link.href);
        }
      })
    })
    .catch((e) => {
      console.log(e);
  });
}

addProp(baseProp);

/*
  id: {type: Number, unique: true},
  nomeDeputado: String,
  siglaPartido: String,
  siglaUf: String,
  idLegislatura: Number,
  urlFoto: String,
  email: String,
  */