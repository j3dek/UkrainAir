<template>
  <div class="display-flights-component">
    <h1>Dostępne loty:</h1>
    
    <div class="search-params">
      <div class="param-item">
        <label>Skąd:</label>
        <input v-model="departure" placeholder="np. Warszawa" class="param-input">
      </div>
      <div class="param-item">
        <label>Dokąd:</label>
        <input v-model="arrival" placeholder="np. Paryż" class="param-input">
      </div>
      <div class="param-item">
        <label>Data wylotu:</label>
        <input v-model="departureDate" type="date" class="param-input">
      </div>
      <div class="param-item">
        <label>Data powrotu (opcjonalnie):</label>
        <input v-model="returnDate" type="date" class="param-input">
      </div>
      <button @click="searchFlights" class="search-button" :disabled="isLoading">
        {{ isLoading ? 'Wyszukiwanie...' : 'Wyszukaj loty' }}
      </button>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div class="filters" v-if="flights.length > 0">
      <input v-model="searchQuery" placeholder="Wyszukaj lot..." class="search-input">
      <select v-model="sortBy" class="sort-select">
        <option value="price">Sortuj po cenie</option>
        <option value="departure">Sortuj po godzinie</option>
        <option value="airline">Sortuj po linii</option>
      </select>
    </div>

    <div class="flights-list">
      <FlightBlockComponent
        v-for="flight in filteredFlights"
        :key="flight.flightId || flight.id"
        :airline="flight.airline || flight.airlines?.[0] || 'Nieznana linia'"
        :price="flight.price || flight.economyPrice || flight.dayLowestPrice"
        :departure-time="flight.departureTime"
        :arrival-time="flight.arrivalTime"
        :from="flight.from || flight.originCode"
        :to="flight.to || flight.destinationCode"
        :duration="flight.duration"
        :flight-number="flight.flightNumber || flight.flightNumbers?.[0]"
        :luggage-included="flight.luggageIncluded"
      />
    </div>

    <div v-if="flights.length === 0 && !isLoading && !errorMessage" class="no-flights">
      Wprowadź parametry wyszukiwania i kliknij "Wyszukaj loty"
    </div>

    <div v-if="filteredFlights.length === 0 && flights.length > 0" class="no-flights">
      Brak lotów spełniających kryteria wyszukiwania
    </div>
  </div>
</template>

<script>
import FlightBlockComponent from './FlightBlockComponent.vue'

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000'

export default {
  name: 'DisplayFlightsComponent',
  components: {
    FlightBlockComponent
  },
  data() {
    return {
      departure: '',
      arrival: '',
      departureDate: '',
      returnDate: '',
      searchQuery: '',
      sortBy: 'price',
      flights: [],
      isLoading: false,
      errorMessage: ''
    }
  },
  computed: {
    filteredFlights() {
      let filtered = this.flights
      
      // Filtrowanie
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(flight => {
          const airline = (flight.airline || flight.airlines?.[0] || '').toLowerCase()
          const from = (flight.from || flight.originCode || '').toLowerCase()
          const to = (flight.to || flight.destinationCode || '').toLowerCase()
          
          return airline.includes(query) || from.includes(query) || to.includes(query)
        })
      }
      
      // Sortowanie
      filtered = [...filtered].sort((a, b) => {
        switch (this.sortBy) {
          case 'price': {
            const priceA = a.price || a.economyPrice || a.dayLowestPrice || 0
            const priceB = b.price || b.economyPrice || b.dayLowestPrice || 0
            return priceA - priceB
          }
          case 'departure':
            return (a.departureTime || '').localeCompare(b.departureTime || '')
          case 'airline': {
            const airlineA = (a.airline || a.airlines?.[0] || '').toLowerCase()
            const airlineB = (b.airline || b.airlines?.[0] || '').toLowerCase()
            return airlineA.localeCompare(airlineB)
          }
          default:
            return 0
        }
      })
      
      return filtered
    }
  },
  methods: {
    async searchFlights() {
      if (!this.departure || !this.arrival || !this.departureDate) {
        this.errorMessage = 'Proszę wypełnić pola: Skąd, Dokąd i Data wylotu'
        return
      }

      this.isLoading = true
      this.errorMessage = ''
      this.flights = []

      try {
        // Pobierz token użytkownika
        const token = localStorage.getItem('token')
        const ukrainiec = !!token // Uproszczona walidacja

        // Spróbuj najpierw pobierać z Ryanair
        const ryanairFlights = await this.fetchFlights(
          '/api/flights/search',
          { departure: this.departure, arrival: this.arrival, departureDate: this.departureDate, returnDate: this.returnDate, ukrainiec }
        )

        // Spróbuj pobierać z Lufthansy
        const lufthansaFlights = await this.fetchFlights(
          '/api/flights/search-lufthansa',
          { departure: this.departure, arrival: this.arrival, departureDate: this.departureDate, returnDate: this.returnDate, ukrainiec }
        ).catch(() => [])

        // Spróbuj pobierać z Turkish Airlines
        const turkishFlights = await this.fetchFlights(
          '/api/flights/search-turkish',
          { departure: this.departure, arrival: this.arrival, departureDate: this.departureDate, returnDate: this.returnDate, ukrainiec }
        ).catch(() => [])

        // Połącz wszystkie loty
        this.flights = [
          ...ryanairFlights,
          ...lufthansaFlights,
          ...turkishFlights
        ]

        if (this.flights.length === 0) {
          this.errorMessage = 'Brak dostępnych lotów dla wybranych parametrów'
        }
      } catch (error) {
        this.errorMessage = `Błąd podczas wyszukiwania: ${error.message}`
        console.error('Błąd wyszukiwania lotów:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchFlights(endpoint, searchParams) {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchParams)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data.flights || []
    }
  }
}
</script>

<style scoped>
.display-flights-component {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.search-params {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  align-items: flex-end;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-item label {
  font-weight: bold;
  color: #2c3e50;
  font-size: 14px;
}

.param-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.param-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
}

.search-button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.search-button:hover:not(:disabled) {
  background-color: #2980b9;
}

.search-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  border: 1px solid #f5c6cb;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.search-input, .sort-select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  flex: 1;
  min-width: 200px;
}

.search-input:focus, .sort-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
}

.flights-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.no-flights {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-size: 1.1em;
}

/* Responsywność */
@media (max-width: 768px) {
  .search-params {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
  }
  
  .search-input, .sort-select {
    min-width: 100%;
  }
}
</style>