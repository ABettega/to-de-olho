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

// Pegar todas as propostas de um autor
router.get('/:idDeputado', (req, res, next) => {
  let {idDeputado} = req.params;
  
  Deputado.find({id: idDeputado})
    .then(dep => {
      res.status(200).json(dep)
    })
    .catch(e => console.log(e))  
});

router.get('/', (req, res, next) => {
  Deputado.find()
    .then(deps => {
      res.status(200).json(deps)
    })
    .catch(e => console.log(e))  
});



module.exports = router;