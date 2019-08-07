require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const SenadoAtual = require('./models/SenadoAtual');
const SenadoComissoesPorSenador = require('./models/SenadoComissoesPorSenador');

async function getComissoesPorSenador() {
  const codigosSenadores = [];

  await mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
    })
    .then((x) => {
      console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
    })
    .catch((err) => {
      console.error('Error connecting to mongo', err);
    });

  // await SenadoAtual.find()
  //   .then((senadores) => {
  //     senadores.map((senador) => {
  //       codigosSenadores.push(senador.IdentificacaoParlamentar.CodigoParlamentar);
  //     });
  //   })
  //   .catch(e => console.log(e));

  const idsSenadoresFalha = [];

  for (let i = 0; i < codigosSenadores.length; i += 1) {
    axios.get(`http://legis.senado.leg.br/dadosabertos/senador/${codigosSenadores[i]}/comissoes`, { headers: { 'Content-Type': 'application/json' } })
      .then((res) => {
        if (res.data.MembroComissaoParlamentar.Parlamentar !== undefined && res.status === 200) {
          SenadoComissoesPorSenador.create(
            res.data,
          );
          console.log(`criou registro para ID: ${codigosSenadores[i]}`);
          console.log('falhou pegar', idsSenadoresFalha);
        }
      })
      .catch((e) => {
        idsSenadoresFalha.push(codigosSenadores[i]);
        console.log(e);
        console.log('falhou pegar', idsSenadoresFalha);
      });
  }

  // axios.get(`http://legis.senado.leg.br/dadosabertos/senador/5008/comissoes`, { headers: { 'Content-Type': 'application/json' } })
  //   .then((res) => {
  //     console.log(res.data);
  //   })
  //   .catch((e) => {
  //     // idsSenadoresFalha.push(codigosSenadores[i]);
  //     console.log(e);
  //     // console.log('falhou pegar', idsSenadoresFalha);
  //   });
}

getComissoesPorSenador();
