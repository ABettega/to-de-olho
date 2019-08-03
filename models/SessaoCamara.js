const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessaoSchema = new Schema({
  nomeDaSessao: String,
  dataInicio: String,
  horaInicio: String,
  dataFim: String,
  horaFim: String,
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
      deputado: String,
      voto: String,
    }],
  }],
}, {timestamps: true});

const SessaoCamara = mongoose.model("sessoesdep", sessaoSchema);

module.exports = SessaoCamara;