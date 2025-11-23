<template>
  <div class="filters-panel">
    <h3>Filtry</h3>
    <div class="filter-section">
      <div class="filter-header">
        <span>Cena</span>
        <span class="arrow">^</span>
      </div>
    </div>
    <div class="filter-section">
      <div class="filter-header">
        <span>Linie Lotnicze</span>
        <span class="arrow">^</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FiltersComponent'
}
</script>

<style scoped>
.filters-panel {
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.filters-panel h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  color: #333;
}

.filter-section {
  border-bottom: 1px solid #eee;
  padding: 15px 0;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  cursor: pointer;
}

.arrow {
  font-weight: bold;
}

.flights-header {
    margin-top: 30px;
}
</style>