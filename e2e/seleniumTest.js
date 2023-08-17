const webdriver = require('selenium-webdriver');
//const path = require('path');
const { By, until } = webdriver;

(async function() {
  const driver = new webdriver.Builder()
    .usingServer('http://localhost:9515')
    .withCapabilities({
      'goog:chromeOptions': {
        //binary: 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron',
        debuggerAddress: 'localhost:9222',
      }
    })
    .forBrowser('chrome')
    .build();

  try {
    // await driver.get('about:blank'); 
    // await driver.executeScript(`
    //   const { exec } = require('child_process');
    //   exec('npm run dev:electron'); // Start Electron
    // `);
    //await driver.sleep(5000);
    //await driver.get('http://localhost:8080/');  
    await driver.wait(until.elementLocated(By.className('card')), 30000);
    const logs = await driver.manage().logs().get('browser');
    console.log(logs);
    await driver.findElement(By.className('card')).click();
    await driver.wait(until.elementLocated(By.className('add-container')), 10000);
    await driver.findElement(By.className('env-button2')).click();
    //await driver.wait(until.elementLocated(By.className('local-hosted-modal')), 10000);
    await driver.wait(until.elementLocated(By.className('add-container')), 10000); 

    await driver.findElement(By.id('serv-type')).sendKeys('Docker');
    await driver.findElement(By.id('db-type')).sendKeys('SQL');
    await driver.findElement(By.id('db-uri')).sendKeys('mongodb://localhost:27017/mydb');
    await driver.findElement(By.id('db-name')).sendKeys('My App');
    await driver.findElement(By.id('db-desc')).sendKeys('A description of my app');

    await driver.findElement(By.xpath('//button[text()="Submit"]')).click();
    console.log('E2E test completed successfully');

  } catch (error) {
    console.error('E2E test failed:', error);
  } finally {
    await driver.quit();
  }
})();



