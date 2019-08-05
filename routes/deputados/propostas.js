const express = require('express');
const router  = express.Router();
const axios = require('axios').create({});
const async = require('async');

// Pegar todas as propostas de um autor
router.get('/autor/:idAutor', (req, res, next) => {
  let {idAutor} = req.params;
  // di = dataInicial - YYYY-MM-DD, df = dataFinal - YYYY-MM-DD
  let {di = '2000-01-01', df} = req.query;
  let url = `https://dadosabertos.camara.leg.br/api/v2/proposicoes?idDeputadoAutor=${idAutor}&dataApresentacaoInicio=${di}&itens=100&ordem=ASC&ordenarPor=id`;

  if(df) {
    url = `https://dadosabertos.camara.leg.br/api/v2/proposicoes?idDeputadoAutor=${idAutor}&dataApresentacaoInicio=${di}&dataApresentacaoFim=${df}&itens=100&ordem=ASC&ordenarPor=id`;
  }

  let propostasArr = [];
  
  verifyProp(url, propostasArr)
  .then(propostas => res.status(200).json(propostas))
  .catch(err => res.status(400).json({err, message: 'Não conseguimos recuperar as propostas para esse deputado'}));
});

// Pegar Proposta Específica
router.get('/:idProposta', (req, res, next) => {
  let {idProposta} = req.params;
  let url = `https://dadosabertos.camara.leg.br/api/v2/proposicoes/${idProposta}`;
  axios.get(url)
    .then(result => {
      res.status(200).json(result.data.dados)
    })
    .catch(e => console.log(e))
});

const verifyProp = (url, propostas) => { 
  const promise = new Promise((resolve, reject) => {
    resolve(propRecursive(url, propostas));
})
  return promise;
}

const propRecursive = (url, propostas) => {
  return axios.get(url)
  .then(res => {
    res.data.dados.forEach(prop => {
      propostas.push(prop);
    });
    
    let hasNext = checkIfNext(res.data.links);
    if (hasNext !== false) {
      return propRecursive(hasNext, propostas);
    } else {
      return propostas;
    }    
  })
  .catch(err => console.log(err))

}

const checkIfNext = (links) => {
  let hasNext = false;
  links.forEach(link => {
    if (link.rel === 'next') {
      hasNext = link.href;
    }
  })
  return hasNext;
}

module.exports = router;