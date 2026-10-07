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
        
        console.log("Fetching latest Current Affairs...");
        const url = encodeURI('https://ml.wikipedia.org/wiki/പ്രധാന_താൾ'); 
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const newsContent = await page.evaluate(() => {
            const paragraphs = document.querySelectorAll('p, li');
            let items = [];
            for(let i = 0; i < paragraphs.length; i++) {
                let content = paragraphs[i].innerText.trim();
                if(content.length > 25 && !items.includes(content)) {
                    items.push(content);
                    if(items.length >= 15) break; // കൂടുതൽ വിവരങ്ങൾ (15 പോയിന്റുകൾ) ഉൾപ്പെടുത്തുന്നു
                }
            }
            return items;
        });

        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        let newsHTML = '';
        newsContent.forEach((news, index) => {
            newsHTML += `
                <div class="news-card">
                    <span class="news-num">#${index + 1}</span>
                    <p>${news}</p>
                </div>
            `;
        });

        if(newsContent.length === 0) {
            newsHTML = '<p style="text-align:center; color:#666;">ഇന്നത്തെ കറന്റ് അഫയേഴ്സ് അപ്ഡേറ്റുകൾ ഉടൻ ലഭ്യമാകും.</p>';
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="ml">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Daily Current Affairs - PSC Notes</title>
                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;600;700&display=swap" rel="stylesheet">
                    <style>
                        * { box-sizing: border-box; margin: 0; padding: 0; }
                        body { 
                            font-family: 'Noto Sans Malayalam', sans-serif; 
                            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                            color: #333; 
                            padding: 20px;
                            min-height: 100vh;
                        }
                        .container {
                            max-width: 850px;
                            margin: 0 auto;
                            background: #ffffff;
                            padding: 35px;
                            border-radius: 16px;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 3px solid #007bff;
                            padding-bottom: 20px;
                        }
                        h1 { 
                            color: #007bff; 
                            font-size: 26px;
                            margin-bottom: 8px;
                        }
                        .date {
                            color: #555;
                            font-size: 15px;
                            font-weight: 600;
                            background: #e7f1ff;
                            display: inline-block;
                            padding: 5px 15px;
                            border-radius: 20px;
                        }
                        .news-card {
                            background: #fdfdfd;
                            border-left: 5px solid #007bff;
                            padding: 18px 20px;
                            margin-bottom: 18px;
                            border-radius: 8px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.03);
                            display: flex;
                            align-items: flex-start;
                            gap: 15px;
                            transition: transform 0.2s ease;
                        }
                        .news-card:hover {
                            transform: translateY(-3px);
                            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
                        }
                        .news-num {
                            background: #007bff;
                            color: white;
                            font-weight: bold;
                            font-size: 13px;
                            padding: 4px 8px;
                            border-radius: 6px;
                            flex-shrink: 0;
                        }
                        p { 
                            font-size: 16px; 
                            line-height: 1.8; 
                            color: #444;
                            text-align: left;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            color: #777;
                            font-size: 13px;
                            border-top: 1px solid #eee;
                            padding-top: 15px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>ഡെയ്‌ലി കറന്റ് അഫയേഴ്സ് & പി.എസ്.സി നോട്സ്</h1>
                            <div class="date">📅 തീയതി: ${today}</div>
                        </div>
                        <div class="news-list">
                            ${newsHTML}
                        </div>
                        <div class="footer">
                            <p>© PSC Notes Automation | Daily Updates</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        fs.writeFileSync('Current_Affairs.html', htmlContent, 'utf8');
        console.log("Enhanced HTML file created successfully!");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
    }
}

runCurrentAffairsBot();
