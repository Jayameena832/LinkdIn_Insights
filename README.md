![iie.network](https://iie.network/android-chrome-192x192.png)

# LinkedIn Scraper

Uses LinkedIn Scrapper and [puppeteer](https://github.com/puppeteer/puppeteer) to search through a given list of LinkedIn profiles for specified keywords.

## Quickstart

#### Setup config

Edit the [config file](./config/config.json) to include your credentials.

```json
{
  // login credentials
  "credentials": {
    "email": "{YOUR-EMAIL}",
    "password": "{YOUR-PASSWORD}"
  }
}
```

#### Build + Run

```sh
npm  install
npm  start
```
