const puppeteer = require('puppeteer');

async function runScraper() {
    console.log("Starting Scraper...");
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    try {
        const page = await browser.newPage();
        
        // നമ്മളൊരു യഥാർത്ഥ കമ്പ്യൂട്ടർ ബ്രൗസർ ആണെന്ന് കാണിക്കാൻ 
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');
        
        const url = 'https://ml.wikipedia.org/wiki/%E0%B4%95%E0%B5%87%E0%B4%B0%E0%B4%B3%E0%B4%82';
        await page.goto(url, { waitUntil: 'networkidle2' });

        const notesContent = await page.evaluate(() => {
            const paragraphs = document.querySelectorAll('p');
            let text = '';
            for(let i = 0; i < 3 && i < paragraphs.length; i++) {
                if(paragraphs[i].innerText.trim() !== "") {
                    text += `<p>${paragraphs[i].innerText}</p>`;
                }
            }
            return text;
        });

        // ഡാറ്റ കിട്ടിയില്ലെങ്കിൽ കാണിക്കാനുള്ള ടെസ്റ്റ് മെസ്സേജ്
        const finalContent = notesContent || "<p>Notes not found. Wikipedia is blocking the scraper.</p>";

        const htmlContent = `
            <html>
                <head>
                    <meta charset="UTF-8">
                </head>
                <body style="font-family: sans-serif; padding: 40px; line-height: 1.6;">
                    <h1>PSC Notes Test Report</h1>
                    <p>This is a test paragraph in English to check PDF rendering.</p>
                    <hr>
                    ${finalContent}
                </body>
            </html>
        `;

        await page.setContent(htmlContent);
        await page.pdf({ path: 'PSC_Notes.pdf', format: 'A4' });

        console.log("PDF Created Successfully!");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
    }
}

runScraper();
