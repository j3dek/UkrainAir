<template>
  <div id="app">
    <AppHeader />
    <main>
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from './components/Header.vue'
import AppFooter from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter
  }
}
</script>

<style>
* { box-sizing: border-box; }
body, html, #app { height: 100%; margin: 0; }
#app { font-family: Arial, sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
main { flex: 1; }
</style>