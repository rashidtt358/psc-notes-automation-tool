const puppeteer = require('puppeteer');

async function runScraper() {
    console.log("Starting Scraper...");
    // മെമ്മറി പ്രശ്നം ഒഴിവാക്കാൻ '--disable-dev-shm-usage' ചേർത്തു
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    try {
        const page = await browser.newPage();
        
        console.log("Going to Wikipedia...");
        // നേരിട്ട് Encoded ആയ ലിങ്ക് നൽകുന്നു
        const url = 'https://ml.wikipedia.org/wiki/%E0%B4%95%E0%B5%87%E0%B4%B0%E0%B4%B3%E0%B4%82';
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        console.log("Extracting text...");
        const notesContent = await page.evaluate(() => {
            const paragraphs = document.querySelectorAll('.mw-parser-output p');
            let text = '';
            for(let i = 0; i < 5 && i < paragraphs.length; i++) {
                if(paragraphs[i].innerText.trim() !== "") {
                    text += `<p>${paragraphs[i].innerText}</p>`;
                }
            }
            return text || "<p>നോട്സ് കണ്ടെത്താൻ കഴിഞ്ഞില്ല!</p>";
        });

        console.log("Scraped Data Length: ", notesContent.length); 

        const htmlContent = `
            <html lang="ml">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Meera', 'Rachana', sans-serif; padding: 40px; line-height: 1.8; color: #333; }
                        h1 { color: #2c5364; text-align: center; border-bottom: 2px solid #2c5364; padding-bottom: 10px; }
                        p { font-size: 16px; margin-bottom: 15px; text-align: justify; }
                    </style>
                </head>
                <body>
                    <h1>കേരളം - PSC Notes</h1>
                    ${notesContent}
                </body>
            </html>
        `;

        await page.setContent(htmlContent);
        
        console.log("Creating PDF...");
        await page.pdf({ 
            path: 'PSC_Notes.pdf', 
            format: 'A4', 
            printBackground: true
        });

        console.log("PDF Created Successfully!");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
    }
}

runScraper();
