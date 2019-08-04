const express = require('express');
const router  = express.Router();
const SenadoVotacoesPorComissao = require('../models/SenadoVotacoesPorComissao');
const SenadoMaterias = require('../models/SenadoMaterias');
const SenadoAtual = require('../models/SenadoAtual');
const SenadoAfastado = require('../models/SenadoAfastado');
const SenadoTodos = require('../models/SenadoTodos');
const VotosPorSenador = require('../models/VotosPorSenador');

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/senadores', (req, res) => {
  SenadoAtual.find()
    .then(senadores => res.status(200).json(senadores))
    .catch(e => console.log(e));
});

router.get('/senadores/:id/atuais', (req, res) => {
  const { id } = req.params;
  SenadoAtual.find({ 'IdentificacaoParlamentar.CodigoParlamentar': id })
    .then(senador => res.status(200).json(senador))
    .catch(e => console.log(e));
});

router.get('/senadores/:partido/atuaisporpartido', (req, res) => {
  const { partido } = req.params;
  SenadoAtual.find({ 'IdentificacaoParlamentar.SiglaPartidoParlamentar': partido })
    .then(senador => res.status(200).json(senador))
    .catch(e => console.log(e));
});

router.get('/senadores/:id/votos', (req, res) => {
  const { id } = req.params;
  VotosPorSenador.find({ 'Parlamentar.IdentificacaoParlamentar.CodigoParlamentar': id })
    .then(senadores => res.status(200).json(senadores))
    .catch(e => console.log(e));
});

router.get('/senadores/historico', (req, res) => {
  SenadoTodos.find()
    .then(senadores => res.status(200).json(senadores))
    .catch(e => console.log(e));
});

module.exports = router;
