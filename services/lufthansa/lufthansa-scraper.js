const { chromium } = require('playwright');

class LufthansaPlaywrightScraper {
  constructor() {}

  async getFlightsByCities(fromCity, toCity, departureDate, returnDate) {
    const browser = await chromium.launch({
      headless: false,
      args: ['--disable-blink-features=AutomationControlled'],
    });

    const context = await browser.newContext({
      viewport: { width: 1366, height: 768 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/120.0.0.0 Safari/537.36',
      locale: 'pl-PL',
      timezoneId: 'Europe/Warsaw',
    });

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    const page = await context.newPage();

    try {
      await page.goto('https://www.lufthansa.com/pl/pl/homepage', {
        waitUntil: 'domcontentloaded',
      });

      await this.randomDelay(2000, 3000);

      try {
        await page.click('button[id$="cm-acceptNone"]', { timeout: 5000 });
        await this.randomDelay(500, 1000);
      } catch (e) {}

      const flights = await this.scrapeSingleRoute(
        page,
        fromCity,
        toCity,
        departureDate,
        returnDate
      );

      return flights;
    } finally {
      await browser.close();
    }
  }

  async randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  async scrapeSingleRoute(page, fromCity, toCity, departureDate, returnDate) {
    const originInputSelector =
      'input[name="flightQuery.flightSegments[0].originCode"]';
    const destinationInputSelector =
      'input[name="flightQuery.flightSegments[0].destinationCode"]';
    const dateRangeInputSelector =
      'input[id$="flightQuery.flightSegments[0].travelDatetime-input"]';
    const dateDepartureDate = 'input[title="Data wylotu"][name="enter-date"]';
    const dateReturnDate = 'input[title="Data powrotu"][name="enter-date"]';
    const searchButtonSelector = 'button[type="submit"].button.maui.lh.primary';
    const exitDateRangeInputSelector = 'maui-link-button[aria-label="Zamknij"]';

    await page.waitForSelector(originInputSelector, { timeout: 15000 });

    await page.click(originInputSelector, { clickCount: 3 });
    await page.fill(originInputSelector, fromCity);
    await this.randomDelay(500, 800);
    await page.keyboard.press('Enter');
    await this.randomDelay(500, 800);

    await page.click(destinationInputSelector, { clickCount: 3 });
    await page.fill(destinationInputSelector, toCity);
    await this.randomDelay(500, 800);
    await page.keyboard.press('Enter');
    await this.randomDelay(500, 800);

    await page.click(dateRangeInputSelector);
    await this.randomDelay(500, 800);

    await page.click(dateDepartureDate);
    await page.fill(dateDepartureDate, departureDate);
    await this.randomDelay(300, 500);
    await page.keyboard.press('Enter');
    await this.randomDelay(500, 800);

    await page.click(dateReturnDate);
    await page.fill(dateReturnDate, returnDate);
    await this.randomDelay(300, 500);
    await page.keyboard.press('Enter');
    await this.randomDelay(500, 800);

    await page.click(exitDateRangeInputSelector);
    await this.randomDelay(500, 800);

    console.log('Klikam szukaj i czekam na stronę wyników...');

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }),
      page.click(searchButtonSelector),
    ]);

    console.log('Nawigacja zakończona, URL:', page.url());

    await this.waitForFlightsToLoad(page);

    // const selectedDayInfo = await this.getSelectedDayInfo(page);
    // console.log('Zaznaczony dzień:', selectedDayInfo);

    // const flights = await this.scrapeFlightsFromCurrentView(page, {
    //   fromCity,
    //   toCity,
    //   departureDate,
    //   returnDate,
    // }, selectedDayInfo);

    // return flights;
    return 1;
  }

  async waitForFlightsToLoad(page) {
    console.log('Czekam na załadowanie lotów...');

    try {
      await page.waitForSelector('refx-upsell-premium-row-pres', {
        timeout: 30000,
      });
      console.log('Znaleziono karty lotów');
    } catch (e) {
      console.log('Nie znaleziono kart lotów');
    }

    await this.randomDelay(2000, 3000);
  }

  async getSelectedDayInfo(page) {
    const selectedDay = await page.evaluate(() => {
      const activeBtn = document.querySelector('button.calendar-btn.active');
      if (!activeBtn) return null;

      const ariaDate = activeBtn.querySelector('.calendar-aria-date');
      const shortDate = activeBtn.querySelector('.cell-content-bottom span, .date-selected-day');
      const priceEl = activeBtn.querySelector('.price[data-amount]');

      return {
        fullDate: ariaDate ? ariaDate.innerText.trim() : null,
        shortDate: shortDate ? shortDate.innerText.trim() : null,
        dayPrice: priceEl ? parseInt(priceEl.getAttribute('data-amount')) / 100 : null,
      };
    });

    return selectedDay;
  }

  async scrapeFlightsFromCurrentView(page, meta, dayInfo) {
    console.log('Scrapuję loty...');

    const flights = await page.evaluate((dayData) => {
      const results = [];

      const flightRows = document.querySelectorAll('refx-upsell-premium-row-pres');

      flightRows.forEach((row, index) => {
        try {
          const flight = {
            index,
            fullDate: dayData?.fullDate || null,
            shortDate: dayData?.shortDate || null,
            dayLowestPrice: dayData?.dayPrice || null,
          };

          const departureTime = row.querySelector('.bound-departure-datetime');
          const arrivalTime = row.querySelector('.bound-arrival-datetime');

          if (departureTime) flight.departureTime = departureTime.innerText.trim();
          if (arrivalTime) flight.arrivalTime = arrivalTime.innerText.trim();

          const originCode = row.querySelector('.bound-departure-airport-code');
          const destinationCode = row.querySelector('.bound-arrival-airport-code');

          if (originCode) flight.originCode = originCode.innerText.trim();
          if (destinationCode) flight.destinationCode = destinationCode.innerText.trim();

          const terminal = row.querySelector('.bound-departure-terminal');
          if (terminal) flight.departureTerminal = terminal.innerText.trim();

          const duration = row.querySelector('.duration-value');
          if (duration) flight.duration = duration.innerText.trim();

          const stopsShape = row.querySelector('.nb-stop-shape');
          const directText = row.querySelector('.bound-stop-text');

          if (stopsShape) {
            flight.stops = parseInt(stopsShape.innerText.trim()) || 0;
          } else if (directText && directText.innerText.includes('bezpośredni')) {
            flight.stops = 0;
          }

          const stopInfo = row.querySelector('.bound-stop-text-with-info');
          if (stopInfo) {
            const stopAirport = stopInfo.querySelector('b');
            const stopDuration = stopInfo.querySelector('span');
            if (stopAirport) flight.stopAirport = stopAirport.innerText.trim();
            if (stopDuration) flight.stopDuration = stopDuration.innerText.trim();
          }

          const airlines = row.querySelectorAll('.operating-airline-name');
          if (airlines.length > 0) {
            flight.airlines = Array.from(airlines).map((a) => a.innerText.trim());
          }

          const economyBtn = row.querySelector('button[data-fare-family-group="eco"] .price[data-amount]');
          if (economyBtn) {
            flight.economyPrice = parseInt(economyBtn.getAttribute('data-amount')) / 100;
          }

          const businessBtn = row.querySelector('button[data-fare-family-group="business"] .price[data-amount]');
          if (businessBtn) {
            flight.businessPrice = parseInt(businessBtn.getAttribute('data-amount')) / 100;
          }

          const ribbons = row.querySelectorAll('.ribbon');
          if (ribbons.length > 0) {
            flight.availability = Array.from(ribbons).map((r) => r.innerText.trim());
          }

          const airboundId = row.getAttribute('airboundgroupid');
          if (airboundId) {
            flight.flightId = airboundId;
            const flightNumbers = airboundId.match(/SEG-([A-Z]{2}\d+)/g);
            if (flightNumbers) {
              flight.flightNumbers = flightNumbers.map((s) => s.replace('SEG-', ''));
            }
          }

          if (flight.departureTime && flight.originCode) {
            results.push(flight);
          }

        } catch (e) {
          console.error('Błąd parsowania lotu:', e);
        }
      });

      return results;
    }, dayInfo);

    console.log(`Znaleziono ${flights.length} lotów`);

    return flights.map((f) => ({
      provider: 'Lufthansa',
      fromCity: meta.fromCity,
      toCity: meta.toCity,
      searchDepartureDate: meta.departureDate,
      searchReturnDate: meta.returnDate,
      flightDate: f.fullDate || null,
      flightDateShort: f.shortDate || null,
      departureTime: f.departureTime || null,
      arrivalTime: f.arrivalTime || null,
      originCode: f.originCode || null,
      destinationCode: f.destinationCode || null,
      departureTerminal: f.departureTerminal || null,
      duration: f.duration || null,
      stops: f.stops ?? null,
      stopAirport: f.stopAirport || null,
      stopDuration: f.stopDuration || null,
      airlines: f.airlines || [],
      flightNumbers: f.flightNumbers || [],
      flightId: f.flightId || null,
      economyPrice: f.economyPrice || null,
      businessPrice: f.businessPrice || null,
      dayLowestPrice: f.dayLowestPrice || null,
      currency: 'PLN',
      availability: f.availability || [],
    }));
  }
}

