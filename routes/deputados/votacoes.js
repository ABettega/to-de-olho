const express = require('express');
const router  = express.Router();
const SessaoCamara = require('../../models/SessaoCamara');

router.get('/:idVotacao', (req, res, next) => {
  SessaoCamara.find({"votacoes._id": req.params.idVotacao}, {listaDePresenca: 0, _id: 0}).
  then(sessao => {
    // res.status(200).json(sessao);
    if(sessao.length > 0) {
      sessao[0].votacoes.forEach(votacao => {
        if (String(votacao._id) === req.params.idVotacao) {
          res.status(200).json({
            document: votacao.documento, 
            proposicao: votacao.proposicao, 
            modo: votacao.modo,
            votos: votacao.votos,
            data: sessao.dataInicio,
          });
        }
      });
    }
    else {
      res.status(200).json({message: 'Não encontramos essa votação!'});
    }
  })
  .catch(e => res.status(400).json({message: 'Erro no DB!'}));
});

module.exports = router;