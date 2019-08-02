require('dotenv').config();
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const axios = require('axios');
const async = require('async');
const SenadoVotacoesPorComissao = require('./models/SenadoVotacoesPorComissao');
const SenadoMaterias = require('./models/SenadoMaterias');
const SenadoAtual = require('./models/SenadoAtual');
const SenadoAfastado = require('./models/SenadoAfastado');
const SenadoTodos = require('./models/SenadoTodos');

// mongoose
//   .connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//   })
//   .then((x) => {
//     console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
//   })
//   .catch((err) => {
//     console.error('Error connecting to mongo', err);
//   });

// Por Comissão
const baseUrlComissoes = 'http://legis.senado.leg.br/dadosabertos/votacaoComissao/comissao/';
const baseUrlMaterias = 'http://legis.senado.leg.br/dadosabertos/materia/';
const baseUrlSenadores = 'http://legis.senado.leg.br/dadosabertos/senador/lista/atual';
const baseUrlSenadoresAfastados = 'http://legis.senado.leg.br/dadosabertos/senador/lista/afastados';

const tratamentoIdentificacaoMateria = (IdentificacaoMateria) => {
  const sigla = IdentificacaoMateria.split(' ')[0];
  const numero = parseInt(IdentificacaoMateria.split(/[\s/]/)[1], 10);
  const ano = parseInt(IdentificacaoMateria.split(/\//)[1], 10);
  return { sigla, numero, ano };
};

const comissoes = [
  { nome: 'Comissão de Assuntos Econômicos', sigla: 'CAE' },
  { nome: 'Comissão de Assuntos Sociais', sigla: 'CAS' },
  { nome: 'Comissão de Constituição, Justiça e Cidadania', sigla: 'CCJ' },
  { nome: 'Comissão de Ciência, Tecnologia, Inovação, Comunicação e Informática', sigla: 'CCT' },
  { nome: 'Comissão de Direitos Humanos e Legislação Participativa', sigla: 'CDH' },
  { nome: 'Comissão de Desenvolvimento Regional e Turismo', sigla: 'CDR' },
  { nome: 'Comissão de Educação, Cultura e Esporte', sigla: 'CE' },
  { nome: 'Comissão de Serviços de Infraestrutura', sigla: 'CI' },
  { nome: 'Comissão de Meio Ambiente', sigla: 'CMA' },
  { nome: 'Comissão de Transparência Governança, Fiscalização e Controle e Defesa do Consumidor', sigla: 'CTFC' },
  { nome: 'Comissão de Agricultura e Reforma Agrária', sigla: 'CRA' },
  { nome: 'Comissão de Relações Exteriores e Defesa Nacional', sigla: 'CRE' },
  { nome: 'Comissão Senado do Futuro', sigla: 'CSF' },
  { nome: 'Comissão Mista de Controle das Atividades de Inteligência', sigla: 'CCAI' },
  { nome: 'Comissão Mista Permanente sobre Mudanças Climáticas', sigla: 'CMMC' },
  { nome: 'Comissão Mista de Planos, Orçamentos Públicos e Fiscalização', sigla: 'CMO' },
  { nome: 'Comissão Permanente Mista de Combate à Violência contra a Mulher', sigla: 'CMCVM' },
  { nome: 'Comissão Diretora do Senado', sigla: 'CDIR' },
  { nome: 'Comissão Mista Representativa do Congresso Nacional no Fórum Interparlamentar das Américas', sigla: 'FIPA' },
  { nome: 'Comissão Mista do Congresso Nacional de Assuntos Relacionados à Comunidade dos Países de Língua Portuguesa', sigla: 'CMCPLP' },
  { nome: 'Comissão Mista de Consolidação da Legislação Federal', sigla: 'CMCF' },
];

// console.log(tratamentoIdentificacaoMateria('PL 672/2019').sigla);

// // POPULA DB DE VOTACOES POR COMISSAO
// comissoes.map((comissao) => {
//   axios.get(`${baseUrlComissoes}${comissao.sigla}`)
//     .then((res) => {
//       SenadoVotacoesPorComissao.create(
//         res.data.VotacoesComissao.Votacoes.Votacao,
//       );
//       console.log(comissao.sigla, res.data.VotacoesComissao.Votacoes.Votacao);
//     })
//     .catch(e => console.log(e));
// });

// // POPULA DB DE MATERIAS
// SenadoVotacoesPorComissao.find()
//   .then((votacoes) => {
//     votacoes.map((el) => {
//       console.log(el.IdentificacaoMateria);
//       if (el.IdentificacaoMateria !== undefined) {
//         axios.get(`${baseUrlMaterias}${tratamentoIdentificacaoMateria(el.IdentificacaoMateria).sigla}/${tratamentoIdentificacaoMateria(el.IdentificacaoMateria).numero}/${tratamentoIdentificacaoMateria(el.IdentificacaoMateria).ano}`)
//           .then((res) => {
//             if (res.status !== 404) {
//               SenadoMaterias.create(
//                 res.data,
//               );
//             }
//           })
//           .catch(e => console.log(e));
//       }
//     });
//   })
//   .catch(e => console.log(e));

// // POPULA DB DE SENADORES ATUAIS
// axios.get(baseUrlSenadores)
//   .then((res) => {
//     res.data.ListaParlamentarEmExercicio.Parlamentares.Parlamentar.map((el) => {
//       SenadoAtual.create(
//         el,
//       );
//       console.log(el)
//     });
//   })
//   .catch(e => console.log(e));

// POPULA DB DE SENADORES ATUAIS AFASTADOS
// axios.get(baseUrlSenadoresAfastados)
//   .then((res) => {
//     res.data.AfastamentoAtual.Parlamentares.Parlamentar.map((el) => {
//       SenadoAfastado.create(
//         el,
//       );
//       console.log(el);
//     });
//   })
//   .catch(e => console.log(e));

// Descobrir códigos de senadores possíveis:

// for (let i = 1; i <= 10000; i += 1) {
//   setTimeout(() => {
//     fetch(`http://legis.senado.leg.br/dadosabertos/senador/${i}/historico`)
//       .then((response) => {
//         return response.data.json();
//       })
//       .catch(e => console.log('erro'))
//   }, 500);
// }

// const arrParlamentares = [];

// const promiseArr = [];
// for (let i = 1; i <= 10000; i += 1) {
//   const get = axios.get(`http://legis.senado.leg.br/dadosabertos/senador/${i}/historico`, { headers: { Accept: 'application/json, text/plain, */*' } })
//     .then((res) => {
//       if (res.data.DetalheParlamentar.Parlamentar !== undefined) {
//         arrParlamentares.push(res.data.DetalheParlamentar.Parlamentar);
//       }
//       // console.log(res.data.DetalheParlamentar.Parlamentar.IdentificacaoParlamentar.NomeParlamentar, i)
//     })
//     .catch((e) => {
//       // console.log('erro', i);
//     });
//   promiseArr.push(get);
// }

const arrParlamentares = [];
const arrFunc = [];
const promiseArr = [];

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
  })
  .then((x) => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
    for (let i = 1; i <= 30000; i += 1) {
      arrFunc.push(() => {
        axios.get(`http://legis.senado.leg.br/dadosabertos/senador/${i}/historico`, { headers: { Accept: 'application/json, text/plain, */*' } })
          .then((res) => {
            console.log(`entrou na funcao ${i}`)
            if (res.data.DetalheParlamentar.Parlamentar !== undefined) {
              SenadoTodos.create(
                res.data.DetalheParlamentar.Parlamentar,
              );
            }
            // console.log(res.data.DetalheParlamentar.Parlamentar.IdentificacaoParlamentar.NomeParlamentar, i)
          })
          .catch((e) => {
            // console.log('erro', i);
          });
      });
      console.log(`adicionou funcao ${i}`);
    }

    async.parallel(arrFunc, () => console.log('terminou arrFunc'))
  })
  .catch((err) => {
    console.error('Error connecting to mongo', err);
  });

