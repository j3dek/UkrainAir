const { chromium } = require('playwright');

class TurkishPlaywrightScraper {
  constructor() {}

  async getFlightsByCities(fromCity, toCity, departureDate, returnDate) {
    const browser = await chromium.launch({
      headless: false,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1366, height: 768 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-PL',
      timezoneId: 'Europe/Warsaw',
    });

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    const page = await context.newPage();

    try {
      await page.goto('https://www.turkishairlines.com', {
        waitUntil: 'domcontentloaded',
      });

      await this.randomDelay(1500, 2500);

      await this.handleCookies(page);

      await this.fillRouteForm(
        page,
        fromCity,
        toCity,
        departureDate,
        returnDate
      );

      await this.waitForFlights(page);

      await this.selectDepartureTimeSorting(page);

      const flights = await this.scrapeFlights(page, {
        fromCity,
        toCity,
        departureDate,
        returnDate,
      });

      return flights;
    } finally {
      await browser.close();
    }
  }

  async handleCookies(page) {
    try {
      await page.waitForSelector('#allowCookiesButton', {
        timeout: 8000,
      });
      await this.randomDelay(400, 800);
      await page.click('#allowCookiesButton');
      console.log('Cookies accepted');
    } catch {
      console.log('No cookie banner');
    }
  }

  async fillRouteForm(page, fromCity, toCity, departureDate, returnDate) {
    console.log('Filling route form...');

    await page.locator('[role="combobox"]').first().click();
    await page.keyboard.type(fromCity, { delay: 120 });

    await page.waitForSelector('li[role="option"]', { timeout: 10000 });
    await page.click(`li[role="option"][aria-label*="${fromCity}"]`);

    await this.randomDelay(600, 900);

    await page.locator('[role="combobox"]').nth(1).click();
    await page.keyboard.type(toCity, { delay: 120 });

    await page.waitForSelector('li[role="option"]', { timeout: 10000 });
    await page.click(`li[role="option"][aria-label*="${toCity}"]`);

    await this.randomDelay(600, 900);

    await this.selectDate(page, departureDate);
    await this.selectDate(page, returnDate);

    const okWrapper = page.locator(
      '.hm__RoundAndOneWayTab_okButtonWrapper__7zVv_'
    );

    await okWrapper.waitFor({ state: 'visible', timeout: 15000 });
    await okWrapper.click({ force: true });

    await this.randomDelay(500, 800);

    await page.click(
      'button.hm__RoundAndOneWayTab_searchButton__vpLcA'
    );
    console.log('Search clicked');
  }

  async selectDate(page, dateStr) {
    const [day, monthNum, year] = dateStr.split('.').map(Number);
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const targetMonthShort = months[monthNum - 1];
    const targetMonthLong = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][monthNum - 1];
    
    const targetMonthYear = `${targetMonthLong} ${year}`;
    // Format z zerem wiodącym dla dni < 10
    const dayPadded = day.toString().padStart(2, '0');
    const targetTooltipSubstring = `${targetMonthShort} ${day} ${year}`;
    const targetTooltipSubstring2 = `${targetMonthShort} ${dayPadded} ${year}`;

    console.log(targetMonthYear);
    console.log(targetTooltipSubstring);
    
    try {
      await page.waitForSelector('.hm__style_calendar-modal-wrapper__3QAFq', { timeout: 15000 });
    } catch {
      console.log('Calendar wrapper not found, trying alternative...');
    }
    console.log(`Selecting date: ${dateStr}`);

    // Nawigacja do odpowiedniego miesiąca
    let attempts = 0;
    while (attempts < 12) {
      attempts++;
      try {
        const firstMonthLocator = page.locator('.hm__style_monthLabel__7gHka').first();
        await firstMonthLocator.waitFor({ state: 'visible', timeout: 5000 });
        const visibleMonth = await firstMonthLocator.innerText();

        if (visibleMonth.includes(targetMonthYear)) {
          console.log(`Found target month: ${targetMonthYear}`);
          break;
        }
        
        console.log(`Current month: ${visibleMonth}. Navigating to next...`);
        await page.getByRole('button', { name: 'Go to the next month' }).click();
        await this.randomDelay(300, 600);
      } catch (err) {
        console.log('Error navigating months:', err.message);
        break;
      }
    }
    
    // Próbuj różne selektory dla dnia
    const daySelectors = [
      `span[data-tooltip*="${targetTooltipSubstring}"]`,
      `span[data-tooltip*="${targetTooltipSubstring2}"]`,
      `button[aria-label*="${targetMonthShort} ${day}"]`,
      `td[aria-label*="${targetMonthShort} ${day}"]`
    ];
    
