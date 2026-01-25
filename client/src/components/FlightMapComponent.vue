<template>
  <div class="flight-map-component">
    <div class="flight-tracker-container">
      <div class="search-section">
        <h1>🛫 Śledzenie lotu</h1>
        <div class="search-input-group">
          <input 
            v-model="flightNumber" 
            placeholder="Wpisz numer lotu (np. LO 123, FR 456)" 
            @keyup.enter="trackFlight"
            class="flight-input"
          >
          <button @click="trackFlight" :disabled="isLoading" class="track-button">
            {{ isLoading ? '⏳ Śledzenie...' : '🔍 Śledź lot' }}
          </button>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="flightData && !isLoading" class="flight-info-panel">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Numer lotu:</span>
              <span class="value">{{ flightData.flightNumber }}</span>
            </div>
            <div class="info-item">
              <span class="label">Szerokość geograficzna:</span>
              <span class="value">{{ flightData.latitude?.toFixed(4) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Długość geograficzna:</span>
              <span class="value">{{ flightData.longitude?.toFixed(4) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Wysokość:</span>
              <span class="value">{{ (flightData.altitude * 3.28084).toFixed(0) }} ft</span>
            </div>
            <div class="info-item">
              <span class="label">Prędkość:</span>
              <span class="value">{{ (flightData.velocity * 1.94384).toFixed(1) }} kt</span>
            </div>
            <div class="info-item">
              <span class="label">Kierunek:</span>
              <span class="value">{{ flightData.heading ? flightData.heading.toFixed(1) + '°' : 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Tempo wznoszenia:</span>
              <span class="value">{{ (flightData.verticalRate * 196.85).toFixed(1) }} fpm</span>
            </div>
            <div class="info-item">
              <span class="label">Status:</span>
              <span class="value" :class="{ 'in-air': !flightData.onGround, 'on-ground': flightData.onGround }">
                {{ flightData.onGround ? '🛬 Na ziemi' : '✈️ W powietrzu' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="map-section">
        <div id="map" class="map-container"></div>
        <div v-if="!flightData && !isLoading" class="map-placeholder">
          Wpisz numer lotu i kliknij "Śledź lot", aby zobaczyć pozycję samolotu na mapie
        </div>
      </div>
    </div>

    <div class="live-update-toggle">
      <label>
        <input v-model="autoRefresh" type="checkbox">
        Automatyczne odświeżanie (co 5 sekund)
      </label>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000'

export default {
  name: 'FlightMapComponent',
  data() {
    return {
      flightNumber: '',
      flightData: null,
      isLoading: false,
      errorMessage: '',
      autoRefresh: false,
      refreshInterval: null,
      map: null,
      marker: null,
      polyline: null,
      trackHistory: []
    }
  },
  watch: {
    autoRefresh(newVal) {
      if (newVal && this.flightNumber) {
        this.startAutoRefresh()
      } else {
        this.stopAutoRefresh()
      }
    }
  },
  mounted() {
    this.initMap()
  },
  beforeUnmount() {
    this.stopAutoRefresh()
    if (this.map) {
      try {
        this.map.remove()
      } catch (error) {
        console.error('Błąd przy usuwaniu mapy:', error)
      }
    }
  },
  methods: {
    initMap() {
      // Bezpośrednio tworzymy mapę (Leaflet jest już załadowany)
      this.$nextTick(() => {
        this.createMap()
      })
    },

    createMap() {
      try {
        const mapElement = document.getElementById('map')
        if (!mapElement || this.map) return

        // Inicjalizacja mapy na wschodniej Europie
        this.map = L.map('map').setView([52.0, 19.0], 4)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(this.map)
      } catch (error) {
        console.error('Błąd inicjalizacji mapy:', error)
        this.errorMessage = 'Nie udało się załadować mapy'
      }
    },

    async trackFlight() {
      if (!this.flightNumber.trim()) {
        this.errorMessage = 'Proszę wpisać numer lotu'
        return
      }

      this.isLoading = true
      this.errorMessage = ''
      this.trackHistory = []

      try {
        const response = await fetch(`${API_BASE_URL}/api/flight/${encodeURIComponent(this.flightNumber)}`)
        
        console.log('Odpowiedź statusu:', response.status)
        console.log('Content-Type:', response.headers.get('content-type'))
        
        const responseText = await response.text()
        console.log('Całkowita odpowiedź:', responseText)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${responseText}`)
        }

        this.flightData = JSON.parse(responseText)
        this.trackHistory.push({
          latitude: this.flightData.latitude,
          longitude: this.flightData.longitude,
          timestamp: Date.now()
        })
        this.updateMapMarker()

        // Jeśli autorefresh jest włączony, uruchom odświeżanie
        if (this.autoRefresh) {
          this.startAutoRefresh()
        }
      } catch (error) {
        this.errorMessage = `Błąd: ${error.message}`
        console.error('Błąd śledzenia lotu:', error)
        this.flightData = null
      } finally {
        this.isLoading = false
      }
    },

    updateMapMarker() {
      if (!this.map || !this.flightData) return

      const { latitude, longitude, heading } = this.flightData

      // Usuń stary marker
      if (this.marker) {
        this.map.removeLayer(this.marker)
      }

      // Stwórz custom ikonę samolotu
      const planeIcon = L.divIcon({
        html: `<div style="transform: rotate(${heading || 0}deg); font-size: 30px;">✈️</div>`,
        iconSize: [30, 30],
        className: 'plane-marker'
      })

      // Dodaj nowy marker
      this.marker = L.marker([latitude, longitude], { icon: planeIcon })
        .bindPopup(`
          <div class="plane-popup">
            <strong>${this.flightData.flightNumber}</strong><br/>
            Wysokość: ${(this.flightData.altitude * 3.28084).toFixed(0)} ft<br/>
            Prędkość: ${(this.flightData.velocity * 1.94384).toFixed(1)} kt
          </div>
        `)
        .addTo(this.map)

      // Dodaj punkt do historii
      this.trackHistory.push({
        latitude,
        longitude,
        timestamp: Date.now()
      })

      // Rysuj ścieżkę
      if (this.trackHistory.length > 1) {
        if (this.polyline) {
          this.map.removeLayer(this.polyline)
        }

        const polylinePoints = this.trackHistory.map(point => [point.latitude, point.longitude])
        this.polyline = L.polyline(polylinePoints, {
          color: '#3498db',
          weight: 2,
          opacity: 0.7
        }).addTo(this.map)
      }

      // Wycentruj mapę na samolocie
      this.map.setView([latitude, longitude], 6)
    },

    startAutoRefresh() {
      this.stopAutoRefresh()
      this.refreshInterval = setInterval(() => {
        this.trackFlight()
      }, 5000)
    },

    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
        this.refreshInterval = null
      }
    }
  }
}
</script>

<style scoped>
.flight-map-component {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Arial', sans-serif;
  background: #f5f5f5;
}

.flight-tracker-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-section h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
}

.search-input-group {
  display: flex;
  gap: 10px;
}

.flight-input {
  flex: 1;
  padding: 12px 15px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.flight-input:focus {
  outline: none;
  border-color: #3498db;
}

.track-button {
  padding: 12px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.track-button:hover:not(:disabled) {
  background: #2980b9;
}

.track-button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px 15px;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
}

.flight-info-panel {
  background: #ecf0f1;
  padding: 20px;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item .label {
  font-weight: bold;
  color: #555;
  font-size: 12px;
  text-transform: uppercase;
}

.info-item .value {
  font-size: 18px;
  color: #2c3e50;
  font-weight: bold;
}

.value.in-air {
  color: #27ae60;
}

.value.on-ground {
  color: #e74c3c;
}

.map-section {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  z-index: 1;
}

.map-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #95a5a6;
  font-size: 16px;
  z-index: 0;
  pointer-events: none;
}

.live-update-toggle {
  padding: 15px 20px;
  background: white;
  border-top: 1px solid #ddd;
  text-align: center;
}

.live-update-toggle label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
}

.live-update-toggle input {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

/* Responsywność */
@media (max-width: 1024px) {
  .flight-tracker-container {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* Style dla markera samolotu */
:deep(.plane-marker) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.plane-popup) {
  padding: 5px;
}
</style>
