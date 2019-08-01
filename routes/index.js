const express = require('express');
const router  = express.Router();
const axios = require('axios').create({});
const parser = require('xml2js');

/* GET home page */
router.get('/api/fill', (req, res, next) => {
  let parseString = parser.parseString;
  axios.get('http://legis.senado.leg.br/dadosabertos/senador/lista/atual')
    .then(result => {
      res.status(200).json(result.data.ListaParlamentarEmExercicio)
    })
    .catch(err => res.status(400).json(err));
});

module.exports = router;
