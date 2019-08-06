require('dotenv').config();
const mongoose = require('mongoose');
const sessaoCamara = require('./models/SessaoCamara');

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

sessaoCamara.find({}, {dataInicio: 1, _id: 0})
.then(sessoes => {
  console.log(sessoes);
})
.catch();

// // Corrige a data do crawl de "dd/mm/aaaa" para IsoDate
// db.sessoesdeps.find().forEach( function(sessao){
//   const transformToDate = (date, hour) => {
//     date = `${date.split('/')[2]}-${date.split('/')[1]}-${date.split('/')[0]}`;
//     return new Date(`${date}T${hour}:00.000Z`);
//   }

//   db.sessoesdeps.update({_id: sessao._id}, {
//   $set: {
//     dataInicio: transformToDate(sessao.dataInicio, sessao.horaInicio), 
//     dataFim: transformToDate(sessao.dataFim, sessao.horaFim),
//   }, 
//   $unset: {
//     horaInicio: 1,
//     horaFim: 1,
//   }
// })
// });

// // Tira o '(*)' que o crawl colocou nos deputados em algumas listas de presença
// db.sessoesdeps.find().forEach(sessao => {
//   const arr = [...sessao.listaDePresenca];
//   db.sessoesdeps.update({_id: sessao._id}, {$set: {
//     listaDePresenca: arr.map(dep => dep.replace(' (*)', ''))
//   }});
// });