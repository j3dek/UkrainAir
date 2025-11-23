<template>
  <div id="flight-app">
    <header class="header-section">
      <div class="header-content">
        <div class="logo">UkrainAir</div>
        <FlightSearchForm />
      </div>
    </header>

    <main class="main-content">
      <div class="results-container">
        <FiltersComponent />
        <ResultsList :flights="mockFlights" />
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
import FiltersComponent from './FiltersComponent.vue';
import FlightSearchForm from './FlightSearchForm.vue';

export default {
  name: 'HomeComponent',
  components: {
    FlightSearchForm,
    ResultsList,
    FiltersComponent,
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

<style scoped>
#flight-app {
  font-family: Arial, sans-serif;
  padding: 0;
}

.header-section {
  background: linear-gradient(to bottom, #0057B7 0%, #0057B7 50%, #FFD700 50%, #FFD700 100%);
  padding: 40px 20px;
  color: white;
  position: relative;
  border-bottom-right-radius: 25px;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
}

.main-content {
  width: 100%;
  max-width: 1200px;
  margin: 50px auto 0 auto;
  position: relative;
  z-index: 2;
  padding: 0 20px;
  box-sizing: border-box
}

.results-container {
  display: grid;
  grid-template-columns: 280px 1fr; 
  gap: 20px;
  align-items: flex-start;
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
