<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <div>
    <h1>Test Search History</h1>
    <SearchHistory :modelValue="searchQuery" @select="onSelect"
    @historyChanged="onHistoryChanged" />

    <button @click="addTestItem" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
      test
    </button>
  </div>
  <HelloWorld msg="Welcome to Your Vue.js App" />
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

import SearchHistory from './components/SearchHistory.vue';

export default {
  name: 'App',
  components: {
    HelloWorld,
    SearchHistory
  }
}
</script>
<script setup>

import { ref } from "vue";
import SearchHistory from "./components/SearchHistory.vue";

const searchQuery = ref("");


function addTestItem() {
  
  const newEntry = "Test search " + Date.now(); // albo inny unikalny tekst

  
  const raw = localStorage.getItem("searchHistory");
  const history = raw ? JSON.parse(raw) : [];

  
  const updated = [newEntry, ...history];

  
  localStorage.setItem("searchHistory", JSON.stringify(updated));

  console.log("Dodano:", newEntry);
  
  
  window.dispatchEvent(new Event("storage"));
}



function onSelect(item) {
  console.log("Kliknięto element:", item);
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
