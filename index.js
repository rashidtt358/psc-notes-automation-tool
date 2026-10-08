const puppeteer = require('puppeteer');
const fs = require('fs');

async function runCurrentAffairsBot() {
    console.log("Starting Deshabhimani Current Affairs Bot...");
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        
        console.log("Fetching latest news from Deshabhimani...");
        // ദേശാഭിമാനി വെബ്സൈറ്റിന്റെ ലിങ്ക്
        const url = encodeURI('https://www.deshabhimani.com/news/kerala'); 
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // വാർത്തകളും ചിത്രങ്ങളും സ്ക്രാപ്പ് ചെയ്യുന്നു
        const newsData = await page.evaluate(() => {
            let articles = [];
            // ദേശാഭിമാനിയിലെ വാർത്താ കാർഡുകൾ അല്ലെങ്കിൽ ഹെഡിങ്ങുകൾ സെലക്ട് ചെയ്യുന്നു
            const newsItems = document.querySelectorAll('.card, .news-item, article, .col-sm-4');
            
            for(let i = 0; i < newsItems.length; i++) {
                let titleEl = newsItems[i].querySelector('h3, h2, a');
                let descEl = newsItems[i].querySelector('p');
                let imgEl = newsItems[i].querySelector('img');

                let title = titleEl ? titleEl.innerText.trim() : '';
                let detail = descEl ? descEl.innerText.trim() : title;
                let imgSrc = imgEl ? (imgEl.src || imgEl.getAttribute('data-src')) : null;

                if(title.length > 15 && !articles.some(a => a.title === title)) {
                    // ഇമേജ് ലഭ്യമല്ലെങ്കിൽ സ്റ്റാൻഡേർഡ് പിക്ചർ നൽകാം
                    if(!imgSrc || imgSrc.includes('data:image')) {
                        imgSrc = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80";
                    }

                    articles.push({
                        title: title,
                        detail: detail || title,
                        image: imgSrc
                    });

                    if(articles.length >= 25) break; // കൃത്യം 25 എണ്ണം
                }
            }
            return articles;
        });

        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        let newsHTML = '';
        newsData.forEach((news, index) => {
            newsHTML += `
                <div class="news-card">
                    <div class="news-img-box">
                        <img src="${news.image}" alt="News Image" loading="lazy">
                    </div>
                    <div class="news-content">
                        <span class="badge">വാർത്ത #${index + 1}</span>
                        <h2>${news.title}</h2>
                        <p>${news.detail}</p>
                    </div>
                </div>
            `;
        });

        if(newsData.length === 0) {
            newsHTML = '<p style="text-align:center; color:#666; padding: 20px;">ഇന്നത്തെ അപ്ഡേറ്റുകൾ ലഭ്യമല്ല.</p>';
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="ml">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Deshabhimani Daily Current Affairs</title>
                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;600;700&display=swap" rel="stylesheet">
                    <style>
                        * { box-sizing: border-box; margin: 0; padding: 0; }
                        body { 
                            font-family: 'Noto Sans Malayalam', sans-serif; 
                            background-color: #f0f2f5;
                            color: #333; 
                            padding: 15px;
                        }
                        .main-container {
                            max-width: 900px;
                            margin: 0 auto;
                        }
                        .app-header {
                            background: linear-gradient(135deg, #8b0000, #b22222, #dc143c);
                            color: white;
                            padding: 30px 20px;
                            text-align: center;
                            border-radius: 15px;
                            margin-bottom: 25px;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                        }
                        .app-header h1 {
                            font-size: 24px;
                            margin-bottom: 10px;
                        }
                        .date-tag {
                            background: rgba(255,255,255,0.2);
                            padding: 6px 16px;
                            border-radius: 20px;
                            font-size: 14px;
                            font-weight: 600;
                            display: inline-block;
                        }
                        .news-card {
                            background: #ffffff;
                            border-radius: 12px;
                            overflow: hidden;
                            margin-bottom: 20px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                            display: flex;
                            flex-direction: column;
                            transition: transform 0.2s ease;
                        }
                        .news-card:hover {
                            transform: translateY(-3px);
                            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
                        }
                        .news-img-box {
                            width: 100%;
                            height: 180px;
                            overflow: hidden;
                            background: #e1e4e8;
                        }
                        .news-img-box img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }
                        .news-content {
                            padding: 20px;
                        }
                        .badge {
                            background: #ffebee;
                            color: #c62828;
                            font-size: 12px;
                            font-weight: bold;
                            padding: 4px 10px;
                            border-radius: 6px;
                            display: inline-block;
                            margin-bottom: 10px;
                        }
                        .news-content h2 {
                            font-size: 18px;
                            color: #2c3e50;
                            margin-bottom: 10px;
                            line-height: 1.5;
                        }
                        .news-content p {
                            font-size: 15px;
                            line-height: 1.8;
                            color: #555;
                            text-align: left;
                        }
                        .footer {
                            text-align: center;
                            padding: 20px;
                            color: #777;
                            font-size: 13px;
                        }
                        @media(min-width: 768px) {
                            .news-card {
                                flex-direction: row;
                            }
                            .news-img-box {
                                width: 280px;
                                height: auto;
                                min-height: 100%;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="main-container">
                        <div class="app-header">
                            <h1>ദേശാഭിമാനി - ഡെയ്‌ലി കറന്റ് അഫയേഴ്സ്</h1>
                            <div class="date-tag">📅 തീയതി: ${today}</div>
                        </div>

                        <div class="news-feed">
                            ${newsHTML}
                        </div>

                        <div class="footer">
                            <p>© 2026 PSC Notes Automation Tool. All rights reserved.</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        fs.writeFileSync('Current_Affairs.html', htmlContent, 'utf8');
        console.log("Deshabhimani Current Affairs HTML created successfully!");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
    }
}

runCurrentAffairsBot();
