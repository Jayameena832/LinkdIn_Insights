const { default: puppeteer } = require('puppeteer');
const login = require('./srapper/login');
const profile = require('./srapper/profile');
const CONFIG = require('./config/config.json');

const start = async () => {
  const args = Object.assign({ args: ['--no-sandbox'] });
  const browser = await puppeteer.launch(args);

  await login(browser, CONFIG.credentials.email, CONFIG.credentials.password);// no need to login when using the local type address otherwise we have to

  await profile(browser, 'https://www.linkedin.com/in/antariksh-choudhary-331459241/');
}; //this will fetch one profile and add it to our database

start();



