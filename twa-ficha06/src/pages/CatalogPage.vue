<script setup>
// CatalogPage.vue — a lista com os controlos. Os itens vêm do store; os controlos vivem no URL.
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { items, status, error, load, ensureLoaded } from '../store.js'
import { search, byCategory, categories, sortByPrice } from '../catalog.js'
import { categoryLabel } from '../format.js'
import ItemList from '../components/ItemList.vue'

const route = useRoute()
const router = useRouter()

onMounted(ensureLoaded)

// bónus A: pesquisa, categoria e ordenação no URL (/?q=miniatura&cat=colecionaveis&sort=asc).
// replace e não push: cada tecla não pode ser uma entrada nova no histórico.
// O valor por omissão sai do URL, para "/" continuar limpo.
const queryParam = (key, fallback) =>
  computed({
    get: () => route.query[key] ?? fallback,
    set: (value) => router.replace({ query: { ...route.query, [key]: value === fallback ? undefined : value } }),
  })

const query = queryParam('q', '')
const category = queryParam('cat', '')
const sortDir = queryParam('sort', 'desc')

const visible = computed(() => {
  const found = search(items.value ?? [], query.value)
  const inCategory = category.value !== '' ? byCategory(found, category.value) : found
  return sortByPrice(inCategory, sortDir.value)
})

const cats = computed(() => categories(items.value ?? []))

const countText = computed(() => {
  const total = (items.value ?? []).length
  return `${visible.value.length} de ${total} ${total === 1 ? 'artigo' : 'artigos'}`
})

const ready = computed(() => status.value === 'ready')

const toggleSort = () => {
  sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
}

// o ItemList continua a emitir select; quem decide o que fazer com ele é a página
const open = (id) => router.push({ name: 'item', params: { id } })
</script>

<template>
  <div class="controls">
    <label class="field field-search">
      Pesquisar
      <input v-model="query" type="search" placeholder="nome ou tag, ex.: miniatura metal" :disabled="!ready" />
    </label>
    <label class="field">
      Categoria
      <select v-model="category" :disabled="!ready">
        <option value="">Todas as categorias</option>
        <option v-for="c in cats" :key="c" :value="c">{{ categoryLabel(c) }}</option>
      </select>
    </label>
    <button type="button" class="btn" :disabled="!ready" @click="toggleSort">
      {{ sortDir === 'desc' ? 'Preço: mais caro primeiro ↓' : 'Preço: mais barato primeiro ↑' }}
    </button>
    <button type="button" class="btn" :disabled="query === ''" @click="query = ''">Limpar</button>
  </div>

  <div v-if="status === 'error'" class="msg msg-error">
    <p>{{ error }}</p>
    <button type="button" class="btn btn-primary" @click="load">Tentar de novo</button>
  </div>

  <p v-else-if="!ready" class="msg">A carregar…</p>

  <template v-else>
    <p v-if="visible.length === 0" class="msg">Sem resultados para “{{ query }}” — experimenta outra pesquisa ou categoria.</p>
    <p v-else class="msg">{{ countText }}</p>

    <ItemList :items="visible" @select="open" />
  </template>
</template>

<style scoped>
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
  margin-bottom: 8px;
}

.field { display: grid; gap: 4px; font-size: 0.85rem; color: var(--muted); }
.field-search { flex: 1 1 260px; }
</style>
