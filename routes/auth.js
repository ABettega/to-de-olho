const express = require('express');
const router  = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('../config/passport');

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, failureMessage) => {
    if (err) {
      res.status(500).json({message:'Something went wrong!'})
      return;
    }

    if (!user) {
      res.status(401).json(failureMessage);
      return;
    }

    req.login(user, (err) => {
      if (err) {
        res.status(500).json({message:'Session is screwed up!'});
        return;
      }
      res.status(200).json(user);
    })
  })(req, res, next);
});

router.post('/signup', (req, res, next) => {
  const {username, password, campus, course} = req.body;
  console.log(username)

  const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

  User.create(new User({
    username,
    password: hash,
    campus,
    course
  }))
    .then(user => res.status(200).json(user))
    .catch(err => res.status(400).json(err));
});

router.post('/edit', (req, res, next) => {
  const {username, campus, course} = req.body;
  User.findOneAndUpdate({_id: req.user._id}, {$set: {username, campus, course}}, {new: true})
    .then(user => res.status(200).json(user))
    .catch(err => res.status(400).json(err))
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.status(200).json({ message: 'Log out success!' });
});

router.get('/loggedin', (req, res, next) => {
  req.isAuthenticated() ? res.status(200).json(req.user) : res.status(403).json({ message: 'Unauthorized' });
});

module.exports = router;
