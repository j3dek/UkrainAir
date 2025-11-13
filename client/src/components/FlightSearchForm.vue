<template>
    <div class="flight-search-form-background">
    <h1>Z nami znajdziesz ucieczke</h1>
        <div class="flight-search-form">
            <form @submit.prevent="handleSearchClick">
                <div class="form-grid">
                    <div class="form-field-wrapper">
                        <label for="departure">Miasto Wylotu</label>
                        <input
                            id="departure"
                            v-model="formState.departureCity"
                            type="text"
                            placeholder="np. Warszawa"
                            required
                            autocomplete="off"
                            @input="onCityInput('departure', formState.departureCity)"
                            @blur="() => (departureSuggestions = [])"
                        />
                        <ul v-if="departureSuggestions.length > 0" class="suggestions-list">
                            <li
                                v-for="city in departureSuggestions"
                                :key="city"
                                @mousedown="selectCity('departure', city)"
                            >
                                {{ city }}
                            </li>
                        </ul>
                    </div>

                    <div class="form-field-wrapper">
                        <label for="arrival">Miasto Docelowe</label>
                        <input
                            id="arrival"
                            v-model="formState.arrivalCity"
                            type="text"
                            placeholder="np. Berlin"
                            required
                            autocomplete="off"
                            @input="onCityInput('arrival', formState.arrivalCity)"
                            @blur="() => (arrivalSuggestions = [])"
                        />
                        <ul v-if="arrivalSuggestions.length > 0" class="suggestions-list">
                            <li
                                v-for="city in arrivalSuggestions"
                                :key="city"
                                @mousedown="selectCity('arrival', city)"
                            >
                                {{ city }}
                            </li>
                        </ul>
                    </div>

                    <div class="form-field-wrapper">
                        <label for="departure-date">Data Wylotu</label>
                        <input
                            id="departure-date"
                            v-model="formState.departureDate"
                            type="date"
                            :min="today"
                            required
                        />
                    </div>

                    <div class="form-field-wrapper">
                        <label for="return-date">Data Powrotu (opcjonalnie)</label>
                        <input
                        id="return-date"
                        v-model="formState.returnDate"
                        type="date"
                        :min="formState.departureDate || today"
                        />
                    </div>
                </div>

                <div class="bottom-row">
                    <div class="form-field checkbox-field">
                        <label class="checkbox-label">
                        <input
                            v-model="isCheckboxChecked"
                            id="ukrainiec"
                            type="checkbox"
                            class="checkbox-input"
                        />
                        <span class="checkbox-custom"></span>
                        <span class="checkbox-text">Jestem Ukraińcem</span>
                        
                        <div v-if="formState.isUkrainian">
                            <img src="@/assets/slavaUkraine.jpg" alt="Slava Ukraine" width="30" height="20" />
                        </div>

                        </label>
                    </div>

                    <div v-if="errorMessage" class="error-message">
                        {{ errorMessage }}
                    </div>

                    <button type="submit" class="search-button">Szukaj</button>
                </div>
            </form>
        </div>
        <div v-if="isCaptchaVisible" class="captcha-overlay" @click.self="handleCaptchaFailure">
            <div class="captcha-modal">
                <h2>Weryfikacja</h2>
                <p>Aby kontynuować, wybierz poprawną flagę.</p>
                <div class="captcha-images">
                    <div class="captcha-image" @click="handleCaptchaSuccess">
                        <img :src="ukraineFlag" alt="Flaga Ukrainy" />
                    </div>
                    <div class="captcha-image" @click="handleCaptchaFailure">
                        <img :src="polandFlag" alt="Flaga Polski" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const formState = reactive({
    departureCity: '',
    arrivalCity: '',
    departureDate: '',
    returnDate: '',
    isUkrainian: false,
});

const errorMessage = ref('');
const isCaptchaVisible = ref(false);

const allCities = [
    'Warszawa', 'Kraków', 'Gdańsk', 'Wrocław', 'Poznań', 'Berlin', 'Paryż', 'Londyn', 'Rzym', 'Madryt', 'Praga', 'Kijów'
];

const departureSuggestions = ref([]);
const arrivalSuggestions = ref([]);
let debounceTimer = null;

const polandFlag = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjgwIDgwMCI+PGc+PHJlY3Qgd2lkdGg9IjEyODAiIGhlaWdodD0iODAwIiBmaWxsPSIjZGMxNDNkIi8+PHJlY3Qgd2lkdGg9IjEyODAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZmZmIi8+PC9nPjwvc3ZnPg==';
const ukraineFlag = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5MDAgNjAwIj48cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwNTdiNyIvPjxyZWN0IHdpZHRoPSI5MDAiIGhlaWdodD0iMzAwIiB5PSIzMDAiIGZpbGw9IiNmZmM3MDAiLz48L3N2Zz4=';


