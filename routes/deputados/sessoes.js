const express = require('express');
const router  = express.Router();
const axios = require('axios').create({});
const Deputado = require('../../models/Deputado')
const SessaoCamara = require('../../models/SessaoCamara');
// Pegar todas as propostas de um autor
router.get('/:idDeputado', (req, res, next) => {
  let {idDeputado} = req.params;

  Deputado.findOne({id: idDeputado})
  .then(dep => {
      let baseUrl = `https://dadosabertos.camara.leg.br/api/v2/legislaturas?ordem=ASC&ordenarPor=id&id=${dep.idLegislatura.slice(0, 1)},${dep.idLegislatura.slice(dep.idLegislatura.length - 1)}`;
      
      axios.get(baseUrl)
      .then(legislaturas => {
        let primeiraLegislatura = new Date(legislaturas.data.dados[1].dataInicio); 
        let ultimaLegislatura = new Date(legislaturas.data.dados[1].dataFim);

        // Aggregate de presença/falta
        SessaoCamara.aggregate([
          {$match: {dataInicio: {$gte: primeiraLegislatura, $lte: ultimaLegislatura}}},
          {$group: {_id: {$in: ['Jair Bolsonaro', '$listaDePresenca']}, Result: {$sum: 1}}},
        ])
        .then(sessoes => {
          res.status(200).json(sessoes);
        })
        .catch(e => console.log(e));
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