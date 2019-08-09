const express = require('express');
const router  = express.Router();
const SessaoCamara = require('../../models/SessaoCamara');

const showDate = date => {
  date = date.split('-');
  return `${date[2]}/${date[1]}/${date[0]}`;
}

router.get('/:idVotacao', (req, res, next) => {
  SessaoCamara.find({"votacoes._id": req.params.idVotacao}, {listaDePresenca: 0, _id: 0}).
  then(sessao => {
    if(sessao.length > 0) {
      sessao[0].votacoes.forEach(votacao => {
        if (String(votacao._id) === req.params.idVotacao) {
          res.status(200).json({
            documento: votacao.documento, 
            proposicao: votacao.proposicao, 
            modo: votacao.modo,
            votos: votacao.votos,
            data: showDate(JSON.stringify(sessao[0].dataInicio).slice(1, 11)),
          });
        }
      });
    }
    else {
      res.status(200).json({message: 'Não encontramos essa votação!'});
    }
  })
  .catch(e => res.status(400).json({message: `Ops! Tivemos um erro: ${e}`}));
});

module.exports = router;