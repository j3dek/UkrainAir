<template>
  <div class="display-flights-component">
    <h1>Dostępne loty:</h1>
    
    <div class="filters">
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
        :key="flight.id"
        :airline="flight.airline"
        :price="flight.price"
        :departure-time="flight.departureTime"
        :arrival-time="flight.arrivalTime"
        :from="flight.from"
        :to="flight.to"
        :duration="flight.duration"
        :flight-number="flight.flightNumber"
        :luggage-included="flight.luggageIncluded"
      />
    </div>

    <div v-if="filteredFlights.length === 0" class="no-flights">
      Brak lotów spełniających kryteria wyszukiwania
    </div>

    <button @click="$router.push('/')" class="back-btn">
      ← Powrót do strony głównej
    </button>
  </div>
</template>

<script>
import FlightBlockComponent from './FlightBlockComponent.vue'

export default {
  name: 'DisplayFlightsComponent',
  components: {
    FlightBlockComponent
  },
  data() {
    return {
      searchQuery: '',
      sortBy: 'price',
      flights: [
        {
          id: 1,
          airline: 'LOT Polish Airlines',
          flightNumber: 'LO 123',
          from: 'WAW',
          to: 'FRA',
          departureTime: '08:15',
          arrivalTime: '10:30',
          duration: '2h 15m',
          price: 299,
          luggageIncluded: true
        },
        {
          id: 2,
          airline: 'Ryanair',
          flightNumber: 'FR 456',
          from: 'WMI',
          to: 'STN',
          departureTime: '12:45',
          arrivalTime: '14:20',
          duration: '1h 35m',
          price: 189,
          luggageIncluded: false
        },
        {
          id: 3,
          airline: 'Lufthansa',
          flightNumber: 'LH 789',
          from: 'WAW',
          to: 'MUC',
          departureTime: '16:30',
          arrivalTime: '18:15',
          duration: '1h 45m',
          price: 349,
          luggageIncluded: true
        },
        {
          id: 4,
          airline: 'Wizz Air',
          flightNumber: 'W6 321',
          from: 'KTW',
          to: 'LTN',
          departureTime: '20:10',
          arrivalTime: '21:55',
          duration: '1h 45m',
          price: 159,
          luggageIncluded: false
        }
      ]
    }
  },
  computed: {
    filteredFlights() {
      let filtered = this.flights
      
      // Filtrowanie
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(flight => 
          flight.airline.toLowerCase().includes(query) ||
          flight.from.toLowerCase().includes(query) ||
          flight.to.toLowerCase().includes(query)
        )
      }
      
      // Sortowanie
      filtered = [...filtered].sort((a, b) => {
        switch (this.sortBy) {
          case 'price':
            return a.price - b.price
          case 'departure':
            return a.departureTime.localeCompare(b.departureTime)
          case 'airline':
            return a.airline.localeCompare(b.airline)
          default:
            return 0
        }
      })
      
      return filtered
    }
  }
}
</script>

<style scoped>
.display-flights-component {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
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

.back-btn {
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s ease;
}

.back-btn:hover {
  background: #2980b9;
}

/* Responsywność */
@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .search-input, .sort-select {
    min-width: 100%;
  }
}
</style>