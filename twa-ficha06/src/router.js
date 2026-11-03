// router.js — a tabela URL → componente.
import { createRouter, createWebHistory } from 'vue-router'
import CatalogPage from './pages/CatalogPage.vue'
import ItemPage from './pages/ItemPage.vue'
import NewItemPage from './pages/NewItemPage.vue'

const routes = [
  { path: '/', name: 'catalog', component: CatalogPage },
  // a ordem não importa: o Router prefere a rota estática (/items/new) à dinâmica (/items/:id)
  { path: '/items/new', name: 'new-item', component: NewItemPage },
  { path: '/items/:id', name: 'item', component: ItemPage },
  // bónus B: rotas lazy — o código destas páginas só é pedido na primeira visita
  { path: '/pokemon', name: 'pokemon', component: () => import('./pages/PokemonPage.vue') },
  // apanha-tudo, no fim: numa SPA o 404 é um componente
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./pages/NotFound.vue') },
]

export default createRouter({ history: createWebHistory(), routes })
