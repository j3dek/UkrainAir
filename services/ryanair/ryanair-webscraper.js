const {chromium}= require('playwright');
const fs = require('fs');
const path = require('path');
class RyanairScraper {
    constructor() {
        this.browser = null;
    }
    async getCityCodeFromCsv(from,to) {
        
        const data = fs.readFileSync(path.join(__dirname, 'plik_filtered.csv'), 'utf8');
        const lines = data.split('\n');

        //Bedzie kilka wynikow wiec musimy wrzucic do tablicy i bedziemy porownywac ceny ze wszystkich mozliwych lotnisk
        //Miasto jest pod kolumna muncipality (kol 11(czyli 10)) a kod pod iata_code (kol 14(czyli 13))

        let fromCodes = [];
        let toCodes = [];

        //Musimy poprawnie wyjac kody bo sa puste pola i trim moze chujowo dzialac
        for (let i = 1; i < lines.length; i++) { 
            const line = lines[i].trim();
            if (!line) continue; 
            
            const columns = line.split(',');
            
            
            if (columns.length < 14) continue;
            
            const municipality = columns[10] ? columns[10].trim().toLowerCase() : '';
            const iata_code = columns[13] ? columns[13].trim() : '';
            
            
            if (!iata_code) continue;
            
            if (municipality === from.toLowerCase()) {
                fromCodes.push(iata_code);
            }
            if (municipality === to.toLowerCase()) {
                toCodes.push(iata_code);
            }
        }
        
        return {fromCodes, toCodes};
    }

    async scrapeRyanairFlights(fromCode, toCode, date_depart, date_return) {
        // https://www.ryanair.com/us/en/trip/flights/select?adults=1&teens=0&children=0&infants=0&dateOut=2025-11-23&dateIn=2025-12-22&isConnectedFlight=false&discount=0&promoCode=&isReturn=true&originMac=WWA&destinationIata=BVA&tpAdults=1&tpTeens=0&tpChildren=0&tpInfants=0&tpStartDate=2025-11-23&tpEndDate=2025-12-22&tpDiscount=0&tpPromoCode=&tpOriginMac=WWA&tpDestinationIata=BVA

        //^ ryanair do kazdego wyszukania wykorzystuje ten sam url wiec nie nie ma sensu szukac przyciskow

        const url = `https://www.ryanair.com/us/en/trip/flights/select?adults=1&teens=0&children=0&infants=0&dateOut=${date_depart}&dateIn=${date_return}&isConnectedFlight=false&discount=0&promoCode=&isReturn=true&originIata=${fromCode}&destinationIata=${toCode}&tpAdults=1&tpTeens=0&tpChildren=0&tpInfants=0&tpStartDate=${date_depart}&tpEndDate=${date_return}&tpDiscount=0&tpPromoCode=&tpOriginIata=${fromCode}&tpDestinationIata=${toCode}`;
        
        //scrapujemy 

        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();
        try{
        await page.goto(url, { waitUntil: 'networkidle' });

        //  akceptujemy cookies banner 
        try {
            await page.waitForSelector('[data-ref="cookie.accept-all"]', { timeout: 500 });
            await page.click('[data-ref="cookie.accept-all"]');
            await page.waitForTimeout(10);
        } catch (e) {
            console.log('No cookie banner or already accepted');
        }

        
        await page.waitForSelector('flight-card-new', { timeout: 500 });
        // await page.waitForTimeout(2000); 
        // Pobierz wszystkie karty lotów
        const flightCards = await page.$$('flight-card-new');
        console.log(`Found ${flightCards.length} flight cards`);

        const flightsData = [];

        for (let i = 0; i < flightCards.length; i++) {
            try {
                const card = flightCards[i];
                
                
                const times = await card.$$eval('.flight-info__hour', els => els.map(el => el.textContent.trim()));
                const departureTime = times[0] || 'N/A';
                const arrivalTime = times[1] || 'N/A';
                
                
                const cities = await card.$$eval('.flight-info__city', els => els.map(el => el.textContent.trim()));
                const originCity = cities[0] || 'N/A';
                const destinationCity = cities[1] || 'N/A';
                
                
                const duration = await card.$eval('[data-ref="flight_duration"]', el => el.textContent.trim()).catch(() => 'N/A');
                
                
                const flightNumber = await card.$eval('.card-flight-num__content', el => el.textContent.trim()).catch(() => 'N/A');
                
                
                const price = await card.$eval('.flight-card-summary__new-value', el => el.textContent.trim()).catch(() => 'N/A');
                
                
                const fareType = await card.$eval('.flight-card-summary__fare', el => el.textContent.trim()).catch(() => 'N/A');

                const flightInfo = {
                    flightNumber,
                    departureTime,
                    arrivalTime,
                    originCity,
                    destinationCity,
                    duration,
                    price,
                    fareType,
                    route: `${fromCode} -> ${toCode}`,
                    date: date_depart
                };

                flightsData.push(flightInfo);
                
                // console.log(`Flight ${i + 1}:`, flightInfo);
            } catch (error) {
                console.error(`Error extracting flight ${i + 1}:`);
            }
        }
        
        return flightsData;
        
        } catch (error) {
            
            return [];
        }
        finally {
            await browser.close();
        }
    }
    async getFlightsByCities (from, to, date_depart, date_return){
        let codes = await this.getCityCodeFromCsv(from,to);
        console.log(codes);
        let fromCodes = codes.fromCodes;
        let toCodes = codes.toCodes;
        let allWorkingFlights = [];

        for (let i = 0; i < fromCodes.length; i++) {
            for (let j = 0; j < toCodes.length; j++) {
                try{
                    let flights = await this.scrapeRyanairFlights(fromCodes[i], toCodes[j], date_depart, date_return);
                    // console.log(`Flights from ${fromCodes[i]} to ${toCodes[j]}:`, flights);
                    if (flights.length > 0){
                        allWorkingFlights = allWorkingFlights.concat(flights);
                    }
                } catch (error){
                    console.error(`Error scraping flights from ${fromCodes[i]} to ${toCodes[j]}:`);
                }
            }
        }
        console.log(allWorkingFlights)
        return allWorkingFlights;
        
    }
}

// Funkcja eksportowana do użycia w API
async function scrapeFlights(fromCity, toCity, departureDate, returnDate) {
    const scraper = new RyanairScraper();
    try {
        const flights = await scraper.getFlightsByCities(fromCity, toCity, departureDate, returnDate || departureDate);
        return flights;
    } catch (error) {
        console.error('Error in scrapeFlights:', error);
        throw error;
    }
}

module.exports = { RyanairScraper, scrapeFlights };


//test pliku csv

// const scraper = new RyanairScraper();
// async function testCsv() {
//     const {fromCodes, toCodes} = await scraper.getCityCodeFromCsv('Warsaw', 'Paris');
//     console.log('From Codes:', fromCodes);
//     console.log('To Codes:', toCodes);
// }

// test scrapera
// async function testScraper() {
//     const flights = await scraper.scrapeRyanairFlights('WAW', 'BVA', '2025-11-23', '2025-12-22');
//     console.log('Scraped Flights:', flights);
// }

// testCsv();
// testScraper();
// const scraper = new RyanairScraper();
// scraper.getFlightsByCities('Warsaw', 'Beauvais', '2025-12-01', '2025-12-04'); //Test dziala (y)