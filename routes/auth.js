const express = require('express');
const router  = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('../config/passport');
const transport = require('../config/nodemailer');

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, failureMessage) => {
      if (err) {
        res.status(500).json({message: 'Algo deu errado!'})
        return;
      }

      if (!user) {
        res.status(200).json({error: true, errorMessage: failureMessage});
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

  if (firstName === '' || firstName === undefined || lastName === '' || lastName === undefined) {
    return res.status(422).json({message: 'É obrigatório inserir o nome completo!'});
  }

  if (email === '' || email === undefined) {
    res.status(422).json({message: 'É obrigatório inserir o email!'});
    return;
  }

  if (password === '' || password === undefined) {
    res.status(422).json({message: 'É obrigatório inserir a senha!'});
    return;
  }

  if (gender === '' || gender === undefined) {
    res.status(422).json({message: 'É obrigatório inserir o gênero!'});
    return;
  }

  if (day === '' || month === '' || year === '' ) {
    res.status(422).json({message: 'É obrigatório inserir data de nascimento'});
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
          year,
          validated: false
        }))
          .then(user => {
            transport.sendMail({
              from: '"Tô de Olho!" <detetive@todeolho.ironhackers.tech>',
              to: email, 
              subject: 'Email de Registro',
              text: 'Clique aqui para registrar',
              html: `Clica aqui irmão ${process.env.url}${email}`
            })
              .then(() => res.status(201).json({error:false, message: 'Usuário criado com sucesso!', user}))
              .catch(e => res.status(200).json({error: true, message: 'O email inserido é inválido!'}))
          })
          .catch(err => res.status(400).json({error: true, message: 'Ocorreu um erro ao criar o usuário!', err}));
      } else {
        res.status(200).json({error: true, message: 'Este nome de usuário já existe no banco de dados!'});
      }
    })
    .catch(err => res.status(400).json({error: true, message: 'Ocorreu um erro ao criar o usuário!!!', err}))
});

router.post('/edit', (req, res, next) => {
  if (req.isAuthenticated()) {
    const {email} = req.body;
    User.findOneAndUpdate({_id: req.user._id}, {$set: {email}}, {new: true})
      .then(user => res.status(200).json(user))
      .catch(err => res.status(400).json(err))
  } else {
    res.status(401).json({message: 'Você não está logado!'});
  }
});

router.get('/verify/:email', (req, res, next) => {
  let { email } = req.params;

  User.findOneAndUpdate({email}, {$set: { validated: true }})
    .then(u => res.status(200).json(u))
    .catch(e => res.status(400).json(e))
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.status(200).json({ message: 'Log out com sucesso!' });
});

router.get('/loggedin', (req, res, next) => {
  req.isAuthenticated() ? res.status(200).json(req.user) : res.status(401).json({ message: 'Você não está logado!' });
});

module.exports = router;
