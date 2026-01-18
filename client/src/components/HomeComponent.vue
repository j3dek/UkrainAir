<template>
  <div id="flight-app">
    <header class="header-section">
      <FlightSearchForm @search-results="handleSearchResults" @search-loading="handleSearchLoading" />
    </header>

    <main class="main-content">
      <div v-if="isLoading" class="loading-container">
        <div class="loader"></div>
        <p>Szukam lotów... To może chwilę potrwać.</p>
      </div>
      
      <div v-else-if="hasSearched">
        <h2 v-if="flights.length > 0">Znalezione loty ({{ flights.length }})</h2>
        <h2 v-else>Nie znaleziono lotów</h2>
        <p v-if="flights.length === 0" class="no-results">Spróbuj zmienić parametry wyszukiwania.</p>
        <ResultsList :flights="flights" />
      </div>
      
      <div v-else>
        <h2>Wyszukaj loty</h2>
        <p class="info-text">Wprowadź dane powyżej, aby znaleźć najlepsze połączenia lotnicze.</p>
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
      hasSearched: false
    }
  },
  methods: {
    handleSearchResults(results) {
      this.flights = results;
      this.hasSearched = true;
      this.isLoading = false;
    },
    handleSearchLoading(loading) {
      this.isLoading = loading;
      if (loading) {
        this.flights = [];
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

.main-content {
  padding: 20px;
}

.main-content h2 {
    margin-bottom: 15px;
    color: #333;
    margin: 10px;
}

.info-text {
  color: #666;
  text-align: center;
  margin: 20px;
}

.no-results {
  color: #666;
  text-align: center;
  margin: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loader {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #0057B7;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
