const express = require('express');
const router  = express.Router();
const SenadoVotacoesPorComissao = require('../models/SenadoVotacoesPorComissao');
const SenadoMaterias = require('../models/SenadoMaterias');
const SenadoAtual = require('../models/SenadoAtual');
const SenadoAfastado = require('../models/SenadoAfastado');
const SenadoTodos = require('../models/SenadoTodos');
const VotosPorSenador = require('../models/VotosPorSenador');
const SenadoComissoesPorSenador = require('../models/SenadoComissoesPorSenador');
const axios = require('axios').create({});

/* GET home page */
router.get('/api/fill', (req, res, next) => {
  let parseString = parser.parseString;
  axios.get('http://legis.senado.leg.br/dadosabertos/senador/lista/atual')
    .then(result => {
      res.status(200).json(result.data.ListaParlamentarEmExercicio)
    })
    .catch(err => res.status(400).json(err));
});

router.get('/senadores', (req, res) => {
  SenadoAtual.find()
    .then((senadores) => {
      const {
        NomeParlamentar,
        CodigoParlamentar,
        SiglaPartidoParlamentar,
        UfParlamentar,
        UrlFotoParlamentar,
      } = senadores.map(senador => senador.IdentificacaoParlamentar);
      const { PrimeiraLegislaturaDoMandato, SegundaLegislaturaDoMandato } = senadores.map(senador => senador.Mandato);
      const Mandatos = [PrimeiraLegislaturaDoMandato, SegundaLegislaturaDoMandato];
      res.status(200).json({ NomeParlamentar, CodigoParlamentar, SiglaPartidoParlamentar, UfParlamentar, UrlFotoParlamentar, Mandatos });
    })
    .catch(e => console.log(e));
});

router.get('/senadores/:id/atuais', (req, res) => {
  const { id } = req.params;
  SenadoAtual.find({ 'IdentificacaoParlamentar.CodigoParlamentar': id })
    .then((senador) => {
      const {
        NomeParlamentar,
        CodigoParlamentar,
        SiglaPartidoParlamentar,
        UfParlamentar,
        UrlFotoParlamentar,
      } = senador.map(sen => sen.IdentificacaoParlamentar);
      const { PrimeiraLegislaturaDoMandato, SegundaLegislaturaDoMandato } = senador.map(sen => sen.Mandato);
      const Mandatos = [PrimeiraLegislaturaDoMandato, SegundaLegislaturaDoMandato];
      res.status(200).json({ NomeParlamentar, CodigoParlamentar, SiglaPartidoParlamentar, UfParlamentar, UrlFotoParlamentar, Mandatos });
    })
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
