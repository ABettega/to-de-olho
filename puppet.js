const puppeteer = require('puppeteer');
 
(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.camara.leg.br/internet/votacao/', {waitUntil: 'networkidle2'});
    const [response] = await Promise.all([
      page.waitForNavigation({waitUntil: 'networkidle2'}),
      page.click("input[name='btnAnterior']"),
    ]);
    const arr = [];
    // const lis = await page.$$('#content > .listaMarcada');
    // const sessoes = await page.$$('#content > .sessaoPagina');
    const content = await page.$('#content');
    const sessoes = await content.$$eval('h5', (h5s => h5s.map(h5 => h5.innerText)));
    const listasMarcadas = await content.$$eval('.listaMarcada > li > ul > li > a', (
      lis => lis.map(li => {
        // console.log(li.innerHTML === 'Relação de presença na Sessão por Partido');
        if (li.innerText === 'Relação de presença na Sessão por Partido') {
          return li.href;
        }
      }
      ))); 

    await console.log(listasMarcadas);








    // const dados = await lis[0].$eval('li', result => result.innerText)
    // await console.log(dados)
    // for (const sessao of sessoes) {
      // console.log(sessao);
      // console.log(sessao.innerHTML);
      // await page.$eval('h5', h5 => { console.log(h5.innerHTML); return h5.innerHTML});
      // sessao.('h5', h5 => { console.log(h5.innerHTML); return h5.innerHTML});

      // const dados = await page.$eval('li', li => li.innerText.split(' - '));
    // }
    
    // for (const li of lis) {
    // //   // const sessaoExt = {
    // //   //   data: 0,
    // //   //   nomeSessao: '',
    // //   // };

    //   // const dados = await page.$eval('li', li => li.innerText.split(' - '));
    //   // console.log(dados)
    // //   // sessaoExt.data = await dados[2].slice(0, 10);
    // //   // sessaoExt.nomeSessao =  await dados[1];
    // //   // console.log(sessaoExt);

    //   // await li.$eval('li', el => console.log(el.innerHTML))
    // }
    
    // .then(links => {
    //   for (let link in links) {
    //     // console.log(link)
    //     links[link].$eval('a', a => console.log('------------->', a.innerText)).then(res => {
    //       console.log('------------------->', res);
    //       arr.push(res)
    //     }).catch(err => console.log(err, '| erro:', 2));
    //   }
    //   // console.log(arr);
    // }).catch(err => console.log(err, '| erro:', 1));  


    await browser.close();
  } catch(error) {
    console.log('error:', error)
  }
})();

// <input type="submit" name="btnAnterior" class="submit botaoAcao btn btn-primary" value="< Anterior" title="Anterior" onclick="javascript:frmOutroMes.OutroMes.value='01/07/2019'"></input>
// {headless: false} 
