import { createRouter, createWebHistory } from 'vue-router'
import DisplayFlightsComponent from '../components/DisplayFlightsComponent.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: {
      template: `
        <div>
          <img alt="Vue logo" src="./assets/logo.png">
          <hello-world msg="Welcome to Your Vue.js App"/>
          <router-link to="/flights" class="nav-link">Dostępne Loty</router-link>
        </div>
      `,
      components: {
        'hello-world': () => import('../components/HelloWorld.vue')
      }
    }
  },
  {
    path: '/flights',
    name: 'Flights',
    component: DisplayFlightsComponent
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router