const mongoose = require('mongoose');

const { Schema } = mongoose;

const eventoSchema = new Schema({
  envolvidos: [{
    partido: { type: String },
    politico: { type: String },
  }],
  partido: [String],
  resultado: String,
  codigo: String,
  descricao: String,
  // contagem é um counter que sobe um a cada sessao de mesmo código.
  contagemSessao: Number,
});

const Evento = mongoose.model('Politico', eventoSchema);

module.exports = Evento;