    for (const selector of daySelectors) {
      try {
        console.log(`Trying selector: ${selector}`);
        const dayElement = page.locator(selector).first();
        await dayElement.waitFor({ state: 'visible', timeout: 3000 });
        await dayElement.click({ force: true });
        console.log(`Successfully clicked day with selector: ${selector}`);
        await this.randomDelay(400, 700);
        return;
      } catch {
        console.log(`Selector not found: ${selector}`);
      }
    }
    
    // Fallback - spróbuj kliknąć dzień po tekście
    try {
      const dayButton = page.getByRole('button', { name: new RegExp(`${day}.*${targetMonthShort}|${targetMonthShort}.*${day}`, 'i') });
      await dayButton.click({ timeout: 5000 });
      console.log('Clicked day using role button');
    } catch {
      console.log('Could not find day button, continuing anyway...');
    }
    
    await this.randomDelay(400, 700);
  }

  async waitForFlights(page) {
    console.log('Waiting for flights...');
    await page.waitForSelector('.av__FlightPanel_flightList__gxfmQ', {
      timeout: 60000,
    });
    await this.randomDelay(1500, 2500);
  }

  async selectDepartureTimeSorting(page) {
    console.log('Selecting "Departure time" sorting...');

    const moreButton = page.locator(
      'button.av__style_button__QxvpK:has-text("+")'
    );

    await moreButton.waitFor({ state: 'visible', timeout: 15000 });
    await moreButton.scrollIntoViewIfNeeded();
    await moreButton.click({ force: true });

    const departureTimeOption = page.locator(
      'button[role="radio"]:has(label:text("Departure time"))'
    );

    await departureTimeOption.waitFor({
      state: 'visible',
      timeout: 15000,
    });

    await departureTimeOption.click({ force: true });

    console.log('"Departure time" sorting selected');
  }

  async scrapeFlights(page, meta) {
    console.log('Scraping flights using original Turkish Airlines logic...');

    const flights = await page.evaluate(() => {
      const getText = (root, sel) =>
        root.querySelector(sel)?.innerText.trim() || null;

      const parseEconomyPrice = (root) => {
        const economyButton = root.querySelector(
          'div[aria-label^="Economy cabin"]'
        );

        if (!economyButton) return null;

        const aria = economyButton.getAttribute('aria-label');
        const match = aria.match(/fare:\s([\d.,]+)\s([A-Z]{3})/);

        if (!match) return null;

        return {
          amount: match[1].replace(',', ''),
          currency: match[2],
        };
      };

      return Array.from(
        document.querySelectorAll('[role="listitem"]')
      ).map((item) => {
        const economyPrice = parseEconomyPrice(item);

        return {
          departureTime: getText(
            item,
            '.av__style_origin___9we8 .av__style_time__3PSjQ'
          ),
          arrivalTime: getText(
            item,
            '.av__style_destination__S1yE0 .av__style_time__3PSjQ'
          ),
          originCode: getText(item, '#origin-port'),
          destinationCode: getText(item, '#destination-port'),
          duration: getText(
            item,
            '.av__style_flight-subdetail-duration-text__DeTWt'
          ),
          transferAirport: getText(
            item,
            '.av__style_transfer-port__QLQ0Z'
          ),
          airlines: Array.from(
            item.querySelectorAll(
              '.av__style_airline-image-wrapper__aH7aG img'
            )
          ).map((img) => img.alt),

          economyPrice, 
        };
      });
    });

    return flights.map((f) => ({
      provider: 'Turkish Airlines',
      fromCity: meta.fromCity,
      toCity: meta.toCity,
      searchDepartureDate: meta.departureDate,
      searchReturnDate: meta.returnDate,
      currency: f.economyPrice?.currency || 'PLN',
      ...f,
    }));
  }

  async randomDelay(min, max) {
    const delay =
      Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise((r) => setTimeout(r, delay));
  }
}

if (require.main === module) {
  (async () => {
    try {
      const scraper = new TurkishPlaywrightScraper();

      const flights = await scraper.getFlightsByCities(
        'Warsaw',
        'Berlin',
        '12.01.2026',
        '13.01.2026'
      );

      console.log('\nRESULTS');
      console.log('='.repeat(50));

      flights.forEach((f, i) => {
        console.log(
          `${i + 1}. ${f.originCode} → ${f.destinationCode} ` +
            `${f.departureTime} - ${f.arrivalTime} ` +
            //`(${f.duration}) ` +
            `Transfer: ${f.transferAirport || 'direct'} ` +
            //`Airlines: ${f.airlines.join(', ')} ` +
            `Price: ${f.economyPrice?.amount ?? 'N/A'} ${f.economyPrice?.currency ?? ''}`
        );
      });
    } catch (e) {
      console.error('Error:', e);
    } finally {
      process.exit(0);
    }
  })();
}

module.exports = { TurkishPlaywrightScraper };