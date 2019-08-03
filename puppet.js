require('dotenv').config();
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const SessaoCamara = require('./models/SessaoCamara');

console.log(process.env.MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true
  })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

let counter = 1;

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.camara.leg.br/internet/votacao/', { waitUntil: 'networkidle2', timeout: 0 });
    const [response] = await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 }),
      page.select('#selOutrasDatas', '01/8/2007'),
    ]);

    while (true){
      const content = await page.$('.datepicker-days');
      const dataSessoes = await content.$$eval('th[colspan="7"]', (th => th[0].innerText));
      if(dataSessoes.split(' / ')[1] > 2000) {
        const sessoesPorDia = [];

        // Pega as datas de trabalho da câmara e os grupos de sessões de cada dia
    const content = await page.$('#content');
    const listasMarcadas = await content.$$('.listaMarcada');

    // Para cada dia, checa a presença dos deputados nas sessões e os votos deles em cada votação
    for (let listaMarcada of listasMarcadas) {
      const sessoes = [];

      console.log(counter);
      counter++;
      // SESSÕES
      // Salva os nomes das sessões
      const sessao = await listaMarcada.$$eval('li > a', a => a.map(link => link.innerText.includes('SESSÃO') ? link.innerText : null).filter(a => a !== null));
      sessao.forEach(ses => sessoes.push({ nomeDaSessao: ses, votacoes: [] }));

      const listaDePresenca = await listaMarcada.$$eval('li > a', a => a.map(link => link.innerText.includes('Relação de presença na Sessão por Partido') ? link.href : null).filter(n => n !== null));

      // Caso o número de sessões não bata com o número de listas de presenças, removemos as sessões sem lista
      if (listaDePresenca.length !== sessao.length) {
        const checkSessao = await listaMarcada.$$eval('li > a', a => a.map(link => link.innerText.includes('SESSÃO') ? link.innerText : null));
        const checkLista = await listaMarcada.$$eval('li > a', a => a.map(link => link.innerText.includes('Relação de presença na Sessão por Partido') ? link.href : null));
        let countIndex = -1;
        
        checkSessao.forEach((el, index) => {
          if (el !== null) {
            countIndex += 1;
            if (checkLista[index + 2] === null || checkLista[index + 2] === undefined) {
              sessao.splice(countIndex, 1);
              sessoes.splice(countIndex, 1);
              countIndex -= 1;
            }
          } 
        });
      }
      
      // // Para cada sessao de um dia, abre uma nova página e pega os horários e os presentes
      for (x = 0; x < sessao.length; x += 1) {
        const propPage = await browser.newPage();
        await propPage.goto(listaDePresenca[x], { waitUntil: 'networkidle2', timeout: 0 });

        // Pega as datas e horários de início e fim da sessão
        const ps = await propPage.$('#coluna2');
        const hor = await ps.$$eval('p', ps => [
          ps[1].innerText.split(' ')[1], ps[1].innerText.split(' ')[2],
          ps[2].innerText.split(' ')[1], ps[2].innerText.split(' ')[2]
        ]);
        sessoes[x].dataInicio = hor[0];
        sessoes[x].horaInicio = hor[1];
        sessoes[x].dataFim = hor[2];
        sessoes[x].horaFim = hor[3];

        // Pega a lista de presença dos deputados e salva no array;
        const listagem = await propPage.$('#listagem > table');
        const deputados = await listagem.$$eval('td', td => td.map(dep =>
          dep.getAttribute('align') ? null : dep.innerText).filter(n => n !== null));
        sessoes[x].listaDePresenca = deputados;
        await propPage.close();
      }

      // VOTAÇÕES
      // Encontra o link para cada votação
      const listaDeVotacoes = await listaMarcada.$$eval('li > a', a => a.map(link => link.innerText.includes('Relação de votantes por partido') ? link.href : null).filter(n => n !== null));

      // Para cada votação, acessa a página 
      for (let y = 0; y < listaDeVotacoes.length; y += 1) {
        const votacao = {};
        const votPage = await browser.newPage();
        await votPage.goto(listaDeVotacoes[y], { waitUntil: 'networkidle2', timeout: 0 });
        const nomeDaSessao = await votPage.$$eval('#corpoVotacao > p > strong', nome => nome[0].innerHTML.split('<br>')[2].trim().replace('  ', ' '));

        // Se a votação for da sessão atual, faz a extração do nome da proposição e dos votos e salva no objeto
        for (let x = 0; x < sessoes.length; x += 1) {
          if (nomeDaSessao === sessoes[x].nomeDaSessao) {
            let titulo = await votPage.$$eval('#corpoVotacao > p', ps => ps.map(p => p.innerText));
            // Pega o nome da proposição e já arruma como precisaremos pra API
            titulo = titulo[2].split(': ')[1].split(' - ');
            const documento = titulo[0].split(' ');
            if (documento.length === 1 || (documento.length > 1 && documento[1] !== "Nº")) {
              votacao.documento = {
                siglaTipo: titulo[0],
                numero: '',
                ano: '',
              }
            } else {
              votacao.documento = {
                siglaTipo: documento[0],
                numero: documento[2].split('/')[0],
                ano: documento[2].split('/')[1],
              }
            }   
            votacao.proposicao = titulo.slice(1, titulo.length - 1).join(' - ');
            votacao.modo = titulo[titulo.length - 1];

            // Pega os deputados e os votos e salva na sessão correta
            votacao.votos = [];
            const listagem = await votPage.$('#listagem > table');
            const votoPorDeputado = await listagem.$$eval('tr > td', tds => tds.filter(td => !td.getAttribute('colspan')).map(td => td.innerText));
            for (let voto = 0; voto < votoPorDeputado.length; voto += 3) {
              votacao.votos.push({
                deputado: votoPorDeputado[voto],
                voto: votoPorDeputado[voto + 2],
              })
            }
            sessoes[x].votacoes.push(votacao);
          }
        }
        await votPage.close();
      }
      sessoes.forEach(sessao => {
        sessoesPorDia.push(sessao);
      });
    }

    //SALVA A PLENARIA DO MÊS NO BANCO DE DADOS ANTES DE COMEÇAR A PRÓXIMA PÁGINA
    SessaoCamara.create(sessoesPorDia)
      .then(res => console.log('Temos ', dataSessoes))
      .catch(err => console.log(err));

      
      const [response] = await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 }),
        page.click("input[name='btnAnterior']"),
      ]);
      } else {
        break;
      }
    }

    //----------------------- CODIGO DE RESERVA QUE FUNCIONAVA PRA 1 PAGINA ----------------------------------
    // // Pega as datas de trabalho da câmara e os grupos de sessões de cada dia
    // const content = await page.$('#content');
    // const dataSessoes = await content.$$eval('h5', (h5s => h5s.map(h5 => h5.innerText)));
    // const listasMarcadas = await content.$$('.listaMarcada');

    // // Para cada dia, checa a presença dos deputados nas sessões e os votos deles em cada votação
    // for (let listaMarcada of listasMarcadas) {
    //   const sessoes = [];

    //   console.log(counter);
    //   counter++;
    //   // SESSÕES
    //   // Salva os nomes das sessões
    //   const sessao = await listaMarcada.$$eval('li > a', a => a.map(link => link.innerText.toUpperCase().includes('SESSÃO') ? link.innerText : null).filter(a => a !== null));
    //   sessao.forEach(ses => sessoes.push({ nomeDaSessao: ses, votacoes: [] }));

    //   const listaDePresenca = await listaMarcada.$$eval('li > a', a => a.map(link => link.innerText.includes('Relação de presença na Sessão por Partido') ? link.href : null).filter(n => n !== null));

    //   // // Para cada sessao de um dia, abre uma nova página e pega os horários e os presentes
    //   for (x = 0; x < sessao.length; x += 1) {
    //     const propPage = await browser.newPage();
    //     await propPage.goto(listaDePresenca[x], { waitUntil: 'networkidle2' });

    //     // Pega as datas e horários de início e fim da sessão
    //     const ps = await propPage.$('#coluna2');
    //     const hor = await ps.$$eval('p', ps => [
    //       ps[1].innerText.split(' ')[1], ps[1].innerText.split(' ')[2],
    //       ps[2].innerText.split(' ')[1], ps[2].innerText.split(' ')[2]
    //     ]);
    //     sessoes[x].dataInicio = hor[0];
    //     sessoes[x].horaInicio = hor[1];
    //     sessoes[x].dataFim = hor[2];
    //     sessoes[x].horaFim = hor[3];

    //     // Pega a lista de presença dos deputados e salva no array;
    //     const listagem = await propPage.$('#listagem > table');
    //     const deputados = await listagem.$$eval('td', td => td.map(dep =>
    //       dep.getAttribute('align') ? null : dep.innerText).filter(n => n !== null));
    //     sessoes[x].listaDePresenca = deputados;
    //     await propPage.close();
    //   }

    //   // VOTAÇÕES
    //   // Encontra o link para cada votação
    //   const listaDeVotacoes = await listaMarcada.$$eval('li > a', a => a.map(link => link.innerText.includes('Relação de votantes por partido') ? link.href : null).filter(n => n !== null));

    //   // Para cada votação, acessa a página 
    //   for (let y = 0; y < listaDeVotacoes.length; y += 1) {
    //     const votacao = {};
    //     const votPage = await browser.newPage();
    //     await votPage.goto(listaDeVotacoes[y], { waitUntil: 'networkidle2' });
    //     const nomeDaSessao = await votPage.$$eval('#corpoVotacao > p > strong', nome => nome[0].innerHTML.split('<br>')[2].trim().replace('  ', ' '));

    //     // Se a votação for da sessão atual, faz a extração do nome da proposição e dos votos e salva no objeto
    //     for (let x = 0; x < sessoes.length; x += 1) {
    //       if (nomeDaSessao === sessoes[x].nomeDaSessao) {
    //         let titulo = await votPage.$$eval('#corpoVotacao > p', ps => ps.map(p => p.innerText));
    //         // Pega o nome da proposição e já arruma como precisaremos pra API
    //         titulo = titulo[2].split(': ')[1].split(' - ');
    //         votacao.documento = {
    //           siglaTipo: titulo[0].split(' ')[0],
    //           numero: titulo[0].split(' ')[2].split('/')[0],
    //           ano: titulo[0].split(' ')[2].split('/')[1],
    //         }
    //         votacao.proposicao = titulo.slice(1, titulo.length - 1).join(' - ');
    //         votacao.modo = titulo[titulo.length - 1];

    //         // Pega os deputados e os votos e salva na sessão correta
    //         votacao.votos = [];
    //         const listagem = await votPage.$('#listagem > table');
    //         const votoPorDeputado = await listagem.$$eval('tr > td', tds => tds.filter(td => !td.getAttribute('colspan')).map(td => td.innerText));
    //         for (let voto = 0; voto < votoPorDeputado.length; voto += 3) {
    //           votacao.votos.push({
    //             deputado: votoPorDeputado[voto],
    //             voto: votoPorDeputado[voto + 2],
    //           })
    //         }
    //         sessoes[x].votacoes.push(votacao);
    //         sessoesPorDia.push(sessoes[x]);
    //         votPage.close();
    //       }
    //     }
    //   }
    // }

    // //SALVA A PLENARIA DO MÊS NO BANCO DE DADOS ANTES DE COMEÇAR A PRÓXIMA PÁGINA
    // console.log(sessoesPorDia);
    // SessaoCamara.create(sessoesPorDia)
    //   .then(res => console.log('temos!'))
    //   .catch(err => console.log(err));

    //#content
    //h5 -> data
    //ul .listaMarcada
    //li -> sessão extraordinária
    //----------->//li -> hora da sessão
    //----------->//a -> Nome da sessão no innerHTML
    //ul
    //li[1] 
    //--------------->//a -> Relação de presença na Sessão por Partido 
    //--------------PARA CADA VOTAÇÃO-------------------------------------->
    //li
    //--------------->//strong -> hora da votação
    //span -> 'proposição'
    //--------------->//a -> link com nome da proposição (o link, quando clicado, tem o ID da proposição para usar na API)
    //--------------->//span -> com descrição do que foi votado
    //ul
    //----------------->//li[1] -> Relação de votantes por partido (tem o link para a votação)


    await browser.close();
  } catch (error) {
    console.log('error:', error)
  }
})();

// <input type="submit" name="btnAnterior" class="submit botaoAcao btn btn-primary" value="< Anterior" title="Anterior" onclick="javascript:frmOutroMes.OutroMes.value='01/07/2019'"></input>
// {headless: false} 
