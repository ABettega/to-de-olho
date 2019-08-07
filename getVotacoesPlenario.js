require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const SenadoSessoes = require('./models/SenadoSessoes');

// 'http://legis.senado.leg.br/dadosabertos/plenario/lista/votacao/20150201/20190802'

async function getVotacoesPlenario() {
  const datas = [
    '20010101', '20010301', '20010501', '20010701', '20010901', '20011101', '20011231',
    '20020101', '20020301', '20020501', '20020701', '20020901', '20021101', '20021231',
    '20030101', '20030301', '20030501', '20030701', '20030901', '20031101', '20031231',
    '20040101', '20040301', '20040501', '20040701', '20040901', '20041101', '20041231',
    '20050101', '20050301', '20050501', '20050701', '20050901', '20051101', '20051231',
    '20060101', '20060301', '20060501', '20060701', '20060901', '20061101', '20061231',
    '20070101', '20070301', '20070501', '20070701', '20070901', '20071101', '20071231',
    '20080101', '20080301', '20080501', '20080701', '20080901', '20081101', '20081231',
    '20090101', '20090301', '20090501', '20090701', '20090901', '20091101', '20091231',
    '20100101', '20100301', '20100501', '20100701', '20100901', '20101101', '20101231',
    '20110101', '20110301', '20110501', '20110701', '20110901', '20111101', '20111231',
    '20120101', '20120301', '20120501', '20120701', '20120901', '20121101', '20121231',
    '20130101', '20130301', '20130501', '20130701', '20130901', '20131101', '20131231',
    '20140101', '20140301', '20140501', '20140701', '20140901', '20141101', '20141231',
    '20150101', '20150301', '20150501', '20150701', '20150901', '20151101', '20151231',
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
