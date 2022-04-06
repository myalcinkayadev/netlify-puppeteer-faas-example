const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

function detectURLs(message) {
  var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  return message.match(urlRegex)
}

exports.handler = async function(event, context) { 

  const url = detectURLs(event.body);

  if (event.httpMethod !== 'POST' || url === null) {
    return {
      statusCode: 400,
    }
  }
  
  const chromiumArgs = [
    '--allow-running-insecure-content',
    '--autoplay-policy=user-gesture-required',
    '--disable-component-update',
    '--disable-domain-reliability',
    '--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process',
    '--disable-print-preview',
    '--disable-setuid-sandbox',
    '--disable-site-isolation-trials',
    '--disable-speech-api',
    '--disable-web-security',
    '--disk-cache-size=33554432',
    '--enable-features=SharedArrayBuffer',
    '--hide-scrollbars',
    '--ignore-gpu-blocklist',
    '--in-process-gpu',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--use-gl=swiftshader',
    '--window-size=390,844',
    '--single-process',
    '--user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
  ];

  const browser = await puppeteer.launch({
    args: chromiumArgs,
    executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath,
    headless: true,
  });

  ;
  // event.headers.authorization = Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
  
  const page = await browser.newPage();
  
  console.log(`url => ${url[0]}`);
  await page.goto(url[0]);
  console.time('logo load');
  await page.waitForXPath("//*[@alt='OJO Logo']", { visible: true } )
  console.timeEnd('logo load');

//   await page.screenshot({
//     path: 'screenshot.png', fullPage: true
//  })

console.time('button check')
const [button] = await page.$x("//button[contains(., 'Claim Now')]");
if (button) {
    console.log('button exists')
    await button.click();
}
console.timeEnd('button check');

  console.time('button2 check')
  const [button2] = await page.$x("//a[contains(., 'Claim Now')]");
  if (button2) {
      console.log('button2 exists')
      await button2.click();
  }
  console.timeEnd('button2 check');

  await browser.close();

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'OK'
    })
  }
}