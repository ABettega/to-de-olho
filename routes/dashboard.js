const express = require('express');
const router  = express.Router();
const User = require('../models/User');
const Deputado = require('../models/Deputado');
const SenadoTodos = require('../models/SenadoTodos');

router.get('/show', (req,res, next) => {
  console.log(req);
  const depArr = [];
  const senArr = [];
  
})

router.post("/add-politician", (req,res,next) => {
  const {id} = req.body

  User.findOneAndUpdate({_id: req.body.user}, {$push: {politicians:id}},{new:true})
  .then(user => res.status(200).json(user))
  .catch(err => res.status(400).json(err))
})

router.post("/delete-politician", (req,res,next) => {
  const {id} = req.body

  User.findOneAndUpdate({_id: req.body.user}, {$pull: {politicians:id}},{new:true})
  .then(user => res.status(200).json(user))
  .catch(err => res.status(400).json(err))
})

module.exports = router;
