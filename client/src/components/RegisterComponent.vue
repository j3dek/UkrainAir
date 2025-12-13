<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Rejestracja</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Imię i nazwisko</label>
          <input
            type="text"
            id="name"
            v-model="name"
            placeholder="Wprowadź imię i nazwisko"
            required
          />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Wprowadź email"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Hasło</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Wprowadź hasło (min. 6 znaków)"
            required
            minlength="6"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Potwierdź hasło</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="Potwierdź hasło"
            required
          />
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <div v-if="success" class="success-message">
          {{ success }}
        </div>
        <button type="submit" class="btn-register" :disabled="loading">
          {{ loading ? 'Rejestracja...' : 'Zarejestruj się' }}
        </button>
      </form>
      <div class="login-link">
        <p>Masz już konto? <router-link to="/login">Zaloguj się</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterComponent',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      success: '',
      loading: false
    }
  },
  methods: {
    async handleRegister() {
      this.error = ''
      this.success = ''

      // Walidacja
      if (this.password !== this.confirmPassword) {
        this.error = 'Hasła nie są identyczne'
        return
      }

      if (this.password.length < 6) {
        this.error = 'Hasło musi mieć co najmniej 6 znaków'
        return
      }

      this.loading = true

      try {
        
        const response = await fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.name,
            email: this.email,
            password: this.password
          })
        })

        const data = await response.json()

        if (response.ok) {
          this.success = 'Rejestracja udana! Przekierowanie do logowania...'
          
          
          setTimeout(() => {
            this.$router.push('/login')
          }, 2000)
        } else {
          this.error = data.message || 'Błąd rejestracji'
        }
      } catch (err) {
        this.error = 'Nie można połączyć się z serwerem'
        console.error('Register error:', err)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.register-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #2196F3;
}

.btn-register {
  width: 100%;
  padding: 12px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-register:hover:not(:disabled) {
  background-color: #1976D2;
}

.btn-register:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  background-color: #ffebee;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 14px;
}

.success-message {
  color: #4CAF50;
  background-color: #e8f5e9;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 14px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
}

.login-link p {
  color: #666;
  font-size: 14px;
}

.login-link a {
  color: #2196F3;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
