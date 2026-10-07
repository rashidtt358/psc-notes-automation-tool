const puppeteer = require('puppeteer');
const fs = require('fs');

async function runScraper() {
    console.log("Starting Scraper...");
    // ഗിറ്റ്ഹബ് സെർവറിന് അനുയോജ്യമായ പ്രത്യേക ഗ്രാഫിക്സ് സെറ്റിംഗ്സുകൾ
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process'
        ]
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        
        console.log("Going to Wikipedia...");
        const url = encodeURI('https://ml.wikipedia.org/wiki/കേരളം');
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        console.log("Extracting text...");
        const notesContent = await page.evaluate(() => {
            const paragraphs = document.querySelectorAll('#mw-content-text p');
            let text = '';
            let count = 0;
            for(let i = 0; i < paragraphs.length; i++) {
                if(paragraphs[i].innerText.trim() !== "") {
                    text += `<p>${paragraphs[i].innerText}</p>`;
                    count++;
                    if(count >= 5) break;
                }
            }
            return text || "<p>നോട്സ് കണ്ടെത്താൻ കഴിഞ്ഞില്ല!</p>";
        });

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

        // 1. HTML ഫയൽ ആയി സേവ് ചെയ്യുന്നു (ബാക്കപ്പ്)
        fs.writeFileSync('PSC_Notes.html', htmlContent);
        console.log("HTML file created!");

        // 2. PDF ആയി സേവ് ചെയ്യുന്നു
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
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
