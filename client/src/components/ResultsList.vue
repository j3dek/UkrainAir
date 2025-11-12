<template>
  <div class="results-grid">
    <FlightCard 
      v-for="flight in flights" 
      :key="flight.id" 
      :flight-data="flight"
    />
  </div>
</template>

<script>
import FlightCard from './FlightCard.vue';

export default {
  name: 'ResultsList',
  components: {
    FlightCard
  },
  props: {
    flights: {
      type: Array,
      default: () => []
    }
  }
};
</script>

<style scoped>
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px 0;
}
</style>