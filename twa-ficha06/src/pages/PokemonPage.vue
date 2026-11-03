<script setup>
// PokemonPage.vue — uma lista paginada da PokéAPI. A página vive no URL (?page=3), não num ref:
// clicar Seguinte → router.push muda o URL → route.query.page muda → page muda → o watch
// corre load() → list(page.value) → data. A rota é a mesma, por isso a página não volta a
// montar: é o watch, não o onMounted, que carrega as páginas 2, 3, …
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoad } from '../composables/useLoad.js'
import { list, idFromUrl, PAGE } from '../api/pokeapi.js'

const route = useRoute()
const router = useRouter()

// o URL é a fonte de verdade; ?page=abc ou ?page=0 contam como página 1
const page = computed(() => {
  const n = Number(route.query.page ?? 1)
  return Number.isInteger(n) && n >= 1 ? n : 1
})

const { status, error, data, load } = useLoad(() => list(page.value))
watch(page, load) // o onMounted do useLoad fez o primeiro

const pages = computed(() => Math.ceil((data.value?.count ?? 0) / PAGE))

function go(p) {
  router.push({ query: { page: p } })
}

const sprite = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
</script>

<template>
  <h1 class="page-title">Pokémon</h1>

  <div class="pager">
    <button type="button" class="btn" :disabled="page <= 1 || status === 'loading'" @click="go(page - 1)">← Anterior</button>
    <p>Página {{ page }} de {{ pages || '…' }}</p>
    <button type="button" class="btn" :disabled="page >= pages || status === 'loading'" @click="go(page + 1)">Seguinte →</button>
  </div>

  <div v-if="status === 'error'" class="msg msg-error">
    <p>{{ error }}</p>
    <button type="button" class="btn btn-primary" @click="load">Tentar de novo</button>
  </div>

  <p v-else-if="status === 'loading'" class="msg">A carregar a página {{ page }}…</p>

  <p v-else-if="data.results.length === 0" class="msg">
    A página {{ page }} não existe — há {{ pages }} páginas.
    <RouterLink :to="{ query: { page: pages } }">Ir para a última</RouterLink>
  </p>

  <ol v-else class="grid">
    <li v-for="p in data.results" :key="p.name">
      <!-- se um sprite não existir, fica um espaço vazio em vez do ícone de imagem partida -->
      <img :src="sprite(idFromUrl(p.url))" alt="" width="64" height="64" loading="lazy" @error="$event.target.style.visibility = 'hidden'" />
      <span class="num">#{{ idFromUrl(p.url) }}</span>
      <span class="name">{{ p.name }}</span>
    </li>
  </ol>
</template>

<style scoped>
.pager {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0 16px;
}
.pager .btn { white-space: nowrap; }
.pager p { margin: 0; color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; }

@media (max-width: 480px) {
  .pager { justify-content: space-between; }
  .pager .btn { padding: 0 10px; }
}

.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}

.grid li {
  display: grid;
  justify-items: center;
  padding: 10px 8px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}

.num { font-size: 0.8rem; color: var(--muted); font-variant-numeric: tabular-nums; }
.name { font-weight: 600; text-transform: capitalize; }
</style>
