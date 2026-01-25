# UkrainAir


. LOT Polish Airlines (PLL LOT)
Ryanair
🇭🇺 3. Wizz Air
Lufthansa
KLM
easyJet
Turkish Airlines
Emirates / Qatar Airways

Websocket



✈️ Podstawowe funkcjonalności MVP
🔍 1. Wyszukiwanie lotów

Pole wyboru miasta wylotu (np. Warszawa, Kraków).

Pole wyboru miasta docelowego (np. Londyn, Paryż).

Wybór daty wylotu i daty powrotu (opcjonalnej).

Przycisk „Szukaj”, uruchamiający zapytanie do API.

📊 2. Porównywanie ofert

Pobieranie danych z API linii lotniczych lub agregatorów (np. Kiwi, Skyscanner, Amadeus).

Wyświetlanie listy ofert zawierającej:

nazwę linii lotniczej,

cenę biletu,

datę i godzinę lotu,

długość trwania podróży,

liczbę przesiadek (jeśli są).

⚙️ 3. Filtrowanie i sortowanie wyników

Filtry:

Cena (od najniższej do najwyższej),

Linie lotnicze (np. tylko LOT, Ryanair, Wizz Air),

Liczba przesiadek (bezpośrednie / z przesiadkami),

Czas lotu.

Sortowanie:

według ceny,

według godziny wylotu,

według czasu trwania.

💸 4. Przekierowanie do zakupu

Każda oferta zawiera link „Kup bilet”, który prowadzi na oficjalną stronę linii lotniczej lub partnera.

Możliwość otwarcia w nowej karcie.

💾 5. Historia wyszukiwań (opcjonalnie w MVP)

Zapis ostatnich wyszukiwań użytkownika w localStorage lub w bazie danych.

Ułatwia szybkie ponowne wyszukanie.

🌐 6. Interfejs użytkownika (UI)

Prosty i lekki design:

Pasek wyszukiwania u góry,

Lista wyników w formie kart,

Filtry z boku lub na górze.

Responsywność – działa na telefonach i desktopie.




**Konfiguracja**

Tworzenie bazy danych mongo w dockerze

*docker run -d --name mongo -p 27017:27017 mongo:latest*

Instalacja pakientów za pomocą komendy 

*npm install*

Frontend odpalany jest z pliku client

*npm run serve*

Backend odpalany jest z pliku server

*node index.js*


plik .env w server

JWT_SECRET=

MONGO_URI=mongodb://127.0.0.1:27017/mojabazax

saltRounds=

PORT=


plik .env w client

VUE_APP_API_BASE_URL=

