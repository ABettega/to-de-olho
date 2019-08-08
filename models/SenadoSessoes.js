const mongoose = require('mongoose');

const { Schema } = mongoose;

const senadoSessoesSchema = new Schema({
  Votacao: [
    {
      CodigoSessao: Number,
      SiglaCasa: String,
      CodigoSessaoLegislativa: Number,
      TipoSessao: String,
      NumeroSessao: Number,
      DataSessao: Date,
      HoraInicio: String,
      CodigoTramitacao: Number,
      CodigoSessaoVotacao: Number,
      SequencialSessao: Number,
      Secreta: String,
      DescricaoVotacao: String,
      Resultado: String,
      CodigoMateria: Number,
      SiglaMateria: String,
      NumeroMateria: String,
      AnoMateria: Number,
      SiglaCasaMateria: String,
      DescricaoObjetivoProcesso: String,
      DescricaoIdentificacaoMateria: String,
      Votos: {
        VotoParlamentar: [
          {
            CodigoParlamentar: Number,
            NomeParlamentar: String,
            SexoParlamentar: String,
            SiglaPartido: String,
            SiglaUF: String,
            Url: String,
            Foto: String,
            Tratamento: String,
            Voto: String,
          },
        ],
      },
    },
  ],
});
// Populando SessoesHistorico - para últimos 8 anos usar SenadoSessoe
const SenadoSessoes = mongoose.model('SenadoSessoe', senadoSessoesSchema);
const SenadoSessoesHistorico = mongoose.model('SenadoSessoesHistorico', senadoSessoesSchema);

module.exports = { SenadoSessoes, SenadoSessoesHistorico };
