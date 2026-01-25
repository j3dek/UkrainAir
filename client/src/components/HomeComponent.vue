<template>
  <div id="flight-app">
    <header class="header-section">
      <FlightSearchForm @flights-found="handleFlightsFound" @search-start="handleSearchStart" />
    </header>

    <main class="main-content">
      <div v-if="isLoading" class="loading-message">
        <p>🔍 Wyszukiwanie lotów...</p>
      </div>
      <div v-else-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
      </div>
      <div v-else-if="flights.length > 0">
        <h2>Dostępne loty ({{ flights.length }})</h2>
        <ResultsList :flights="flights" />
      </div>
      <div v-else class="no-flights-message">
        <p>Wprowadź parametry wyszukiwania i kliknij "Szukaj"</p>
      </div>
    </main>

    <section class="ad-section">
      <h2 class="ad-title">OGŁOSZENIA</h2>
      <AdSlider />
    </section>
  </div>
</template>

<script>
import ResultsList from './ResultsList.vue';
import AdSlider from './AdSlider.vue';
import FlightSearchForm from './FlightSearchForm.vue';

export default {
  name: 'HomeComponent',
  components: {
    FlightSearchForm,
    ResultsList,
    AdSlider
  },
  data() {
    return {
      flights: [],
      isLoading: false,
      errorMessage: ''
    }
  },
  methods: {
    handleSearchStart() {
      this.isLoading = true;
      this.errorMessage = '';
      this.flights = [];
    },
    handleFlightsFound(data) {
      this.isLoading = false;
      if (data.error) {
        this.errorMessage = data.error;
        this.flights = [];
      } else {
        this.flights = data.flights || [];
        this.errorMessage = this.flights.length === 0 ? 'Brak dostępnych lotów dla wybranych parametrów' : '';
      }
    }
  }
}
</script>

<style scoped>
#flight-app {
  font-family: Arial, sans-serif;
  padding: 0;
}

.header-section {
  margin-bottom: 20px;
}

.main-content h2 {
    margin-bottom: 15px;
    color: #333;
    margin: 10px;
}

.loading-message {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
  color: #666;
}

.error-message {
  text-align: center;
  padding: 20px;
  color: #d32f2f;
  background: #ffebee;
  border-radius: 8px;
  margin: 10px;
}

.no-flights-message {
  text-align: center;
  padding: 40px;
  color: #666;
}

.ad-section {
    padding: 40px 0;
    text-align: center;
    margin-top: 30px;
}

.ad-title {
    font-size: 2.5em;
    font-weight: 900;
    color: #333;
    margin-bottom: 20px;
}
</style>
