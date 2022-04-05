const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

exports.handler = async function(event, context) { 
 
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath,
    headless: true,
  });

  console.log(event);
  // event.httpMethod === 'POST'
  // console.log(event.headers.authorization);
  // console.log(JSON.parse(event.body));
  // event.headers.authorization = Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
  // event.body
  
  const page = await browser.newPage();
  
  await page.goto('https://spacejelly.dev');

  await page.focus('#search-query');
  await page.keyboard.type('api');

  const results = await page.$$eval('#search-query + div a', (links) => {
    return links.map(link => {
      return { 
        text: link.innerText, 
        href: link.href 
      }
    })
  });

  await browser.close();

  return {
    statusCode: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      status: 'OK',
      page: {
        results
      }
    })
  }
}