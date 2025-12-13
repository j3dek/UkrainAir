<template>
  <footer class="site-footer">
    <div class="container">
      <div class="left">
        © {{ year }} UkrainAir. Wszelkie prawa zastrzeżone.
      </div>
      <div class="right">
        <a class="footer-link" href="#/privacy">Prywatność</a>
        <a class="footer-link" href="#/terms">Regulamin</a>
        <a class="footer-link" href="#/contact">Kontakt</a>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  data() {
    return { year: new Date().getFullYear() }
  }
}
</script>

<style scoped>
.site-footer {
  background: linear-gradient(90deg, #0057b7 0%, #003f8a 100%);
  color: white;
  padding: 18px 0;
  margin-top: 40px;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}
.footer-link {
  color: rgba(255,255,255,0.9);
  margin-left: 12px;
  text-decoration: none;
}
.footer-link:hover { text-decoration: underline; }

@media (max-width: 700px) {
  .container { flex-direction: column; gap: 8px; }
  .right { display: flex; gap: 8px; }
}
</style>
