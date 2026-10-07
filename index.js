const puppeteer = require('puppeteer');
const fs = require('fs');

async function runCurrentAffairsBot() {
    console.log("Starting Current Affairs Bot...");
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        
        // കറന്റ് അഫയേഴ്സ് ലഭ്യമായ വിശ്വസനീയമായ മലയാളം വെബ്സൈറ്റ് ലിങ്ക് ഇവിടെ നൽകാം
        // ഉദാഹരണത്തിന് മാതൃഭൂമി/ഏഷ്യാനെറ്റ് അല്ലെങ്കിൽ PSC അപ്ഡേറ്റുകൾ തരുന്ന സൈറ്റുകൾ
        console.log("Fetching latest Current Affairs...");
        const url = encodeURI('https://ml.wikipedia.org/wiki/പ്രധാന_താൾ'); // താല്‍ക്കാലികമായി വിക്കി പ്രധാന താൾ ഉപയോഗിക്കുന്നു, പിന്നീട് മാറ്റാം
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const newsContent = await page.evaluate(() => {
            // വെബ്സൈറ്റിലെ വാർത്തകൾ ഉള്ള ഭാഗം സെലക്ട് ചെയ്യുന്നു
            const paragraphs = document.querySelectorAll('p, li');
            let text = '';
            let count = 0;
            for(let i = 0; i < paragraphs.length; i++) {
                let content = paragraphs[i].innerText.trim();
                // അക്ഷരങ്ങൾ ഒട്ടിപ്പിടിക്കാതിരിക്കാൻ ഓരോ വാക്യത്തിനും കൃത്യമായ സ്പേസ് ഉറപ്പാക്കുന്നു
                if(content.length > 20) {
                    text += `<p>• ${content}</p>`;
                    count++;
                    if(count >= 8) break; // പ്രധാനപ്പെട്ട 8 പോയിന്റുകൾ മാത്രം
                }
            }
            return text || "<p>ഇന്നത്തെ കറന്റ് അഫയേഴ്സ് ലഭ്യമല്ല.</p>";
        });

        // ഇന്നത്തെ തീയതി എടുക്കാൻ
        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

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
                            padding: 20px; 
                            line-height: 2.0; 
                            color: #333; 
                            background-color: #f9f9f9;
                        }
                        .container {
                            max-width: 800px;
                            margin: 0 auto;
                            background: #fff;
                            padding: 30px;
                            border-radius: 12px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                        }
                        h1 { 
                            color: #1a73e8; 
                            text-align: center; 
                            border-bottom: 2px solid #1a73e8; 
                            padding-bottom: 15px; 
                            font-size: 22px;
                        }
                        .date {
                            text-align: center;
                            color: #666;
                            font-size: 14px;
                            margin-bottom: 25px;
                        }
                        p { 
                            font-size: 16px; 
                            margin-bottom: 18px; 
                            text-align: left; 
                            background: #f1f3f4;
                            padding: 12px 15px;
                            border-radius: 8px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Daily Current Affairs - PSC</h1>
                        <div class="date">തീയതി: ${today}</div>
                        ${newsContent}
                    </div>
                </body>
            </html>
        `;

        fs.writeFileSync('Current_Affairs.html', htmlContent, 'utf8');
        console.log("Current Affairs HTML file created successfully!");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
    }
}

runCurrentAffairsBot();
