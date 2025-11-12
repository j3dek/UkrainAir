<template>
  <div id="flight-app">
    <header class="header-section">
      <SearchBar />
    </header>

    <main class="main-content">
      <h2>Dostępne loty ({{ mockFlights.length }})</h2>
      <ResultsList :flights="mockFlights" />
    </main>

    <section class="ad-section">
      <h2 class="ad-title">OGŁOSZENIA</h2>
      <AdSlider />
    </section>
  </div>
</template>

<script>
import SearchBar from './components/SearchBar.vue';
import ResultsList from './components/ResultsList.vue';
import AdSlider from './components/AdSlider.vue';

export default {
  components: {
    SearchBar,
    ResultsList,
    AdSlider
  },
  data() {
    return {
      mockFlights: [
        { id: 1, from: 'WAW', to: 'KRK', time: '08:00', price: 300, airline: 'LOT' },
        { id: 2, from: 'GDK', to: 'WRC', time: '12:30', price: 500, airline: 'Ryanair' },
        { id: 3, from: 'WAW', to: 'PZN', time: '16:00', price: 200, airline: 'Wizz' },
        { id: 4, from: 'PZN', to: 'GDK', time: '20:15', price: 500, airline: 'LOT' },
      ]
    }
  }
}
</script>

<style>
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