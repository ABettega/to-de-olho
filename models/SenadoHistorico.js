const mongoose = require('mongoose');

const { Schema } = mongoose;

const senadoHistoricoSchema = new Schema({
  IdentificacaoParlamentar: {
    CodigoParlamentar: Number,
    NomeParlamentar: String,
    NomeCompletoParlamentar: String,
    SexoParlamentar: String,
    FormaTratamento: String,
    UrlFotoParlamentar: String,
    UrlPaginaParlamentar: String,
    EmailParlamentar: String,
    SiglaPartidoParlamentar: String,
  },
  Mandato: {
    CodigoMandato: Number,
    UfParlamentar: String,
    PrimeiraLegislaturaDoMandato: {
      NumeroLegislatura: Number,
      DataInicio: Date,
      DataFim: Date,
    },
    SegundaLegislaturaDoMandato: {
      NumeroLegislatura: Number,
      DataInicio: Date,
      DataFim: Date,
    },
    UrlPaginaNoMandato: String,
    DescricaoParticipacao: String,
    Suplentes: {
      Suplente: [
        {
          DescricaoParticipacao: String,
          CodigoParlamentar: Number,
          NomeParlamentar: String,
        },
        {
          DescricaoParticipacao: String,
          CodigoParlamentar: Number,
          NomeParlamentar: String,
        },
      ],
    },
    Exercicios: {
      Exercicio: [{
        CodigoExercicio: Number,
        DataInicio: Date,
        DataFim: Date,
        SiglaCausaAfastamento: String,
        DescricaoCausaAfastamento: String,
        DataLeitura: Date,
      }],
    },
  },
  UrlGlossario: String,
});

const SenadoHistorico = mongoose.model('SenadoHistorico', senadoHistoricoSchema);

module.exports = SenadoHistorico;
