const { default: puppeteer } = require('puppeteer');
const login = require('./srapper/login');
const openPage = require('./srapper/openPage');
const jobprofile = require('./srapper/jobProfile');
const CONFIG = require('./config/config.json');

const start = async () => {
    const args = Object.assign({ args: ['--no-sandbox'] });
    const browser = await puppeteer.launch(args);
  
    await login(browser, CONFIG.credentials.email, CONFIG.credentials.password);

    const searchUrl='';
  
    const pages = await browser.pages();
    const cookies = await pages[0].cookies();
  
    const page = await openPage(browser, cookies, searchUrl);
  
    const links = await page.$$eval('ul.scaffold-layout__list-container a.job-card-container__link', (elements) => {
      return elements.map((element) => {
        const url = new URL(element.href);
        url.search = '';
        return url.toString();
      });
    });
    
    for (const li of links) {
      await jobprofile(browser, li);
    }
   
    await browser.close();
  };
  //For the url taken from the searchkeyword and login function is required

  start();