const mongoose = require('mongoose');

const { Schema } = mongoose;

const politicoSchema = new Schema({
  nome: [String],
  partido: [{
    nome: { type: String },
    estado: { type: String },
    anoEntrada: { type: Number },
    anoSaida: { type: Number },
  }],
  mandatos: [String],
  votos: [{ type: Schema.Types.ObjectId, ref: 'Evento' }],
});

const Politico = mongoose.model('Politico', politicoSchema);

module.exports = Politico;
