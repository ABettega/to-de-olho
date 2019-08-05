const mongoose = require('mongoose');

const { Schema } = mongoose;

const senadoTodosSchema = new Schema({
  IdentificacaoParlamentar: {
    CodigoParlamentar: Number,
    NomeParlamentar: String,
    NomeCompletoParlamentar: String,
    SexoParlamentar: String,
    FormaTratamento: String,
    UrlFotoParlamentar: String,
    UrlPaginaParlamentar: String,
    EmailParlamentar: String,
  },
  DadosBasicosParlamentar: {
    DataNascimento: Date,
    UfNaturalidade: String,
    EnderecoParlamentar: String,
    TelefoneParlamentar: String,
  },
  UltimoMandato: {
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
      Exercicio: [
        {
          CodigoExercicio: Number,
          DataInicio: Date,
          DataFim: Date,
          DescricaoCausaAfastamento: String,
        },
        {
          CodigoExercicio: Number,
          DataInicio: Date,
          DataFim: Date,
          DescricaoCausaAfastamento: String,
        },
      ],
    },
  },
  OutrasInformacoes: {
    Servico: [
      {
        NomeServico: String,
        DescricaoServico: String,
        UrlServico: String,
      },
    ],
  },
  UrlGlossario: String,
});

const SenadoTodos = mongoose.model('SenadoTodo', senadoTodosSchema);

module.exports = SenadoTodos;
