<template>
  <header class="site-header">
    <div class="container">
          <div class="brand">
            <span class="logo-emoji" role="img" aria-label="plane">✈️</span>
            <span class="title">UkrainAir</span>
          </div>

      <nav class="nav">
        <a class="nav-link" href="#/">Strona główna</a>
        <a class="nav-link" href="#/about">O nas</a>
        <a class="nav-link" href="#/saved">Zapisane</a>
      </nav>

      <div class="actions">
        <button class="cta">Zaloguj</button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style scoped>
:root {
  --main-gradient: linear-gradient(90deg, #0057b7 0%, #003f8a 100%);
}
.site-header {
  background: var(--main-gradient);
  color: white;
  padding: 12px 0;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  font-size: 20px;
}
.title {
  font-weight: 700;
  font-size: 1.1rem;
}
.nav {
  display: flex;
  gap: 16px;
}
.nav-link {
  color: rgba(255,255,255,0.95);
  text-decoration: none;
  font-weight: 600;
}
.nav-link:hover { text-decoration: underline; }
.actions .cta {
  background: #ffd700;
  color: #003f8a;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 700px) {
  .nav { display: none; }
}
</style>
