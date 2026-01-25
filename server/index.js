const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const app = express()
const port = process.env.PORT || 3000
require('./router/database'); // Import połączenia z MongoDB
const { addUser, getUsers, loginUser } = require('./controller/user');
const { scrapeFlights } = require('../services/ryanair/ryanair-webscraper');
const { LufthansaPlaywrightScraper } = require('../services/lufthansa/lufthansa-scraper');
const { TurkishPlaywrightScraper } = require('../services/turkish/turkish-scraper');

// Configure CORS - allow all origins in development
app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {
    res.send('Hello World!');
})

app.get('/users', async (req, res) => {
    try {
        const users = await getUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        // Input validation
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Wszystkie pola (name, email, password) są wymagane' });
        }
        
        const user = await addUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        // Return 400 for validation errors, 500 for server errors
        const statusCode = err.type === 'VALIDATION_ERROR' ? 400 : 500;
        res.status(statusCode).json({ error: err.message });
    }
});

app.post('/api/flights/search', async (req, res) => {
    try {
        const { departure, arrival, departureDate, returnDate, ukrainiec } = req.body;

        // Walidacja
        if (!departure || !arrival || !departureDate) {
            return res.status(400).json({ 
                error: 'Brakuje wymaganych pól: departure, arrival, departureDate' 
            });
        }

        if (!ukrainiec) {
            return res.status(403).json({ 
                error: 'Tylko dla zweryfikowanych Ukraińców' 
            });
        }

        // console.log(`Szukam lotów: ${departure} -> ${arrival}, ${departureDate} - ${returnDate || 'bez powrotu'}`);

        // Konwersja dat do różnych formatów
        // Frontend wysyła YYYY-MM-DD, Ryanair potrzebuje YYYY-MM-DD, Turkish/Lufthansa potrzebują DD.MM.YYYY
        const convertToEuropeanFormat = (dateStr) => {
            if (!dateStr) return dateStr;
            // Jeśli już jest w formacie DD.MM.YYYY, zwróć bez zmian
            if (dateStr.includes('.')) return dateStr;
            // Konwertuj YYYY-MM-DD na DD.MM.YYYY
            const [year, month, day] = dateStr.split('-');
            return `${day}.${month}.${year}`;
        };

        const departureDateEU = convertToEuropeanFormat(departureDate);
        const returnDateEU = returnDate ? convertToEuropeanFormat(returnDate) : departureDateEU;

        console.log(`Szukam lotów: ${departure} -> ${arrival}`);
        console.log(`Daty: ${departureDate} (EU: ${departureDateEU}) - ${returnDate || 'brak'} (EU: ${returnDateEU})`);

        // Wywołaj scrapery równolegle - każdy w osobnym try-catch
        const scraperResults = await Promise.allSettled([
            // Ryanair - używa formatu YYYY-MM-DD
            (async () => {
                try {
                    console.log('Ryanair: start...');
                    const flights = await scrapeFlights(departure, arrival, departureDate, returnDate || departureDate);
                    console.log(`Ryanair: znaleziono ${flights?.length || 0} lotów`);
                    return Array.isArray(flights) ? flights : [];
                } catch (err) {
                    console.error('Błąd Ryanair scraper:', err.message);
                    return [];
                }
            })(),
            // Lufthansa - używa formatu DD.MM.YYYY
            (async () => {
                try {
                    console.log('Lufthansa: start...');
                    const scraper = new LufthansaPlaywrightScraper();
                    const flights = await scraper.getFlightsByCities(departure, arrival, departureDateEU, returnDateEU);
                    console.log(`Lufthansa: znaleziono ${flights?.length || 0} lotów`);
                    return Array.isArray(flights) ? flights : [];
                } catch (err) {
                    console.error('Błąd Lufthansa scraper:', err.message);
                    return [];
                }
            })(),
            // Turkish Airlines - używa formatu DD.MM.YYYY
            (async () => {
                try {
                    console.log('Turkish: start...');
                    const scraper = new TurkishPlaywrightScraper();
                    const flights = await scraper.getFlightsByCities(departure, arrival, departureDateEU, returnDateEU);
                    console.log(`Turkish: znaleziono ${flights?.length || 0} lotów`);
                    return Array.isArray(flights) ? flights : [];
                } catch (err) {
                    console.error('Błąd Turkish scraper:', err.message);
                    return [];
                }
            })()
        ]);

        // Zbierz wyniki ze wszystkich scraperów
        const flights = scraperResults
            .filter(result => result.status === 'fulfilled')
            .flatMap(result => result.value);

        res.json({
            success: true,
            count: flights.length,
            flights: flights,
            searchParams: { departure, arrival, departureDate, returnDate }
        });

    } catch (error) {
        console.error('Błąd podczas wyszukiwania lotów:', error);
        res.status(500).json({ 
            error: 'Wystąpił błąd podczas wyszukiwania lotów',
            details: error.message 
        });
    }
});

app.get('/api/flight/:flightNumber', async (req, res) => {
  const flightNumber = req.params.flightNumber.toUpperCase().trim();
  
  try {
    // Spróbuj pobrać dane z OpenSky Network API
    const openSkyResponse = await axios.get(
      'https://opensky-network.org/api/states/all',
      { timeout: 5000 }
    );
    
    const aircraft = openSkyResponse.data.states?.find(state => 
      state[1]?.trim().toUpperCase() === flightNumber
    );
    
    if (aircraft) {
      return res.json({
        flightNumber: flightNumber,
        latitude: aircraft[6],
        longitude: aircraft[5],
        altitude: aircraft[7],
        velocity: aircraft[9],
        heading: aircraft[10],
        verticalRate: aircraft[11],
        onGround: aircraft[8],
        icao24: aircraft[0]
      });
    }
  } catch (error) {
    console.log('OpenSky API niedostępny, używam danych testowych');
  }
  
  // Mock data jako fallback
  const mockFlights = {
    'LO123': { latitude: 52.0, longitude: 19.0, altitude: 10000, velocity: 450, heading: 180, onGround: false, verticalRate: 5 },
    'FR456': { latitude: 51.5, longitude: 0.1, altitude: 8000, velocity: 420, heading: 90, onGround: false, verticalRate: 3 },
    'TK789': { latitude: 41.0, longitude: 29.0, altitude: 11000, velocity: 480, heading: 270, onGround: false, verticalRate: 2 }
  };
  
  if (mockFlights[flightNumber]) {
    return res.json({
      flightNumber: flightNumber,
      ...mockFlights[flightNumber],
      icao24: 'N/A'
    });
  }
  
  return res.status(404).json({ 
    error: 'Lot nie znaleziony. Dostępne loty testowe: LO123, FR456, TK789' 
  });
});

app.post('/api/login', async (req, res) => {
    try {
        // Input validation
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email i hasło są wymagane' });
        }
        
        const result = await loginUser(email, password);
        res.status(200).json({
            message: 'Zalogowano pomyślnie!',
            token: result.token,
            user: result.user
        });
    } catch (err) {
        // Return 400 for validation errors, 401 for authentication failures
        const statusCode = err.type === 'VALIDATION_ERROR' ? 400 : 401;
        res.status(statusCode).json({ message: err.message });
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})