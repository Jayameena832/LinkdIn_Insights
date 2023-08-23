const { default: puppeteer } = require('puppeteer');
const login = require('./srapper/login');
const jobprofile = require('./srapper/jobProfile');
const CONFIG = require('./config/config.json');

const start = async () => {
  const args = Object.assign({ args: ['--no-sandbox'] });
  const browser = await puppeteer.launch(args);

  await login(browser, CONFIG.credentials.email, CONFIG.credentials.password);//login used when saved local html file is not used

  await jobprofile(browser, 'https://www.linkedin.com/jobs/view/3685899724/?alternateChannel=search&refId=GmpIOv3FwGoXIkElF%2Fj1Dw%3D%3D&trackingId=f6D8jpKBQkxk1T5UmiEgWg%3D%3D&trk=d_flagship3_search_srp_jobs');
  
};//For single test case this is the code
start();