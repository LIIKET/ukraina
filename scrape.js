const https = require('https');
const fs = require('fs');

async function scrapeValues() {
    return new Promise((resolve, reject) => {
        
        https.get(`https://unicef.se/egna-insamlingar/7435-stand-with-ukraine-ett-insamlingslajv-i-solidaritet-med-folket-i-ukraina`, res => { 

            let data = [];    
            res.on('data', chunk => {
                data.push(chunk);
            });
          
            res.on('end', () => {
                const html = Buffer.concat(data).toString();
                const value = html.split('AmountCard-progressAmount">').pop().split('kr')[0].trim();
                const percent = html.split('AmountCard-text">').pop().split('%')[0].trim();

                resolve({ value: value, percent: percent });
            });

        }).on('error', err => {
            reject(err);
        });
    });
}

async function scrapeDonations() {
    return new Promise((resolve, reject) => {

        https.get(`https://unicef.se/egna-insamlingar/7435-stand-with-ukraine-ett-insamlingslajv-i-solidaritet-med-folket-i-ukraina/gavor?page=1`, res => { 

            let data = [];    
            res.on('data', chunk => {
                data.push(chunk);
            });
          
            res.on('end', () => {
                const html = JSON.parse(Buffer.concat(data).toString());
                resolve(html);
            });

        }).on('error', err => {
            reject(err);
        });
    });
}

(async () => {

    while(true){
     
        try{
            console.log("SCRAPING");
            let result = await scrapeValues();
            let donations = await scrapeDonations();
            result.donations = donations;
            fs.writeFileSync('donations.json', JSON.stringify(result));
        }
        catch(err){
            console.log(`SCRAPING ERROR ${err}`);
        }
        
        console.log('WAITING');
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

})();



