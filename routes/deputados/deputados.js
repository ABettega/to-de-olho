const express = require('express');
const router  = express.Router();
const Deputado = require('../../models/Deputado')

router.get('/atuais', (req, res, next) => {
  Deputado.find({idLegislatura: {$in: 56}})
    .then(deps => {
      res.status(200).json(deps)
    })
    .catch(e => console.log(e))  
});

// Pegar um deputado específico
router.get('/:idDeputado', (req, res, next) => {
  let {idDeputado} = req.params;
  
  Deputado.find({id: idDeputado})
    .then(dep => {
      res.status(200).json(dep);
    })
    .catch(e => console.log(e))  
});

// Pegar um deputado específico por nome
router.get('/nome/:nomeDeputado', (req, res, next) => {
  let {nomeDeputado} = req.params;
  
  Deputado.find({nomeDeputado: nomeDeputado})
    .then(dep => {
      res.status(200).json(dep[0]);
    })
    .catch(e => console.log(e))  
});

router.get('/', (req, res, next) => {
  Deputado.find()
    .then(deps => {
      res.status(200).json(deps);
    })
    .catch(e => console.log(e))  
});

// Pegar todos os deputados de uma legislatura 
router.get('/legislatura/:idLegislatura', (req, res, next) => {
  Deputado.find({idLegislatura: req.params.idLegislatura}, 
    {_id: 0, id: 1, nomeDeputado: 1, siglaPartido: 1, siglaUf: 1, urlFoto: 1})
  .then(deputados => {
    res.status(200).json(deputados);
  })
  .catch(e => console.log(e));
});

module.exports = router;