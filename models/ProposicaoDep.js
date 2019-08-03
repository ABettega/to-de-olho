const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const propSchema = new Schema({
  id: {type: Number, unique: true},
  siglaTipo: String,
  codTipo: Number,
  numero: Number,
  ano: Number,
  ementa: String,
});

const ProposicaoDep = mongoose.model("ProposicaoDep", propSchema);

module.exports = ProposicaoDep;