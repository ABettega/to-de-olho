/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
const express = require('express');
const router  = express.Router();
const SenadoVotacoesPorComissao = require('../models/SenadoVotacoesPorComissao');
const SenadoMaterias = require('../models/SenadoMaterias');
const SenadoAtual = require('../models/SenadoAtual');
const SenadoAfastado = require('../models/SenadoAfastado');
const SenadoTodos = require('../models/SenadoTodos');
const VotosPorSenador = require('../models/VotosPorSenador');
const SenadoComissoesPorSenador = require('../models/SenadoComissoesPorSenador');
const SenadoSessoes = require('../models/SenadoSessoes');
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
});

router.get('/senadores/sessoes/:id', (req, res) => {
  let { id } = req.params;
  id = Number(id);
  let nome = '';
  const votoSenador = {
    'P-NRV': 0,
    'P-OD': 0,
    REP: 0,
    NCom: 0,
    AP: 0,
    LA: 0,
    LAP: 0,
    LC: 0,
    LS: 0,
    LG: 0,
    NA: 0,
    MIS: 0,
    AUS: 0,
    Sim: 0,
    Não: 0,
    Votou: 0,
  };
  let faltasSenador = 0;
  let totalDeVotos = 0;
  let presenca = '';
  let votosRegistrados = '';
  let uf = '';
  let legislaturas = '';
  let diasDeLicenca = 0;
  let diasEmMissao = 0;
  let diasEmAP = 0;
  let obstrucoes = 0;
  let naoVotou = 0;
  let sigla = '';

  const sum = (obj) => {
    return Object.keys(obj).reduce((acc, key) => acc + parseFloat(obj[key] || 0), 0);
  };

  SenadoSessoes.find()
    .then((sessoes) => {
      sessoes.map((sessao) => {
        return sessao.Votacao.map((vot) => {
          return vot.Votos.VotoParlamentar.map((votPar) => {
            if (votPar.CodigoParlamentar === id) {
              nome = votPar.NomeParlamentar;
              const voto = votPar.Voto.replace(' ', '');
              if (votoSenador[voto]) {
                votoSenador[voto] += 1;
              } else {
                votoSenador[voto] = 1;
              }
              sigla = votPar.SiglaPartido;
              uf = votPar.SiglaUF;
              faltasSenador = votoSenador.NCom;
              totalDeVotos = sum(votoSenador) - (votoSenador.LA + votoSenador.LAP + votoSenador.LC + votoSenador.LS + votoSenador.LG + votoSenador.NCom + votoSenador['P-OD'] + votoSenador.AP);
              diasDeLicenca = votoSenador.LA + votoSenador.LAP + votoSenador.LC + votoSenador.LS + votoSenador.LG;
              diasEmMissao = votoSenador.MIS;
              presenca = `${((1 - (faltasSenador / totalDeVotos)) * 100).toFixed(1)}% (${(totalDeVotos - faltasSenador)} / ${totalDeVotos})`;
              votosRegistrados = `${((1 - (votoSenador['P-NRV'] / totalDeVotos)) * 100).toFixed(1)} %`;
              diasEmAP = votoSenador.AP;
              obstrucoes = votoSenador['P-OD'];
              naoVotou = votoSenador['P-NRV'];
            }
          });
        });
      });
      res.status(200).json({
        nome,
        sigla,
        uf,
        voto: votoSenador,
        totalDeVotos,
        faltasSenador,
        votosRegistrados,
        presenca,
        diasDeLicenca,
        diasEmMissao,
        diasEmAP,
        obstrucoes,
        naoVotou,
      });
    })
    .catch(e => console.log(e));
});

router.get('/senadores/historico', (req, res) => {
  SenadoTodos.find()
    .then(senadores => res.status(200).json(senadores))
    .catch(e => console.log(e));
});

module.exports = router;
