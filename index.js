const puppeteer = require('puppeteer');
const fs = require('fs');

async function runScraper() {
    console.log("Starting Scraper...");
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    try {
        const page = await browser.newPage();
        
        console.log("Going to Wikipedia...");
        const url = encodeURI('https://ml.wikipedia.org/wiki/കേരളം');
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        console.log("Extracting text...");
        const notesContent = await page.evaluate(() => {
            const paragraphs = document.querySelectorAll('#mw-content-text p');
            let text = '';
            let count = 0;
            for(let i = 0; i < paragraphs.length; i++) {
                if(paragraphs[i].textContent.trim() !== "") {
                    // innerText-ന് പകരം innerHTML ഉപയോഗിക്കുന്നു (സ്പേസുകൾ നഷ്ടപ്പെടാതിരിക്കാൻ)
                    text += `<p>${paragraphs[i].innerHTML}</p>`;
                    count++;
                    if(count >= 5) break; 
                }
            }
            return text || "<p>നോട്സ് കണ്ടെത്താൻ കഴിഞ്ഞില്ല!</p>";
        });

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="ml">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                        body { 
                            font-family: 'Noto Sans Malayalam', sans-serif; 
                            padding: 15px; 
                            line-height: 2.2; /* വരികൾ തമ്മിലുള്ള അകലം കൂട്ടി */
                            word-spacing: 2px; /* വാക്കുകൾ തമ്മിലുള്ള അകലം കൂട്ടി */
                            color: #222; 
                            background-color: #f4f7f6;
                        }
                        .container {
                            max-width: 800px;
                            margin: 0 auto;
                            background: #fff;
                            padding: 25px;
                            border-radius: 10px;
                            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        }
                        h1 { 
                            color: #2c5364; 
                            text-align: center; 
                            border-bottom: 2px solid #2c5364; 
                            padding-bottom: 10px; 
                            font-size: 24px;
                        }
                        p { 
                            font-size: 16px; 
                            margin-bottom: 15px; 
                            text-align: left; 
                        }
                        /* വിക്കിപീഡിയയിലെ ലിങ്കുകൾ സാധാരണ ടെക്സ്റ്റ് പോലെ കാണിക്കാൻ */
                        a {
                            color: #222;
                            text-decoration: none;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>കേരളം - PSC Notes</h1>
                        ${notesContent}
                    </div>
                </body>
            </html>
        `;

        fs.writeFileSync('PSC_Notes.html', htmlContent, 'utf8');
        console.log("HTML file created successfully!");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
    }
}

runScraper();
