<template>
  <div class="search-bar">
    <h3>Znajdź swój lot</h3>
    <form class="search-form">
      <input type="text" placeholder="Skąd" />
      <input type="text" placeholder="Dokąd" />
      <input type="date" />
      <button type="submit">Szukaj Lotów</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
};
</script>

<style scoped>
.search-bar {
  background-color: #3f51b5;
  padding: 20px;
  color: white;
}

.search-form {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.search-form input,
.search-form button {
  padding: 10px;
  border: none;
  border-radius: 4px;
}

.search-form button {
  background-color: #ff9800;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

h3 {
    font-size: 2em;
}
</style>