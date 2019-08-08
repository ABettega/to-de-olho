const express = require('express');

const router = express.Router();
const axios = require('axios');
const Deputado = require('../../models/Deputado');
const SessaoCamara = require('../../models/SessaoCamara');

const toTitleCase = (str) => {
  const arr = ['da', 'das', 'de', 'do', 'dos', 'e'];
  return str.toLowerCase().split(' ').map(a => arr.includes(a) ? a : a[0].toUpperCase() + a.slice(1)).join(' ');
}

const checaPresenca = (sessoes, nomeDeputado, situacao) => {
  const resultado = [];

  sessoes.forEach(sessao => {
    const {_id, nomeDaSessao} = sessao;
    if(sessao.listaDePresenca.includes(toTitleCase(nomeDeputado))) {
      if (situacao === 'presenca') {
        resultado.push({_id, nomeDaSessao});
      }
    } else if (situacao === 'ausencia') {
      resultado.push({_id, nomeDaSessao});
    }
  });

  return resultado;
}

const checaVotos = (sessoes, nomeDeputado, situacao) => {
  const resultado = [];

  sessoes.forEach(sessao => {
    const {dataInicio, votacoes} = sessao;
    if(votacoes.length > 0) {
      votacoes.forEach(votacao => {
        let flag = 0;
        votacao.votos.forEach(voto => {
          if(voto.deputado === toTitleCase(nomeDeputado)) {
            switch (voto.voto) {
              case 'Sim':
              case 'Não':
              case 'Art. 17':
                if(situacao === 'votos') {
                  resultado.push({_id: votacao._id, dataInicio, documento: votacao.documento, proposicao: votacao.proposicao});
                }
                break;
              case 'Obstrução':
                if(situacao === 'obstrucao') {
                  resultado.push({_id: votacao._id, dataInicio, documento: votacao.documento, proposicao: votacao.proposicao});
                }
                break;
              case 'Abstenção':
                if(situacao === 'abstencao') {
                  resultado.push({_id: votacao._id, dataInicio, documento: votacao.documento, proposicao: votacao.proposicao});
                }
                break;
              default:
                break;
            }
          } else {
            flag += 1;
          }
        });
        if (flag === votacao.votos.length && situacao === 'naovot') {
          resultado.push({_id: votacao._id, dataInicio, documento: votacao.documento, proposicao: votacao.proposicao});
        }
      })
    }
  });

  return resultado;
}

// Pega todas as sessões que um deputado estava presente ou faltou
router.post('/info/:legis/:situacao', (req, res, next) => {
  const {legislaturas, nomeDeputado} = req.body;
  const arr = [];

  const limit = 1000;
  (async () => {
    for (let x = 0; x < legislaturas.length; x += 1) {
      let skip = 0;
      while (skip !== false) {
        await SessaoCamara.find(
          { dataInicio: { $gte: new Date(legislaturas[x].dataInicio), $lte: new Date(legislaturas[x].dataFim) }}, 
          {},
          { limit, skip: limit * skip })
          .then(sessoes => {

            if (sessoes.length > 0) {
              skip += 1;
            } else {
              skip = false;
            }
            if(req.params.situacao === 'presenca' || req.params.situacao === 'ausencia')
              arr.push(...checaPresenca(sessoes, nomeDeputado, req.params.situacao));
              arr.push(...checaVotos(sessoes, nomeDeputado, req.params.situacao))
          })
          .catch(e => res.status(400).json(e));
        }
      }
        await res.status(200).json(arr);
    })();
});

//Pegar a presença e votos da legislatura atual de um deputado
router.get('/:idDeputado/atual', (req, res, next) => {
  let { idDeputado } = req.params;
  
  Deputado.findOne({ id: idDeputado })
  .then(dep => {
      let baseUrl = 'https://dadosabertos.camara.leg.br/api/v2/legislaturas?ordem=DESC&itens=1';

      axios.get(baseUrl)
        .then(legislaturas => {
          // const legislaturas = {
          //   data: {
          //     dados: [{
          //       id: 56,
          //       dataInicio: '2019-01-01',
          //       dataFim: '2022-12-31',
          //     }],
          //   }
          // }
          const legis = legislaturas.data.dados[0];
          delete legis['uri'];
          if(dep.idLegislatura.sort((a, b) => b - a)[0] !== legis.id) {
            res.status(200).json({});
            return;
          }

          let resultado = {
            nomeDeputado: dep.nomeDeputado,
            uf: dep.siglaUf,
            partido: dep.siglaPartido,
            foto: dep.urlFoto,
            legislatura: legis,
            sessoes: {
              total: 0,
              presente: 0,
              percentualPresenca: 0,
            },
            votos: {
              sim: 0,
              nao: 0,
              obstrucao: 0,
              abstencao: 0,
              art17: 0,
              totalDeVotos: 0,
              totalDeVotacoes: 0,
              percentualDeVotos: 0,
            }
          };

          SessaoCamara.find(
            { dataInicio: { $gte: new Date(legis.dataInicio), $lte: new Date(legis.dataFim) } })
            .then(sessoes => {
              // Aggregate de presença/falta
              sessoes.forEach(sessao => {
                resultado.sessoes.total += 1;
                if (sessao.listaDePresenca.includes(toTitleCase(dep.nomeDeputado))) {
                  resultado.sessoes.presente += 1;
                }

                // Aggregate de Sim/Não/Obstrução/Art. 17/Abstenção
                if (sessao.votacoes.length > 0) {
                  sessao.votacoes.forEach(votacao => {
                    resultado.votos.totalDeVotacoes += 1;
                    votacao.votos.forEach(voto => {
                      if (voto.deputado.toUpperCase() === dep.nomeDeputado.toUpperCase()) {
                        switch (voto.voto) {
                          case 'Sim':
                            resultado.votos.sim += 1;
                            break;
                          case 'Não':
                            resultado.votos.nao += 1;
                            break;
                          case 'Obstrução':
                            resultado.votos.obstrucao += 1;
                            break;
                          case 'Abstenção':
                            resultado.votos.abstencao += 1;
                            break;
                          case 'Art. 17':
                            resultado.votos.art17 += 1;
                            break;
                          default:
                            break;
                        }
                      }
                    });
                  });
                }
              });
              const { sim, nao, art17 } = resultado.votos;
              resultado.votos.totalDeVotos += sim + nao + art17;
              resultado.sessoes.percentualPresenca = ((resultado.sessoes.presente / resultado.sessoes.total) * 100).toFixed(0) + '%';
              resultado.votos.percentualDeVotos = ((resultado.votos.totalDeVotos / resultado.votos.totalDeVotacoes) * 100).toFixed(0) + '%';
              res.status(200).json(resultado);
            })
            .catch(e => console.log(e));
        })
        .catch(e => console.log(e));
    })
    .catch(e => console.log(e));
});