const onCityInput = (field, query) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        if (query.length === 0) {
            if (field === 'departure') departureSuggestions.value = [];
            else arrivalSuggestions.value = [];
            return;
        }
        const filteredCities = allCities.filter(city => 
            city.toLowerCase().startsWith(query.toLowerCase())
        );
        if (field === 'departure') {
            departureSuggestions.value = filteredCities;
        } else {
            arrivalSuggestions.value = filteredCities;
        }
    }, 300);
};

const selectCity = (field, city) => {
    if (field === 'departure') {
        formState.departureCity = city;
        departureSuggestions.value = [];
    } else {
        formState.arrivalCity = city;
        arrivalSuggestions.value = [];
    }
};

const today = computed(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
});

const isCheckboxChecked = computed({
    get: () => formState.isUkrainian,
    set: (value) => {
        if (value) {
            isCaptchaVisible.value = true;
        } else {
            formState.isUkrainian = false;
        }
    }
});

const handleCaptchaSuccess = () => {
    isCaptchaVisible.value = false;
    formState.isUkrainian = true;
    errorMessage.value = '';
};

const handleCaptchaFailure = () => {
    isCaptchaVisible.value = false;
    formState.isUkrainian = false;
};

const handleSearchClick = () => {
    errorMessage.value = '';

    if (formState.departureCity && formState.departureCity.trim().toLowerCase() === formState.arrivalCity.trim().toLowerCase()) {
        errorMessage.value = 'Miasto wylotu i przylotu nie może być takie samo.';
        return;
    }

    if (!formState.isUkrainian) {
        errorMessage.value = 'Wyszukiwanie dostępne tylko dla zweryfikowanych Ukraińców.';
        return;
    }

    if (formState.returnDate && formState.departureDate > formState.returnDate) {
        errorMessage.value = 'Data powrotu nie może być wcześniejsza niż data wylotu.';
        return;
    }

    if (formState.arrivalCity.toLowerCase() === 'warszawa' && formState.isUkrainian) {
        errorMessage.value = 'Polska dla Polaków, wybierz Niemcy';
        return;
    }

    submitForm();
};

const submitForm = async () => {
    const payload = {
        departure: formState.departureCity,
        arrival: formState.arrivalCity,
        departureDate: formState.departureDate,
        returnDate: formState.returnDate || '',
        ukrainiec: formState.isUkrainian
    };

    console.log('Szukaj lotu z:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch('https://api.example.com/flights/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        });

        if (!response.ok) {
        throw new Error(`Błąd serwera: ${response.status}`);
        }

        const data = await response.json();
        console.log('Odpowiedź z serwera:', data);
        alert('Weryfikacja pomyślna! Wyszukiwanie zakończone. Sprawdź konsolę.');

    } catch (error) {
        console.error('Błąd podczas wysyłania zapytania:', error);
        errorMessage.value = 'Wystąpił błąd podczas wyszukiwania lotów. Spróbuj ponownie.';
    }
};
</script>

<style scoped>
.flight-search-form-background {
    background: linear-gradient(to bottom, #0057B7 0%, #0057B7 50%, #FFD700 50%, #FFD700 100%);
    padding: 60px 20px;
    min-height: 400px;
    font-family: sans-serif;
}
h1 {
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
.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}
.form-field-wrapper {
    position: relative;
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
.suggestions-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-top: none;
    border-radius: 0 0 6px 6px;
    list-style: none;
    margin: 0;
    padding: 0;
    z-index: 10;
    max-height: 150px;
    overflow-y: auto;
}
.suggestions-list li {
    padding: 10px 12px;
    cursor: pointer;
}
.suggestions-list li:hover {
    background-color: #f0f0f0;
}
.bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}
.checkbox-field {
    display: flex;
    align-items: center;
}
.checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    position: relative;
    user-select: none;
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
    margin-left: auto;
}
.search-button:hover {
    background-color: #004494;
}
.error-message {
    padding: 10px;
    background-color: #f8d7da;
    color: #721c24;
    border-radius: 6px;
    font-weight: 500;
    flex-grow: 1;
}

.captcha-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
.captcha-modal {
    background: white;
    padding: 30px 40px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}
.captcha-modal h2 {
    margin-top: 0;
    color: #333;
}
.captcha-modal p {
    color: #666;
    margin-bottom: 20px;
}
.captcha-images {
    display: flex;
    gap: 20px;
}
.captcha-image {
    cursor: pointer;
    border: 2px solid #ddd;
    border-radius: 8px;
    padding: 5px;
    transition: transform 0.2s ease, border-color 0.2s ease;
}
.captcha-image:hover {
    transform: scale(1.05);
    border-color: #0057B7;
}
.captcha-image img {
    display: block;
    width: 150px;
    height: auto;
    border-radius: 4px;
}
</style>