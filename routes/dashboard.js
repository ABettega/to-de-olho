const express = require('express');
const router  = express.Router();
const User = require('../models/User');
const Deputado = require('../models/Deputado');
const SenadoTodos = require('../models/SenadoTodos');

router.get('/getFavorites', (req,res, next) => {
  const { email } = req.user;
  let depFavoritos = [];
  let senFavoritos = [];
  User.find({email: email})
    .then(usr => {
      depFavoritos = [...usr[0].depFavoritos];
      senFavoritos = [...usr[0].senFavoritos];
      res.status(200).json({depFavoritos, senFavoritos});
    })
    .catch(err => res.status(400).json(err))
})

router.post("/add-politician", (req,res,next) => {
  const {id, politico} = req.body
  if(politico === "/deputado/"){
    User.findOneAndUpdate({_id: req.user._id}, {$push: {depFavoritos:id}},{new:true})
    .then(user => {
      res.status(200).json(user)})
    .catch(err => res.status(400).json(err))
  } else{
    User.findOneAndUpdate({_id: req.user._id}, {$push: {senFavoritos:id}},{new:true})
    .then(user => res.status(200).json(user))
    .catch(err => res.status(400).json(err))
  }
})

router.post("/delete-politician", (req,res,next) => {
  const {id,politico} = req.body
  if(politico === "/deputado/"){
  User.findOneAndUpdate({_id: req.user._id}, {$pull: {depFavoritos:id}},{new:true})
  .then(user => res.status(200).json(user))
  .catch(err => res.status(400).json(err))
  } else{
    User.findOneAndUpdate({_id: req.user._id}, {$pull: {senFavoritos:id}},{new:true})
    .then(user => res.status(200).json(user))
    .catch(err => res.status(400).json(err))
  }
})

module.exports = router;
