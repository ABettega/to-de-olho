const mongoose = require('mongoose');

const { Schema } = mongoose;

const senadoMateriasSchema = new Schema({
  DetalheMateria: {
    '@xmlns:xsi': String,
    '@xsi:noNamespaceSchemaLocation': String,
    Metadados: {
      Versao: Date,
      VersaoServico: Number,
      DataVersaoServico: Date,
      DescricaoDataSet: String,
    },
    Materia: {
      IdentificacaoMateria: {
        CodigoMateria: Number,
        SiglaCasaIdentificacaoMateria: String,
        NomeCasaIdentificacaoMateria: String,
        SiglaSubtipoMateria: String,
        DescricaoSubtipoMateria: String,
        NumeroMateria: Number,
        AnoMateria: Number,
        DescricaoObjetivoProcesso: String,
        DescricaoIdentificacaoMateria: String,
        IndicadorTramitando: String,
      },
      DadosBasicosMateria: {
        EmentaMateria: String,
        ExplicacaoEmentaMateria: String,
        IndicadorComplementar: String,
        DataApresentacao: Date,
        DataLeitura: Date,
        SiglaCasaLeitura: String,
        NomeCasaLeitura: String,
        NaturezaMateria: {
          CodigoNatureza: Number,
          NomeNatureza: String,
          DescricaoNatureza: String,
        },
      },
      Autoria: {
        Autor: [
          {
            NomeAutor: String,
            SiglaTipoAutor: String,
            DescricaoTipoAutor: String,
            UfAutor: String,
            NumOrdemAutor: Number,
            IndicadorOutrosAutores: String,
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
          },
        ],
      },
      Assunto: {
        AssuntoEspecifico: {
          Codigo: Number,
          Descricao: String,
        },
        AssuntoGeral: {
          Codigo: Number,
          Descricao: String,
        },
      },
      OrigemMateria: {
        NomePoderOrigem: String,
        SiglaCasaOrigem: String,
        NomeCasaOrigem: String,
      },
      CasaIniciadoraNoLegislativo: {
        SiglaCasaIniciadora: String,
        NomeCasaIniciadora: String,
      },
      OutrosNumerosDaMateria: {
        OutroNumeroDaMateria: {
          IdentificacaoMateria: {
            SiglaCasaIdentificacaoMateria: String,
            NomeCasaIdentificacaoMateria: String,
            SiglaSubtipoMateria: String,
            DescricaoSubtipoMateria: String,
            NumeroMateria: Number,
            AnoMateria: Number,
          },
          DescricaoTipoNumeracao: String,
        },
      },
      SituacaoAtual: {
        Autuacoes: {
          Autuacao: {
            NumeroAutuacao: Number,
            Situacao: {
              DataSituacao: Date,
              CodigoSituacao: Number,
              SiglaSituacao: String,
              DescricaoSituacao: String,
            },
            Local: {
              DataLocal: Date,
              CodigoLocal: Number,
              TipoLocal: String,
              SiglaCasaLocal: String,
              NomeCasaLocal: String,
              SiglaLocal: String,
              NomeLocal: String,
            },
          },
        },
      },
      OutrasInformacoes: {
        Servico: [
          {
            NomeServico: String,
            DescricaoServico: String,
            UrlServico: String,
          },
          {
            NomeServico: String,
            DescricaoServico: String,
            UrlServico: String,
          },
          {
            NomeServico: String,
            DescricaoServico: String,
            UrlServico: String,
          },
          {
            NomeServico: String,
            DescricaoServico: String,
            UrlServico: String,
          },
          {
            NomeServico: String,
            DescricaoServico: String,
            UrlServico: String,
          },
          {
            NomeServico: String,
            DescricaoServico: String,
            UrlServico: String,
          },
        ],
      },
      UrlGlossario: String,
    },
  },
});

const SenadoMaterias = mongoose.model('SenadoMateria', senadoMateriasSchema);

module.exports = SenadoMaterias;
