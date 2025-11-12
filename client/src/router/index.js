import { createRouter, createWebHistory } from 'vue-router'
import DisplayFlightsComponent from '../components/DisplayFlightsComponent.vue'
import HomeComponent from '../components/HomeComponent.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeComponent
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