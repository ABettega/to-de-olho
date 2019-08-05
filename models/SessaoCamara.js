const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessaoSchema = new Schema({
  nomeDaSessao: String,
  dataInicio: Date,
  dataFim: Date,
  listaDePresenca: [String],
  votacoes: [{
    documento: {
      siglaTipo: String,
      numero: String,
      ano: String,
    },
    proposicao: String,
    modo: String,
    votos: [{
      deputado: {type: String, uppercase: true},
      voto: String,
    }],
  }],
}, {timestamps: true});

const SessaoCamara = mongoose.model("sessoesdep", sessaoSchema);

module.exports = SessaoCamara;