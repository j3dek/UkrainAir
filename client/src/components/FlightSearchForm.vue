<template>
    <div class="flight-search-form-background">
        <h1>Z nami znajdziesz ucieczke</h1>
        <div class="flight-search-form">
            <form @submit.prevent="handleSearchFlights">
                <div class="search-container">
                    <div class="form-group">
                        <div class="form-field">
                            <label for="departure">Miasto Wylotu</label>
                            <input 
                                id="departure"
                                v-model="searchData.departure"
                                type="text"
                                placeholder="np. Kijów"
                                required
                            />
                        </div>
                        
                        <div class="form-field">
                            <label for="departure-date">Data Wylotu</label>
                            <input 
                                id="departure-date"
                                v-model="searchData.departureDate"
                                type="date"
                                required
                            />
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="form-field">
                            <label for="arrival">Miasto Przylotu</label>
                            <input 
                                id="arrival"
                                v-model="searchData.arrival"
                                type="text"
                                placeholder="np. Warszawa"
                                required
                            />
                        </div>
                        
                        <div class="form-field">
                            <label for="return-date">Data Powrotu</label>
                            <input 
                                id="return-date"
                                v-model="searchData.returnDate"
                                type="date"
                            />
                        </div>
                    </div>
                    
                    <div class="form-field checkbox-field">
                        <label class="checkbox-label">
                            <input 
                                id="ukrainiec"
                                v-model="searchData.ukrainiec"
                                type="checkbox"
                                class="checkbox-input"
                            />
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Jestem Ukraińcem</span>
                            <div v-if ="searchData.ukrainiec">
                            <img src="@/assets/slavaUkraine.jpg" alt ="Slava Ukraine" width="30" height="20"/>
                            </div>
                        </label>
                    </div>

                    <button type="submit" class="search-button">Szukaj</button>
                </div>
                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>
            </form>
        </div>
    </div>
</template>

<script>


export default {
    name: 'FlightSearchForm',
    data() {
        return {
            searchData: {
                departure: '',
                arrival: '',
                departureDate: '',
                returnDate: '',
                ukrainiec: false
            },
            errorMessage: '',
            
        }
    },
    methods: {
        handleSearchFlights() {
            console.log('Szukaj lotu z:', this.searchData);

            if (this.searchData.arrival.toLowerCase() === 'warszawa' && this.searchData.ukrainiec) {
                this.errorMessage = 'Polska dla Polaków, wybierz Niemcy';
                return;
            }
            if(this.searchData.ukrainiec){
                this.showImage = true;
            }

            // tutaj bedzie ukrainskie api
        }
    }
}
</script>

<style scoped>
.flight-search-form-background {
    background: linear-gradient(to bottom, #0057B7 0%, #0057B7 50%, #FFD700 50%, #FFD700 100%);
    padding: 60px 20px;
    min-height: 400px;
}

.flight-search-form-background h1 {
    color: white;
    margin-bottom: 30px;
    text-align: center;
}

.flight-search-form {
    max-width: 1000px;
    margin: 0 auto;
    padding: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 13px;
    background-color: #ffffff;
}

.search-container {
    display: flex;
    gap: 15px;
    align-items: flex-end;
    flex-wrap: wrap;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 15px;
    flex: 1 1 200px;
    min-width: 200px;
}

.form-field {
    width: 100%;
}

.checkbox-field {
    display: flex;
    align-items: center;
    margin-bottom: 0;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 0;
    cursor: pointer;
    position: relative;
}

.checkbox-input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
}

.checkbox-custom {
    width: 20px;
    height: 20px;
    border: 2px solid #0057B7;
    border-radius: 4px;
    display: inline-block;
    position: relative;
    background-color: white;
    transition: all 0.3s;
}

.checkbox-input:checked + .checkbox-custom {
    background-color: #0057B7;
}

.checkbox-input:checked + .checkbox-custom::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 2px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.checkbox-text {
    font-weight: 600;
    color: #333;
    font-size: 14px;
    user-select: none;
}

label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
    font-size: 14px;
}

input[type="text"],
input[type="date"] {
    width: 100%;
    padding: 12px;
    box-sizing: border-box;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
}

input[type="text"]:focus,
input[type="date"]:focus {
    outline: none;
    border-color: #0057B7;
}

input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    border-radius: 4px;
    padding: 4px;
}

input[type="date"]::-webkit-calendar-picker-indicator:hover {
    background-color: #f0f0f0;
}

.search-button {
    padding: 12px 40px;
    background-color: #0057B7;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
    flex-shrink: 0;
}

.search-button:hover {
    background-color: #004494;
}

.error-message {
    margin-top: 20px;
    padding: 15px;
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 6px;
    font-weight: 600;
    text-align: center;
}

/* tu bedzie responsywność ukraińska */
</style>