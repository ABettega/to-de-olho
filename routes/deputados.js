const express = require('express');
const router  = express.Router();
const axios = require('axios').create({});
const async = require('async');

// Pegar todas as propostas de um autor
router.get('/propostas/:idAutor', (req, res, next) => {
  let {idAutor} = req.params;
  // di = dataInicial - YYYY-MM-DD, df = dataFinal - YYYY-MM-DD
  let {di = '2000-01-01', df = ''} = req.query;

  let proposicoesArr = [];

  let url = `https://dadosabertos.camara.leg.br/api/v2/proposicoes?idDeputadoAutor=${idAutor}&dataApresentacaoInicio=${di}&dataApresentacaoFim=${df}&itens=100&ordem=ASC&ordenarPor=id`;

  verifyProp(url)
});

// Pegar Proposta Específica
router.get('/proposta/:idProposta', (req, res, next) => {
  let {idAutor} = req.params;
  // st = siglaTipo, num = Numero
  let {st, num, ano} = req.query;
});

const dateTreater = data => {
  console.log('DATA PORRA', data)
  if (data = '') {
    return JSON.stringify(new Date()).split('T')[0];
  }
  console.log('SPLIT CARAIO', JSON.stringify(data).split('T')[0])
  return JSON.stringify(data).split('T')[0];
}

const verifyProp = url => {
  axios.get(url)
  .then(res => {
      let arrFunc = [];
      res.data.dados.forEach(prop => {
        arrFunc.push(() => {
          let uri = prop.uri;
          axios.get(uri)
            .then(result => {
              console.log(result.data)
            })
            .catch(e => console.log(e))
        })
      })
      async.series(arrFunc, () => console.log('rodou carai'))
    })
    .catch(err => console.log('err'))
}

module.exports = router;