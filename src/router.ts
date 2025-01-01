import Homepage from './components/Homepage.vue'
import CardDeck from './components/CardDeck.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: Homepage },
  {
    path: '/game',
    name: 'game',
    component: CardDeck,
    props: (route: { query: Record<string, any> }) => route.query,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
export default router