// Pegar todo o histórico de presença e votos de um deputado
router.get('/:idDeputado/historico', (req, res, next) => {
  let { idDeputado } = req.params;

  Deputado.findOne({ id: idDeputado })
    .then((dep) => {
      let baseUrl = 'https://dadosabertos.camara.leg.br/api/v2/legislaturas?ordem=ASC&ordenarPor=id&id=';
      dep.idLegislatura.forEach((legis, idx) => {
        baseUrl += legis;
        if (idx < dep.idLegislatura.length - 1) {
          baseUrl += ',';
        }
      });

      axios.get(baseUrl)
        .then(legislaturas => {
          // const legislaturas = {
          //   data: {
          //     dados: [{
          //       id: 56,
          //       dataInicio: '2019-01-01',
          //       dataFim: '2022-12-31',
          //     }, {
          //       id: 55,
          //       dataInicio: '2015-01-01',
          //       dataFim: '2018-12-31',
          //     }
          //   ],
          //   }
          // }
          legislaturas.data.dados.forEach(legis => {
            delete legis['uri'];
          })

          const resultado = {
            nomeDeputado: dep.nomeDeputado,
            uf: dep.siglaUf,
            partido: dep.siglaPartido,
            foto: dep.urlFoto,
            legislaturas: legislaturas.data.dados,
            sessoes: {
              total: 0,
              presente: 0,
              percentualPresenca: 0,
            },
            votos: {
              sim: 0,
              nao: 0,
              obstrucao: 0,
              abstencao: 0,
              art17: 0,

              totalDeVotos: 0,
              totalDeVotacoes: 0,
              percentualDeVotos: 0,
            }
          };

          const limit = 500;
          const legis = legislaturas.data.dados;

          (async () => {
            for (let x = 0; x < legis.length; x += 1) {
              let skip = 0;
              while (skip !== false) {
                await SessaoCamara.find(
                  { dataInicio: { $gte: new Date(legis[x].dataInicio), $lte: new Date(legis[x].dataFim) } }, 
                  {},
                  { limit, skip: limit * skip })
                  .then((sessoes) => {
                    if (sessoes.length > 0) {
                      skip += 1;
                    } else {
                      skip = false;
                    }
                    // Aggregate de presença/falta
                    sessoes.forEach((sessao) => {
                      resultado.sessoes.total += 1;
                      if (sessao.listaDePresenca.includes(toTitleCase(dep.nomeDeputado))) {
                        resultado.sessoes.presente += 1;
                      }

                      // Aggregate de Sim/Não/Obstrução/Art. 17/Abstenção
                      if (sessao.votacoes.length > 0) {
                          sessao.votacoes.forEach(votacao => {
                            resultado.votos.totalDeVotacoes += 1;
                          votacao.votos.forEach(voto => {
                            if (voto.deputado.toUpperCase() === dep.nomeDeputado.toUpperCase()) {
                              switch (voto.voto) {
                                case 'Sim':
                                  resultado.votos.sim += 1;
                                  break;
                                case 'Não':
                                  resultado.votos.nao += 1;
                                  break;
                                case 'Obstrução':
                                  resultado.votos.obstrucao += 1;
                                  break;
                                case 'Abstenção':
                                    resultado.votos.abstencao += 1;
                                    break;
                                case 'Art. 17':
                                  resultado.votos.art17 += 1;
                                  break;
                                default:
                                  break;
                              }
                            }
                          });
                        });
                      }
                    });
                  })
                  .catch(e => console.log(e));
              }
            }

            const { sim, nao, art17 } = resultado.votos;
            resultado.votos.totalDeVotos += sim + nao + art17;
            resultado.sessoes.percentualPresenca = ((resultado.sessoes.presente / resultado.sessoes.total) * 100).toFixed(0) + '%';
            resultado.votos.percentualDeVotos = ((resultado.votos.totalDeVotos / resultado.votos.totalDeVotacoes) * 100).toFixed(0) + '%';
            await res.status(200).json(resultado);
          })();
        })
        .catch(e => console.log(e));
    })
    .catch(e => console.log(e));
});

router.get('/', (req, res, next) => {
  Deputado.find()
    .then((deps) => {
      res.status(200).json(deps);
    })
    .catch(e => console.log(e));
});

module.exports = router;
