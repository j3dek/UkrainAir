<template>
  <div class="flight-card">
    <div class="route">
      <span class="city">{{ flightData.from }}</span>
      <span class="arrow">→</span>
      <span class="city">{{ flightData.to }}</span>
    </div>
    <div class="details">
      <div class="info">
        <span class="airline">{{ flightData.airline }}</span>
        <span class="time">{{ flightData.time }}</span>
      </div>
      <div class="price">
        {{ flightData.price }} PLN
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FlightCard',
  props: {
    flightData: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.flight-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  margin: 10px;
  background-color: white;
}

.route {
  font-size: 1.5em;
  font-weight: bold;
}

.arrow {
  margin: 0 10px;
  color: #3f51b5;
}

.details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.airline {
  color: #666;
}

.price {
  font-size: 1.4em;
  color: #4caf50;
}
</style>