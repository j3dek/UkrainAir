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

      <div class="actions" v-if="!isLoggedIn">
        <button class="cta" @click="$router.push('/login')">Zaloguj</button>
        <button class="cta-secondary" @click="$router.push('/register')">Rejestracja</button>
      </div>

      <div class="actions user-actions" v-else>
        <span class="user-greeting">👤 {{ userName }}</span>
        <button class="cta-logout" @click="handleLogout">Wyloguj</button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  data() {
    return {
      isLoggedIn: false,
      userName: ''
    }
  },
  mounted() {
    this.checkAuthStatus();
    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', this.checkAuthStatus);
    // Listen for custom auth events
    window.addEventListener('auth-changed', this.checkAuthStatus);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.checkAuthStatus);
    window.removeEventListener('auth-changed', this.checkAuthStatus);
  },
  methods: {
    checkAuthStatus() {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        this.isLoggedIn = true;
        try {
          const userData = JSON.parse(user);
          this.userName = userData.name || userData.email || 'Użytkownik';
        } catch (e) {
          this.userName = 'Użytkownik';
        }
      } else {
        this.isLoggedIn = false;
        this.userName = '';
      }
    },
    handleLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.isLoggedIn = false;
      this.userName = '';
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('auth-changed'));
      
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.site-header {
  background: linear-gradient(90deg, #0057b7 0%, #003f8a 100%);
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

.actions .cta-secondary {
  background: transparent;
  color: #ffd700;
  border: 2px solid #ffd700;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  margin-left: 8px;
}

.actions .cta-secondary:hover {
  background: rgba(255, 215, 0, 0.1);
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-greeting {
  color: #ffd700;
  font-weight: 600;
  font-size: 0.95rem;
}

.cta-logout {
  background: transparent;
  color: #fff;
  border: 2px solid #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cta-logout:hover {
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 700px) {
  .nav { display: none; }
  .user-greeting { display: none; }
}
</style>
