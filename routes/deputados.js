const express = require('express');
const router  = express.Router();
const axios = require('axios').create({});
const async = require('async');

// Pegar todas as propostas de um autor
router.get('/propostas/:idAutor', (req, res, next) => {
  let {idAutor} = req.params;
  // di = dataInicial - YYYY-MM-DD, df = dataFinal - YYYY-MM-DD
  let {di = '2000-01-01', df} = req.query;
  let url = `https://dadosabertos.camara.leg.br/api/v2/proposicoes?idDeputadoAutor=${idAutor}&dataApresentacaoInicio=${di}&itens=100&ordem=ASC&ordenarPor=id`;

  if(df) {
    url = `https://dadosabertos.camara.leg.br/api/v2/proposicoes?idDeputadoAutor=${idAutor}&dataApresentacaoInicio=${di}&dataApresentacaoFim=${df}&itens=100&ordem=ASC&ordenarPor=id`;
  }

  let propostasArr = [];
  
  verifyProp(url, propostasArr)
  .then(propostas => { console.log(propostas);
    res.status(200).json(propostas.length)
  })
  .catch(err => res.status(400).json({err, message: 'Não conseguimos recuperar as propostas para esse deputado'}));
  ;
});

// Pegar Proposta Específica
router.get('/proposta/:idProposta', (req, res, next) => {
  let {idAutor} = req.params;
  // st = siglaTipo, num = Numero
  let {st, num, ano} = req.query;
});

// const dateTreater = data => {
//   console.log('DATA PORRA', data)
//   if (data = '') {
//     return JSON.stringify(new Date()).split('T')[0];
//   }
//   console.log('SPLIT CARAIO', JSON.stringify(data).split('T')[0])
//   return JSON.stringify(data).split('T')[0];
// }

const verifyProp = (url, propostas) => { 
  const promise = new Promise((resolve, reject) => {
    axios.get(url)
    .then(res => {
      res.data.dados.forEach(prop => {
        propostas.push(prop);
       });

       let next = false;
       res.data.links.forEach(link => {
         if (link.rel === 'next') {
           next = true;
           verifyProp(link.href, propostas);
         }
       });

       //  console.log(next);
       if (!next) {
        //  console.log(propostas);
         resolve(propostas);
       }
      })
      .catch(err => reject(err))
})
  return promise;
}

module.exports = router;