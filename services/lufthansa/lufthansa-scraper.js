const { chromium } = require('playwright');

class LufthansaPlaywrightScraper {
  constructor() {}
  async getFlightsByCities(fromCity, toCity, departureDate, returnDate) {
    const browser = await chromium.launch({
      headless: false,
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    try {
      await page.goto('https://www.lufthansa.com/pl/pl/homepage', {
        waitUntil: 'networkidle',
      });

      // Akceptacja cookies (jak będzie inny selektor, po prostu nie zadziała, ale nie wywali)
      try {
        await page.waitForTimeout(2000);
        await page.click('button[aria-label*="cookies" i]', { timeout: 5000 });
      } catch (e) {
        // brak bannera albo inny tekst – pomijamy
      }

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

  async scrapeSingleRoute(page, fromCity, toCity, departureDate, returnDate) {
    const originInputSelector =
      'input[name="flightQuery.flightSegments[0].originCode"]';
    const destinationInputSelector =
      'input[name="flightQuery.flightSegments[0].destinationCode"]';
    const dateRangeInputSelector =
      'input[id$="flightQuery.flightSegments[0].travelDatetime-input"]';
    const searchButtonSelector =
      'button[type="submit"].button.maui.lh.primary';

    await page.waitForSelector(originInputSelector, { timeout: 10000 });

    await page.click(originInputSelector, { clickCount: 3 });
    await page.fill(originInputSelector, fromCity); 
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    await page.click(destinationInputSelector, { clickCount: 3 });
    await page.fill(destinationInputSelector, toCity); 
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // --- DATY: Wylot – powrót (TODO: kalendarz) ---

    // Pole jest readonly, więc nie da się zrobić page.fill().
    // Trzeba:
    // 1) Kliknąć dateRangeInputSelector, żeby otworzyć kalendarz,
    // 2) kliknąć konkretny dzień w kalendarzu dla wylotu,
    // 3) kliknąć konkretny dzień dla powrotu.
    //
    // Tymczasowy szkielet, który MUSISZ UZUPEŁNIĆ po podejrzeniu HTML kalendarza:

    await page.click(dateRangeInputSelector);
    await page.waitForTimeout(500);

    // TODO 1: kliknij właściwy miesiąc/rok jeśli trzeba (np. przyciski "następny miesiąc")
    // Przykład:
    // await page.click('button[aria-label="Następny miesiąc"]');

    // TODO 2: kliknij konkretny dzień dla departureDate.
    // W DevTools (F12) kliknij w kalendarzu dzień, np. "3 grudnia 2025",
    // zobacz, jaki ma selektor (aria-label, data-day, itp.).
    //
    // Przykładowo, jeśli dzień ma:
    // <button aria-label="3 grudnia 2025" ...>
    // to możesz zrobić:
    //
    // const depLabel = this.buildPolishAriaLabel(departureDate); // np. "3 grudnia 2025"
    // await page.click(`button[aria-label="${depLabel}"]`);
    //
    // analogicznie dla returnDate.

    // Na razie zostawiamy TODO, żeby zobaczyć, czy formularz w ogóle się wypełnia.

    // --- PRZECHWYCENIE flightAvailability ---
    const flightAvailabilityPromise = page.waitForResponse((res) => {
      return (
        res.url().includes('/service/api/booking/flightAvailability') &&
        res.request().method() === 'POST'
      );
    });

    await Promise.all([
      flightAvailabilityPromise,
      page.click(searchButtonSelector),
    ]);

    const response = await flightAvailabilityPromise;

    const targetURL = apiResponse.targetURL;
    const searchParam = apiResponse.parameters?.find(p => p.key === 'search')?.values?.[0];

    if (!targetURL || !searchParam) {
    console.error('Brak targetURL lub searchParam w odpowiedzi LH');
    return [];
    }

    const navPromise = page.waitForNavigation({ waitUntil: 'networkidle' });

    await page.evaluate(({ targetURL, searchParam }) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = targetURL;

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'search';
    input.value = searchParam;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    }, { targetURL, searchParam });

    await navPromise;

// Jesteś teraz na https://shop.lufthansa.com/booking/availability?... 
// Tu dopiero zaczynają się konkretne zapytania o loty.

    

    return flights;
  }

  /**
   * Normalizacja odpowiedzi LH do Twojego formatu.
   * Na start: zwraca 1 obiekt z raw, żebyś mógł zobaczyć strukturę.
   * Potem na podstawie tego JSON-a dopiszesz wyciąganie cen, godzin itp.
   */
  normalizeFlights(apiResponse, meta) {
    return [
      {
        provider: 'Lufthansa',
        fromCity: meta.fromCity,
        toCity: meta.toCity,
        departureDate: meta.departureDate,
        returnDate: meta.returnDate || null,
        raw: apiResponse,
      },
    ];
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
        '2025-12-03',
        '2025-12-26'
      );
      console.log('Flights z LH (Playwright):', flights.length);
    } catch (e) {
      console.error('Błąd testu Lufthansa (Playwright):', e);
    } finally {
      process.exit(0);
    }
  })();
}

module.exports = { LufthansaPlaywrightScraper };