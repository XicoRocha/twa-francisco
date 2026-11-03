<script setup>
// NotFound.vue — numa SPA o 404 é um componente: a rota apanha-tudo no fim da tabela.
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <section class="not-found">
    <p class="code">404</p>
    <h1 class="page-title">Página não encontrada</h1>
    <p class="msg">Não há nada em <code>{{ route.fullPath }}</code>.</p>
    <RouterLink to="/" class="btn btn-primary home">Voltar ao catálogo</RouterLink>
  </section>
</template>

<style scoped>
.not-found { padding: 24px 0; }
.code { margin: 0; font-size: 3rem; font-weight: 800; color: var(--accent); line-height: 1; }
code { overflow-wrap: anywhere; }
.home { display: inline-flex; align-items: center; margin-top: 8px; text-decoration: none; }
</style>
