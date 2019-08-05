const express = require('express');
const router  = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('../config/passport');
// var app = express();
// app.use(function(req, res, next) {
//  res.header("Access-Control-Allow-Origin", "*");
//  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//  next();
// });

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, failureMessage) => {
      if (err) {
        res.status(500).json({message: 'Algo deu errado!'})
        return;
      }

      if (!user) {
        res.status(401).json(failureMessage);
        return;
      }

      req.login(user, (err) => {
        if (err) {
          res.status(500).json({message: 'Erro na sessão!'});
          return;
        }
        res.status(200).json(user);
      })
    })(req, res, next);
});

router.post('/signup', (req, res, next) => {

  const {firstName, lastName, password, email, gender, day, month, year } = req.body;


  if (firstName === '' || firstName === undefined) {
    return res.status(200).json({type: 'error', message: 'É obrigatório inserir o nome de usuário!'});
  }

  if (email === '' || email === undefined) {
    res.status(200).json({message: 'É obrigatório inserir o email!'});
    return;
  }

  if (password === '' || password === undefined) {
    res.status(200).json({message: 'É obrigatório inserir a senha!'});
    return;
  }

  if (day === '' || month === '' || year === '' ) {
    res.status(200).json({message: 'É obrigatório inserir data de Nascimento'});
    return;
  }

  const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

  User.find({email: {$eq: email}})
    .then(user => {
      if (user[0] === undefined) {
        User.create(new User({
          firstName,
          lastName,
          password: hash,
          email,
          gender,
          day,
          month,
          year
        }))
          .then(user => res.status(201).json({message: 'Usuário criado com sucesso!', user}))
          .catch(err => res.status(400).json({message: 'Ocorreu um erro ao criar o usuário!', err}));
      } else {
        res.status(200).json({message: 'Este nome de usuário já existe no banco de dados!'});
      }
    })
    .catch(err => res.status(400).json({message: 'Ocorreu um erro ao criar o usuário!!!', err}))
});

router.post('/edit', (req, res, next) => {
  if (req.isAuthenticated()) {
    const {email} = req.body;
    User.findOneAndUpdate({_id: req.user._id}, {$set: {email}}, {new: true})
      .then(user => res.status(200).json(user))
      .catch(err => res.status(400).json(err))
  } else {
    console.log('aqui')
    res.status(401).json({message: 'Você não está logado!'});
  }
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.status(200).json({ message: 'Log out com sucesso!' });
});

router.get('/loggedin', (req, res, next) => {
  req.isAuthenticated() ? res.status(200).json(req.user) : res.status(401).json({ message: 'Você não está logado!' });
});

module.exports = router;
