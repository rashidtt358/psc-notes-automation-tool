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
                if(paragraphs[i].innerText.trim() !== "") {
                    text += `<p>${paragraphs[i].innerText}</p>`;
                    count++;
                    if(count >= 5) break; // ആദ്യത്തെ 5 പാരഗ്രാഫ് മാത്രം എടുക്കുന്നു
                }
            }
            return text || "<p>നോട്സ് കണ്ടെത്താൻ കഴിഞ്ഞില്ല!</p>";
        });

        // മൊബൈലിൽ കൃത്യമായി വായിക്കാൻ പാകത്തിലുള്ള HTML ഡിസൈൻ
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="ml">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <!-- ഗൂഗിൾ ഫോണ്ട് (Noto Sans Malayalam) -->
                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                        body { 
                            font-family: 'Noto Sans Malayalam', sans-serif; 
                            padding: 15px; 
                            line-height: 1.8; 
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
                            text-align: left; /* Justify ഒഴിവാക്കി ലെഫ്റ്റ് ആക്കി */
                            word-wrap: break-word;
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

        // HTML ഫയൽ UTF-8 ഫോർമാറ്റിൽ സേവ് ചെയ്യുന്നു
        fs.writeFileSync('PSC_Notes.html', htmlContent, 'utf8');
        console.log("HTML file created successfully!");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
    }
}

runScraper();
