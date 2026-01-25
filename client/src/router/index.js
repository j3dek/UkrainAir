import { createRouter, createWebHistory } from 'vue-router'
import DisplayFlightsComponent from '../components/DisplayFlightsComponent.vue'
import FlightMapComponent from '../components/FlightMapComponent.vue'
import HomeComponent from '../components/HomeComponent.vue'
import LoginComponent from '../components/LoginComponent.vue'
import RegisterComponent from '../components/RegisterComponent.vue'

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
  },
  {
    path: '/flight-tracker',
    name: 'FlightTracker',
    component: FlightMapComponent
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginComponent
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterComponent
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router