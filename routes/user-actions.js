const express = require('express');
const router  = express.Router();
const axios = require('axios').create({});
const User = require('../models/User');


router.post("/add-politician", (req,res,next) => {
  const {id} = req.body

  console.log(id)

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
