const puppeteer = require('puppeteer');

async function runScraper() {
    console.log("Starting Scraper...");
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        console.log("Navigating to Wikipedia...");
        const url = encodeURI('https://ml.wikipedia.org/wiki/കേരളം');
        await page.goto(url, { waitUntil: 'networkidle2' });

        console.log("Extracting text...");
        const notesContent = await page.evaluate(() => {
            const paragraphs = document.querySelectorAll('#mw-content-text p');
            let text = '';
            for(let i = 0; i < 5 && i < paragraphs.length; i++) {
                if(paragraphs[i].innerText.trim() !== "") {
                    text += `<p>${paragraphs[i].innerText}</p>`;
                }
            }
            return text || "<p>നോട്സ് കണ്ടെത്താൻ കഴിഞ്ഞില്ല!</p>";
        });

        console.log("Scraped Data Length: ", notesContent.length); // ഡാറ്റ കിട്ടിയോ എന്ന് ചെക്ക് ചെയ്യാൻ

        const htmlContent = `
            <html lang="ml">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        /* ഉബുണ്ടുവിൽ ഇൻസ്റ്റാൾ ചെയ്ത മലയാളം ഫോണ്ടുകൾ */
                        body { font-family: 'Meera', 'Rachana', 'AnjaliOldLipi', sans-serif; padding: 40px; color: #333; line-height: 1.8; }
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
        
        console.log("Creating PDF...");
        await page.pdf({ 
            path: 'PSC_Notes.pdf', 
            format: 'A4', 
            printBackground: true,
            margin: { top: '20px', bottom: '20px' }
        });

        console.log("PDF Created Successfully!");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
    }
}

runScraper();
