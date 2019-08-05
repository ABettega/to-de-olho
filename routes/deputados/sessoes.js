const express = require('express');
const router = express.Router();
const axios = require('axios').create({});
const Deputado = require('../../models/Deputado')
const SessaoCamara = require('../../models/SessaoCamara');

toCapitalized = (str) => {
  return str.toLowerCase().split(' ').map(a => a[0].toUpperCase() + a.slice(1)).join(' ');
}

// Pegar todas as propostas de um autor
router.get('/:idDeputado', (req, res, next) => {
  let { idDeputado } = req.params;

  Deputado.findOne({ id: idDeputado })
    .then(dep => {
      let baseUrl = 'https://dadosabertos.camara.leg.br/api/v2/legislaturas?ordem=ASC&ordenarPor=id&id='
      dep.idLegislatura.forEach((legis, idx) => {
        baseUrl += legis;
        if (idx < dep.idLegislatura.length - 1) {
          baseUrl += ',';
        }
      });

      axios.get(baseUrl)
        .then(legislaturas => {
          legislaturas.data.dados.forEach(legis => {
            delete legis['uri'];
          })

          let resultado = {
            nomeDeputado: dep.nomeDeputado,
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
              art17: 0,
              total: 0,
              percentualSobrePresenca: 0,
            }
          };

          const limit = 1000;
          const legis = legislaturas.data.dados;
          
          (async () => {
            for (let x = 0; x < legis.length; x += 1) {
              let skip = 0;
              while (skip !== false) {
                  await SessaoCamara.find(
                  { dataInicio: { $gte: new Date(legis[x].dataInicio), $lte: new Date(legis[x].dataFim) } }, {},
                  { limit: limit, skip: limit * skip })
                  .then(sessoes => {
                    if (sessoes.length > 0) {
                      skip += 1;
                    } else {
                      skip = false;
                    }

                    // Aggregate de presença/falta
                    sessoes.forEach(sessao => {
                      resultado.sessoes.total += 1;
                      if (sessao.listaDePresenca.includes(toCapitalized(dep.nomeDeputado))) {
                        resultado.sessoes.presente += 1;
                      }
                      
                      // Aggregate de Sim/Não/Obstrução/Art. 17
                      if (sessao.votacoes.length > 0) {
                        sessao.votacoes.forEach(votacao => {
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
            const { sim, nao, obstrucao, art17 } = resultado.votos;
            resultado.votos.total += sim + nao + obstrucao + art17;
            resultado.sessoes.percentualPresenca = ((resultado.sessoes.presente / resultado.sessoes.total) * 100).toFixed(0) + '%';
            resultado.votos.percentualSobrePresenca = ((resultado.votos.total / resultado.sessoes.presente) * 100).toFixed(0) + '%';
            await res.status(200).json(resultado);
          })();
        })
        .catch(e => console.log(e))
    })
    .catch(e => console.log(e))
});

router.get('/', (req, res, next) => {
  Deputado.find()
    .then(deps => {
      console.log(deps.length)
      res.status(200).json(deps)
    })
    .catch(e => console.log(e))
});

module.exports = router;