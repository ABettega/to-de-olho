const express = require('express');
const router  = express.Router();
const SenadoVotacoesPorComissao = require('../models/SenadoVotacoesPorComissao');
const SenadoMaterias = require('../models/SenadoMaterias');
const SenadoAtual = require('../models/SenadoAtual');
const SenadoAfastado = require('../models/SenadoAfastado');
const SenadoTodos = require('../models/SenadoTodos');
const VotosPorSenador = require('../models/VotosPorSenador');
const SenadoComissoesPorSenador = require('../models/SenadoComissoesPorSenador');

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
  const sigla = partido.toUpperCase();
  SenadoAtual.find({ 'IdentificacaoParlamentar.SiglaPartidoParlamentar': sigla })
    .then(senador => res.status(200).json(senador))
    .catch(e => console.log(e));
});

router.get('/senadores/:id/votos', (req, res) => {
  const { id } = req.params;
  VotosPorSenador.find({ 'Parlamentar.IdentificacaoParlamentar.CodigoParlamentar': id })
    .then(senadores => res.status(200).json(senadores))
    .catch(e => console.log(e));
});

router.get('/senadores/:id/comissoes', (req, res) => {
  const { id } = req.params;
  const comissoes = [
    'CAE',
    'CAS',
    'CCJ',
    'CCT',
    'CDH',
    'CDIR',
    'CDR',
    'CE',
    'CI',
    'CMA',
    'CRA',
    'CRE',
    'CSF',
    'CTFC',
    'CCAI',
    'CMCF',
    'CMCPLP',
    'CMCVM',
    'CMMC',
    'CMO',
    'FIPA',
  ];
  SenadoComissoesPorSenador.find({ 'MembroComissaoParlamentar.Parlamentar.IdentificacaoParlamentar.CodigoParlamentar': id })
    .then(data => res.status(200).json({ data, comissoes }))
    .catch(e => console.log(e));
    // campo de filtro pelas comissoes fixas (array comissoes) é
    // MembroComissaoParlamentar.Parlamentar.MembroComissoes.Comissao[IdentificacaoComissao.SiglaComissao]
});

router.get('/senadores/:id/comissoes/votos', (req, res) => {
  const { id } = req.params;
  SenadoVotacoesPorComissao.find({ 'Votos.Voto': { $elemMatch: { CodigoParlamentar: id } } })
    .then(votos => res.status(200).json(votos))
    .catch(e => console.log(e));
})

router.get('/senadores/historico', (req, res) => {
  SenadoTodos.find()
    .then(senadores => res.status(200).json(senadores))
    .catch(e => console.log(e));
});

module.exports = router;
