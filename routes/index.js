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
const sessoes = require('../models/SenadoSessoes');
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
    .then(senadores => res.status(200).json(senadores))
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

router.get('/senadores/:id/sessoes/', (req, res) => {
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
  let presencaPorcentagem = 0;
  let votosRegistrados = 0;
  let uf = '';
  let diasDeLicenca = 0;
  let diasEmMissao = 0;
  let diasEmAP = 0;
  let obstrucoes = 0;
  let naoVotou = 0;
  let totalDeSessoes = 0;
  let sigla = '';
  let UrlFotoParlamentar = '';
  const mandatos = {
    dataInicio: [],
    dataFim: [],
  };

  const sum = (obj) => {
    return Object.keys(obj).reduce((acc, key) => acc + parseFloat(obj[key] || 0), 0);
  };

  const getDados = sessoes.SenadoSessoes.find()
    .then((seshs) => {
      seshs.map((sessao) => {
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
              UrlFotoParlamentar = votPar.Foto;
              totalDeSessoes = sum(votoSenador);
              totalDeVotos = sum(votoSenador) - (votoSenador.LA + votoSenador.LAP + votoSenador.LC + votoSenador.LS + votoSenador.LG + votoSenador.NCom + votoSenador['P-OD'] + votoSenador.AP);
              diasDeLicenca = votoSenador.LA + votoSenador.LAP + votoSenador.LC + votoSenador.LS + votoSenador.LG;
              diasEmMissao = votoSenador.MIS;
              presencaPorcentagem = Number(((1 - (faltasSenador / totalDeVotos)) * 100).toFixed(0));
              votosRegistrados = Number(((1 - (votoSenador['P-NRV'] / totalDeVotos)) * 100).toFixed(0));
              diasEmAP = votoSenador.AP;
              obstrucoes = votoSenador['P-OD'];
              naoVotou = votoSenador['P-NRV'];
            }
          });
        });
      });
    })
    .catch(e => console.log(e));

  // Pega mandatos
  const getMandatos = axios.get(`http://legis.senado.leg.br/dadosabertos/parlamentar/${id}`)
    .then((response) => {
      if (response.data.parlamentar.exercicios.exercicio.length === undefined) {
        mandatos.dataInicio = response.data.parlamentar.exercicios.exercicio.dataInicio;
        mandatos.dataFim = response.data.parlamentar.exercicios.exercicio.dataFim;
        // mandatos.tipoCausaFimExercicio = response.data.parlamentar.exercicios.exercicio.tipoCausaFimExercicio;
      } else {
        mandatos.dataInicio = response.data.parlamentar.exercicios.exercicio.map(ex => ex.dataInicio);
        mandatos.dataFim = response.data.parlamentar.exercicios.exercicio.map(ex => ex.dataFim);
        // mandatos.tipoCausaFimExercicio = response.data.parlamentar.exercicios.exercicio.map(ex => ex.tipoCausaFimExercicio);
      }
    })
    .catch(e => console.log(e));

  Promise.all([getDados, getMandatos])
    .then(() => {
      res.status(200).json({
        nome,
        sigla,
        uf,
        voto: votoSenador,
        totalDeVotos,
        faltasSenador,
        votosRegistrados,
        presencaPorcentagem,
        diasDeLicenca,
        totalDeSessoes,
        diasEmMissao,
        diasEmAP,
        obstrucoes,
        naoVotou,
        mandatos,
        UrlFotoParlamentar,
      });
    })
    .catch(e => console.log(e));
});

router.get('/senadores/historico/sessoes/:id', (req, res) => {
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
  let presencaPorcentagem = 0;
  let votosRegistrados = 0;
  let uf = '';
  let totalDeSessoes = 0;
  let diasDeLicenca = 0;
  let diasEmMissao = 0;
  let diasEmAP = 0;
  let obstrucoes = 0;
  let naoVotou = 0;
  let sigla = '';
  let UrlFotoParlamentar = '';
  const mandatos = {
    dataInicio: [],
    dataFim: [],
  };

  const sum = (obj) => {
    return Object.keys(obj).reduce((acc, key) => acc + parseFloat(obj[key] || 0), 0);
  };

  const getDados = sessoes.SenadoSessoesHistorico.find()
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
              UrlFotoParlamentar = votPar.Foto;
              totalDeSessoes = sum(votoSenador);
              totalDeVotos = sum(votoSenador) - (votoSenador.LA + votoSenador.LAP + votoSenador.LC + votoSenador.LS + votoSenador.LG + votoSenador.NCom + votoSenador['P-OD'] + votoSenador.AP);
              diasDeLicenca = votoSenador.LA + votoSenador.LAP + votoSenador.LC + votoSenador.LS + votoSenador.LG;
              diasEmMissao = votoSenador.MIS;
              presencaPorcentagem = ((1 - (faltasSenador / totalDeVotos)) * 100).toFixed(0);
              votosRegistrados = ((1 - (votoSenador['P-NRV'] / totalDeVotos)) * 100).toFixed(0);
              diasEmAP = votoSenador.AP;
              obstrucoes = votoSenador['P-OD'];
              naoVotou = votoSenador['P-NRV'];
            }
          });
        });
      });
    })
    .catch(e => console.log(e));

  // Pega mandatos
  const getMandatos = axios.get(`http://legis.senado.leg.br/dadosabertos/parlamentar/${id}`)
    .then((response) => {
      if (response.data.parlamentar.exercicios.exercicio.length === undefined) {
        mandatos.dataInicio = response.data.parlamentar.exercicios.exercicio.dataInicio;
        mandatos.dataFim = response.data.parlamentar.exercicios.exercicio.dataFim;
        // mandatos.tipoCausaFimExercicio = response.data.parlamentar.exercicios.exercicio.tipoCausaFimExercicio;
      } else {
        mandatos.dataInicio = response.data.parlamentar.exercicios.exercicio.map(ex => ex.dataInicio);
        mandatos.dataFim = response.data.parlamentar.exercicios.exercicio.map(ex => ex.dataFim);
        // mandatos.tipoCausaFimExercicio = response.data.parlamentar.exercicios.exercicio.map(ex => ex.tipoCausaFimExercicio);
      }
    })
    .catch(e => console.log(e));

  Promise.all([getDados, getMandatos])
    .then(() => {
      res.status(200).json({
        nome,
        uf,
        sigla,
        UrlFotoParlamentar,
        historico: {
          voto: votoSenador,
          totalDeVotos,
          faltasSenador,
          votosRegistrados,
          totalDeSessoes,
          presencaPorcentagem,
          diasDeLicenca,
          diasEmMissao,
          diasEmAP,
          obstrucoes,
          naoVotou,
          mandatos,
        },
      });
    })
    .catch(e => console.log(e));
});

router.get('/senadores/historico', (req, res) => {
  SenadoTodos.find()
    .then((senadores) => {
      SenadoAtual.find()
        .then((senadoresAtuais) => {
          const todosSenadores = senadores.concat(senadoresAtuais);
          console.log(todosSenadores);
          res.status(200).json({ todosSenadores });
        })
        .catch(e => console.log(e));
    })
    .catch(e => console.log(e));
});

module.exports = router;
