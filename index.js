const puppeteer = require('puppeteer');

async function runScraper() {
    console.log("Starting Scraper...");
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // മലയാളം ലിങ്ക് സെർവറിന് മനസ്സിലാകുന്ന രീതിയിലേക്ക് (URI Encoded) മാറ്റുന്നു
        const url = encodeURI('https://ml.wikipedia.org/wiki/കേരളം');
        await page.goto(url, { waitUntil: 'networkidle2' });

        // കണ്ടന്റ് വരുന്നത് വരെ കാത്തിരിക്കാൻ
        await page.waitForSelector('.mw-parser-output');

        // വിക്കിപീഡിയയിൽ നിന്ന് പാരഗ്രാഫുകൾ മാത്രം എടുക്കുന്നു
        const notesContent = await page.evaluate(() => {
            const paragraphs = document.querySelectorAll('.mw-parser-output p');
            let text = '';
            // നോട്സ് ആയി ആദ്യത്തെ 5 പാരഗ്രാഫ് മാത്രം എടുക്കുന്നു
            for(let i = 0; i < 5 && i < paragraphs.length; i++) {
                if(paragraphs[i].innerText.trim() !== "") {
                    text += `<p>${paragraphs[i].innerText}</p>`;
                }
            }
            return text || "<p>നോട്സ് കണ്ടെത്താൻ കഴിഞ്ഞില്ല!</p>";
        });

        const htmlContent = `
            <html lang="ml">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.8; }
                        h1 { color: #2c5364; text-align: center; border-bottom: 2px solid #2c5364; padding-bottom: 10px; margin-bottom: 30px; }
                        p { font-size: 16px; margin-bottom: 15px; text-align: justify; }
                    </style>
                </head>
                <body>
                    <h1>കേരളം - PSC Notes</h1>
                    ${notesContent}
                </body>
            </html>
        `;

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // PDF സേവ് ചെയ്യുന്നു
        await page.pdf({ 
            path: 'PSC_Notes.pdf', 
            format: 'A4', 
            printBackground: true,
            margin: { top: '20px', bottom: '20px' }
        });

        console.log("PDF Created Successfully!");
    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        await browser.close();
    }
}

runScraper();
