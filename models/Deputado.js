const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const deputadoSchema = new Schema({
  id: {type: Number, unique: true},
  nomeDeputado: String,
  siglaPartido: String,
  nomePartido: String,
  siglaUf: String,
  idLegislatura: Number,
  urlFoto: String,
  email: String,
});

const Deputado = mongoose.model("Deputado", deputadoSchema);

module.exports = Deputado;