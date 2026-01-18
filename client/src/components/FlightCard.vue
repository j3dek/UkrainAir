<template>
  <div class="flight-card">
    <div class="card-header">
      <span class="airline-badge">{{ flightData.airline }}</span>
      <span class="flight-number" v-if="flightData.flightNumber && flightData.flightNumber !== 'N/A'">
        {{ flightData.flightNumber }}
      </span>
    </div>
    <div class="route">
      <span class="city">{{ flightData.from }}</span>
      <span class="arrow">-</span>
      <span class="city">{{ flightData.to }}</span>
    </div>
    <div class="details">
      <div class="info">
        <div class="time-info">
          <span class="label">Godzina:</span>
          <span class="time">{{ flightData.time }}</span>
        </div>
        <div class="duration-info" v-if="flightData.duration && flightData.duration !== 'N/A'">
          <span class="label">Czas lotu:</span>
          <span class="duration">{{ flightData.duration }}</span>
        </div>
        <div class="date-info" v-if="flightData.date">
          <span class="label">Data:</span>
          <span class="date">{{ flightData.date }}</span>
        </div>
      </div>
      <div class="price-section">
        <span class="price-label">od</span>
        <div class="price">
          {{ formatPrice(flightData.price) }}
        </div>
      </div>
    </div>
    <button class="book-button">Wybierz</button>
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
  },
  methods: {
    formatPrice(price) {
      if (price === 'N/A' || price === undefined || price === null) {
        return 'N/A';
      }
      if (typeof price === 'number') {
        return `${price.toFixed(2)} PLN`;
      }
      return price;
    }
  }
};
</script>

<style scoped>
.flight-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin: 10px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.flight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.airline-badge {
  background: #0057B7;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 600;
}

.flight-number {
  color: #666;
  font-size: 0.85em;
}

.route {
  font-size: 1.3em;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
  color: #333;
}

.arrow {
  font-size: 1.2em;
}

.details {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info .label {
  color: #999;
  font-size: 0.8em;
  margin-right: 5px;
}

.time, .duration, .date {
  color: #333;
  font-weight: 500;
}

.price-section {
  text-align: right;
}

.price-label {
  color: #999;
  font-size: 0.8em;
}

.price {
  font-size: 1.5em;
  color: #0057B7;
  font-weight: 700;
}

.book-button {
  width: 100%;
  padding: 12px;
  background: #FFD700;
  color: #003f8a;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.book-button:hover {
  background: #e6c200;
}
</style>