// Uruchomienie z linii komend: node services/lufthansa/lufthansa-scraper.js
if (require.main === module) {
  (async () => {
    try {
      const scraper = new LufthansaPlaywrightScraper();
      const flights = await scraper.getFlightsByCities(
        'Warszawa',
        'Londyn',
        '27.12.2025',
        '29.12.2025'
      );

      console.log('\n' + '='.repeat(50));
      console.log(`WYNIKI: ${flights.length} lotów`);
      console.log('='.repeat(50));

      flights.forEach((f, i) => {
        console.log(`
${i + 1}. ${f.originCode} → ${f.destinationCode}
      ${f.departureTime} - ${f.arrivalTime} (${f.duration})
      Przesiadki: ${f.stops === 0 ? 'bezpośredni' : `${f.stops} (${f.stopAirport})`}
      Economy: ${f.economyPrice} PLN | Business: ${f.businessPrice} PLN
      ${f.airlines.join(', ')}`);
      });

      // const fs = require('fs');
      // fs.writeFileSync('lufthansa-flights.json', JSON.stringify(flights, null, 2));
      // console.log('\nZapisano do lufthansa-flights.json');

    } catch (e) {
      console.error('Błąd:', e);
    } finally {
      process.exit(0);
    }
  })();
}

module.exports = { LufthansaPlaywrightScraper };