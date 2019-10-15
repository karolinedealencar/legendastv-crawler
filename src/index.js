require('dotenv').config();

const puppeteer = require('puppeteer');
const fileSystem = require('fs');
const user = process.env.USER;
const password = process.env.PASSWORD;
const search = 'The Simpsons';

const crawler = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    console.log('Login...');
    await page.goto('http://legendas.tv/login');

    console.log('Type login info...');
    await page.type('#UserUsername', user);
    await page.type('#UserPassword', password);
    await page.click('#UserLoginForm .btn');

    console.log('Go to search page...');
    await page.goto(`http://legendas.tv/busca/${search}`);
    await page.waitForSelector('#resultado_busca');

    console.log('Get subtitles...');
    const subtitles = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('#resultado_busca article > div'));

        return items.map(item => {
            const href = item.querySelector('a').href;
            const hash = href.split('/')[4];
            
            return {
                title: item.querySelector('a').innerText,
                download: `http://legendas.tv/downloadarquivo/${hash}`,
                languageImage: item.querySelector('img').src
            }
        });
    });  

    console.log('Close browser...');
    browser.close();
    return subtitles;
}

crawler()
    .then(subtitles => {
        fileSystem.writeFile('./src/subtitles.json', JSON.stringify(subtitles), error => {
            if (error) throw error;
            console.log('The file has been saved at src/subtitles.json! 💫');
        });
    })
    .catch(console.log)
