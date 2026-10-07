const puppeteer = require('puppeteer');
const fs = require('fs');

async function runScraper() {
    console.log("Starting Scraper...");
    // Linux സെർവറിൽ റൺ ചെയ്യാനുള്ള സെറ്റിംഗ്സ് ചേർത്തു
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto('https://ml.wikipedia.org/wiki/കേരളം', { waitUntil: 'networkidle2' });

    const notesContent = await page.evaluate(() => {
        const content = document.querySelector('#mw-content-text').innerHTML; 
        return content;
    });

    const htmlContent = `
        <html lang="ml">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
                    h1 { color: #2c5364; text-align: center; }
                    img { max-width: 100%; height: auto; }
                </style>
            </head>
            <body>
                <h1>Today's PSC Notes (Automated)</h1>
                ${notesContent}
            </body>
        </html>
    `;

    await page.setContent(htmlContent);
    await page.pdf({ path: 'PSC_Notes.pdf', format: 'A4', printBackground: true });

    console.log("PDF Created Successfully!");
    await browser.close();
}

runScraper();
