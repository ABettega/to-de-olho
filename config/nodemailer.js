const nodemailer = require('nodemailer')

let transport = nodemailer.createTransport({
  host: process.env.MAIL_SMTP,
  port: process.env.MAIL_PORT,
  auth: {
    // type: 'AUTH PLAIN',
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  }
});

module.exports = transport;