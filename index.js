const express = require('express');
const cors = require('cors');
const { scrapeFlights } = require('./services/ryanair/ryanair-webscraper');
const { LufthansaScraper } = require('./services/lufthansa/lufthansa-scraper');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.json({ message: 'UkrainAir API is running', status: 'ok' });
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

        // Wywołaj scraper
        const flights = await scrapeFlights(departure, arrival, departureDate, returnDate);
        

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

app.post('/api/flights/search-lufthansa', async (req, res) => {
  try {
    const { departure, arrival, departureDate, returnDate, ukrainiec } = req.body;

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

    const scraper = new LufthansaScraper();
    const flights = await scraper.getFlightsByCities(departure, arrival, departureDate, returnDate);

    res.json({
      success: true,
      count: flights.length,
      flights,
      searchParams: { departure, arrival, departureDate, returnDate }
    });
  } catch (error) {
    console.error('Błąd podczas wyszukiwania lotów (Lufthansa):', error);
    res.status(500).json({
      error: 'Wystąpił błąd podczas wyszukiwania lotów (Lufthansa)',
      details: error.message
    });
  }
});

app.listen(port, () => {
    console.log(`UkrainAir API listening on port ${port}`);
    console.log(`Endpoint: http://localhost:${port}/api/flights/search`);
});