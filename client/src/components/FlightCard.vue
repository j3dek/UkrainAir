<template>
  <div class="flight-card">
    <div class="route">
      <span class="city">{{ fromCity }}</span>
      <span class="arrow">→</span>
      <span class="city">{{ toCity }}</span>
    </div>
    <div class="details">
      <div class="info">
        <span class="airline">{{ airlineName }}</span>
        <span class="time">{{ flightTime }}</span>
        <span v-if="flightData.duration" class="duration">({{ flightData.duration }})</span>
      </div>
      <div class="price">
        {{ flightPrice }} {{ currency }}
      </div>
    </div>
    <div v-if="flightData.stops !== undefined" class="stops">
      {{ flightData.stops === 0 ? 'Lot bezpośredni' : `Przesiadki: ${flightData.stops}` }}
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
  },
  computed: {
    fromCity() {
      return this.flightData.from || this.flightData.originCode || this.flightData.originCity || 'N/A';
    },
    toCity() {
      return this.flightData.to || this.flightData.destinationCode || this.flightData.destinationCity || 'N/A';
    },
    airlineName() {
      if (this.flightData.airline) return this.flightData.airline;
      if (this.flightData.airlines && this.flightData.airlines[0]) return this.flightData.airlines[0];
      
      // Wyciągnij linię lotniczą z numeru lotu (np. FR 1888 -> Ryanair)
      const flightNum = this.flightData.flightNumber || '';
      const airlineCode = flightNum.split(' ')[0] || flightNum.substring(0, 2);
      const airlineMap = {
        'FR': 'Ryanair',
        'LH': 'Lufthansa',
        'TK': 'Turkish Airlines',
        'LO': 'LOT',
        'W6': 'Wizz Air',
        'U2': 'easyJet'
      };
      return airlineMap[airlineCode] || airlineCode || 'Nieznana linia';
    },
    flightTime() {
      return this.flightData.time || this.flightData.departureTime || '';
    },
    flightPrice() {
      let price = this.flightData.price || 
             this.flightData.economyPrice || 
             this.flightData.dayLowestPrice || 
             'N/A';
      
      // Obsługa obiektu z Turkish Airlines { amount, currency }
      if (price && typeof price === 'object' && price.amount) {
        return price.amount;
      }
      
      // Usuń symbol waluty jeśli jest (np. "$29.35" -> "29.35")
      if (typeof price === 'string') {
        return price.replace(/[$€£]/, '').trim();
      }
      return price;
    },
    currency() {
      // Sprawdź obiekt economyPrice z Turkish Airlines
      const economyPrice = this.flightData.economyPrice;
      if (economyPrice && typeof economyPrice === 'object' && economyPrice.currency) {
        return economyPrice.currency;
      }
      
      // Sprawdź pole currency
      if (this.flightData.currency) {
        return this.flightData.currency;
      }
      
      // Wyciągnij walutę z ceny jako string
      const price = this.flightData.price || '';
      if (typeof price === 'string') {
        if (price.includes('$')) return 'USD';
        if (price.includes('€')) return 'EUR';
        if (price.includes('£')) return 'GBP';
      }
      return 'PLN';
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
  margin-top: 10px;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.airline {
  color: #666;
}

.time {
  font-weight: 500;
}

.duration {
  font-size: 0.9em;
  color: #888;
}

.price {
  font-size: 1.4em;
  color: #4caf50;
  font-weight: bold;
}

.stops {
  margin-top: 8px;
  font-size: 0.9em;
  color: #666;
}
</style>