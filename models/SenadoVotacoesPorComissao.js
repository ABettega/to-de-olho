const mongoose = require('mongoose');

const { Schema } = mongoose;

const senadoVotacoesPorComissaoSchema = new Schema({
  CodigoVotacao: Number,
  SiglaCasaColegiado: String,
  CodigoReuniao: Number,
  DataHoraInicioReuniao: Date,
  NumeroReuniaoColegiado: Number,
  TipoReuniao: String,
  CodigoColegiado: Number,
  SiglaColegiado: String,
  NomeColegiado: String,
  CodigoParlamentarPresidente: Number,
  NomeParlamentarPresidente: String,
  IdentificacaoMateria: String,
  DescricaoIdentificacaoMateria: String,
  DescricaoVotacao: String,
  Votos: {
    Voto: [{
      CodigoParlamentar: { type: Number },
      NomeParlamentar: { type: String },
      SiglaPartidoParlamentar: { type: String },
      SiglaCasaParlamentar: { type: String },
      QualidadeVoto: { type: String },
      VotoPresidente: { type: Boolean },
    }],
  },
  TotalVotosSim: Number,
  TotalVotosNao: Number,
  TotalVotosAbstencao: Number,
});

const SenadoVotacoesPorComissao = mongoose.model('SenadoVotacoesPorComissoe', senadoVotacoesPorComissaoSchema);

module.exports = SenadoVotacoesPorComissao;
