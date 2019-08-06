require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const SenadoSessoes = require('./models/SenadoSessoes');

// 'http://legis.senado.leg.br/dadosabertos/plenario/lista/votacao/20150201/20190802'

async function getVotacoesPlenario() {
  const datas = ['20150201', '20150401', '20150601', '20150801', '20151001', '20151201',
    '20160101', '20160301', '20160501', '20160701', '20160901', '20161101', '20161231',
    '20170101', '20170301', '20170501', '20170701', '20170901', '20171101', '20171231',
    '20180101', '20180301', '20180501', '20180701', '20180901', '20181101', '20181231',
    '20190101', '20190301', '20190501', '20190701', '20190901'];

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

  for (let i = 0; i < datas.length - 1; i += 1) {
    axios.get(`http://legis.senado.leg.br/dadosabertos/plenario/lista/votacao/${datas[i]}/${datas[i + 1]}`, { headers: { 'Content-Type': 'application/json' } })
      .then((res) => {
        SenadoSessoes.create(res.data.ListaVotacoes.Votacoes)
          .then(sessao => console.log('registro criado!', datas[i], datas[i + 1]))
          .catch(e => console.log('ERRO!', e));
      })
      .catch(e => console.log(e));
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

getVotacoesPlenario();
