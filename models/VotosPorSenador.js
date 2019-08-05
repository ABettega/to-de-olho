const mongoose = require('mongoose');

const { Schema } = mongoose;

const votosPorSenadorSchema = new Schema({
  Parlamentar: {
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
    Votacoes: {
      Votacao: [
        {
          SessaoPlenaria: {
            CodigoSessao: Number,
            SiglaCasaSessao: String,
            NomeCasaSessao: String,
            CodigoSessaoLegislativa: Number,
            SiglaTipoSessao: String,
            NumeroSessao: Number,
            DataSessao: Date,
            HoraInicioSessao: String,
          },
          IdentificacaoMateria: {
            CodigoMateria: Number,
            SiglaCasaIdentificacaoMateria: String,
            NomeCasaIdentificacaoMateria: String,
            SiglaSubtipoMateria: String,
            DescricaoSubtipoMateria: String,
            NumeroMateria: String,
            AnoMateria: Number,
            DescricaoObjetivoProcesso: String,
            DescricaoIdentificacaoMateria: String,
            IndicadorTramitando: String,
          },
          Tramitacao: {
            IdentificacaoTramitacao: {
              CodigoTramitacao: Number,
              NumeroAutuacao: Number,
              DataTramitacao: Date,
              NumeroOrdemTramitacao: Number,
              TextoTramitacao: String,
              IndicadorRecebimento: String,
              OrigemTramitacao: {
                Local: {
                  CodigoLocal: Number,
                  TipoLocal: String,
                  SiglaCasaLocal: String,
                  NomeCasaLocal: String,
                  SiglaLocal: String,
                  NomeLocal: String,
                },
              },
              DestinoTramitacao: {
                Local: {
                  CodigoLocal: Number,
                  TipoLocal: String,
                  SiglaCasaLocal: String,
                  NomeCasaLocal: String,
                  SiglaLocal: String,
                  NomeLocal: String,
                },
              },
              Situacao: {
                CodigoSituacao: Number,
                SiglaSituacao: String,
                DescricaoSituacao: String,
              },
            },
          },
          IndicadorVotacaoSecreta: String,
          DescricaoVotacao: String,
          DescricaoResultado: String,
          DescricaoVoto: String,
        },
      ],
    },
  },
});

const VotosPorSenador = mongoose.model('VotosPorSenadore', votosPorSenadorSchema);

module.exports = VotosPorSenador;
