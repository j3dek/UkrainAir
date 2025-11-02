<template>
  <div class="flight-card">
    <div class="flight-header">
      <div class="airline">{{ airline }}</div>
      <div class="price">{{ price }} PLN</div>
    </div>
    
    <div class="flight-route">
      <div class="departure">
        <div class="time">{{ departureTime }}</div>
        <div class="airport">{{ from }}</div>
      </div>
      
      <div class="duration">
        <div class="line">―――― ✈️ ――――</div>
        <div class="duration-text">{{ duration }}</div>
      </div>
      
      <div class="arrival">
        <div class="time">{{ arrivalTime }}</div>
        <div class="airport">{{ to }}</div>
      </div>
    </div>
    
    <div class="flight-details">
      <div class="flight-number">Lot: {{ flightNumber }}</div>
      <div class="luggage" :class="{ 'included': luggageIncluded }">
        {{ luggageIncluded ? '🧳 Bagaż podręczny w cenie' : '🎒 Tylko bagaż podręczny' }}
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'FlightBlockComponent',
  props: {
    airline: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  arrivalTime: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  flightNumber: {
    type: String,
    required: true
  },
  luggageIncluded: {
    type: Boolean,
    default: false
  }
  }
}
</script>

<style scoped>
.flight-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  max-width: 400px;
  margin: 10px;
  font-family: 'Arial', sans-serif;
}

.flight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.airline {
  font-weight: bold;
  font-size: 1.1em;
  color: #2c3e50;
}

.price {
  font-weight: bold;
  font-size: 1.3em;
  color: #e74c3c;
}

.flight-route {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.departure, .arrival {
  text-align: center;
  flex: 1;
}

.time {
  font-size: 1.2em;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.airport {
  font-size: 0.9em;
  color: #7f8c8d;
}

.duration {
  text-align: center;
  flex: 2;
}

.line {
  color: #bdc3c7;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.duration-text {
  font-size: 0.8em;
  color: #7f8c8d;
}

.flight-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.flight-number {
  font-size: 0.9em;
  color: #7f8c8d;
}

.luggage {
  font-size: 0.85em;
  padding: 4px 8px;
  border-radius: 12px;
  background: #ecf0f1;
  color: #7f8c8d;
}

.luggage.included {
  background: #d5f4e6;
  color: #27ae60;
}
</style>
