<template>
  <div class="flight-card">
    <div class="card-main">
      <div class="flight-info">
        <div class="airlines">
          <span v-for="airline in flightData.airlines" :key="airline" class="airline-logo">
            {{ airline.toUpperCase() }}
          </span>
        </div>
        <div class="route">
          <span class="city">{{ flightData.from }}</span>
          <span class="arrow">→</span>
          <span class="city">{{ flightData.to }}</span>
        </div>
        <div class="time-and-desc">
          <span class="time">{{ flightData.time }}</span>
          <span class="description">{{ flightData.description }}</span>
        </div>
      </div>
      <div class="price-section">
        <div class="price-label">Cena</div>
        <div class="price">{{ flightData.price }} PLN</div>
        <button class="buy-button">Kup bilet</button>
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
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid #e0e6ec;
}

.card-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flight-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.airlines {
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: bold;
  color: #555;
}

.route {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.arrow {
  margin: 0 10px;
  color: #888;
}

.time-and-desc {
    display: flex;
    align-items: center;
    gap: 15px;
    color: #666;
    font-size: 14px;
}

.airline {
  color: #666;
}

.price-section {
  text-align: right;
}

.price-label {
    font-size: 12px;
    color: #888;
    margin-bottom: 4px;
}

.price {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.buy-button {
  background-color: #0057B7;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.buy-button:hover {
  background-color: #004494;
}
</style>