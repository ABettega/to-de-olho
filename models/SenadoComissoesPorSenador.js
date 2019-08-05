const mongoose = require('mongoose');

const { Schema } = mongoose;

const senadoComissoesPorSenadorSchema = new Schema({
  MembroComissaoParlamentar: {
    Parlamentar: {
      IdentificacaoParlamentar: {
        CodigoParlamentar: Number,
        CodigoPublicoNaLegAtual: Number,
        NomeParlamentar: String,
        NomeCompletoParlamentar: String,
        SexoParlamentar: String,
        FormaTratamento: String,
        UrlFotoParlamentar: String,
        UrlPaginaParlamentar: String,
        EmailParlamentar: String,
        SiglaPartidoParlamentar: String,
        UfParlamentar: String,
      },
      MembroComissoes: {
        Comissao: [
          {
            IdentificacaoComissao: {
              CodigoComissao: Number,
              SiglaComissao: String,
              NomeComissao: String,
              SiglaCasaComissao: String,
              NomeCasaComissao: String,
            },
            DescricaoParticipacao: String,
            DataInicio: Date,
            DataFim: Date,
          },
        ],
      },
    },
  },
});

const SenadoComissoesPorSenador = mongoose.model('SenadoComissoesPorSenadore', senadoComissoesPorSenadorSchema);

module.exports = SenadoComissoesPorSenador;