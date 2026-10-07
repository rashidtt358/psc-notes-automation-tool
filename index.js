const puppeteer = require('puppeteer');
const fs = require('fs');

async function runScraper() {
    console.log("Starting Scraper...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // ഉദാഹരണത്തിന് വിക്കിപീഡിയയിലെ കേരള ചരിത്രം സ്ക്രാപ്പ് ചെയ്യുന്നു (നിങ്ങൾക്ക് ആവശ്യമുള്ള PSC സൈറ്റിന്റെ ലിങ്ക് ഇവിടെ കൊടുക്കാം)
    await page.goto('https://ml.wikipedia.org/wiki/കേരളം', { waitUntil: 'networkidle2' });

    // നോട്സ് HTML ആയി എടുക്കുന്നു
    const notesContent = await page.evaluate(() => {
        // സൈറ്റിലെ ഏത് ഭാഗമാണ് വേണ്ടത് എന്ന് ഇവിടെ സെലക്ട് ചെയ്യാം
        const content = document.querySelector('#mw-content-text').innerHTML; 
        return content;
    });

    // PDF ആക്കാനുള്ള HTML ഡിസൈൻ
    const htmlContent = `
        <html lang="ml">
            <head>
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
    // PDF ആയി സേവ് ചെയ്യുന്നു
    await page.pdf({ path: 'PSC_Notes.pdf', format: 'A4', printBackground: true });

    console.log("PDF Created Successfully!");
    await browser.close();
}

runScraper();
