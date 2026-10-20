<script setup>
// App.vue — o catálogo da Ficha 03 como componente Vue.
// O estado vive em refs, os valores derivados em computed, e o template descreve a página:
// não há render(), nem document.querySelector, nem createElement — o Vue redesenha sozinho.
import { ref, computed } from 'vue'
import { search, byCategory, categories, sortByPrice } from './catalog.js'
import ItemList from './components/ItemList.vue'
import { euro, categoryLabel } from './format.js'

// ---------------------------------------------------------------- fontes
// Para testar o estado de erro sem mexer no código:
//   ?erro=404   → a API do GitHub devolve mesmo 404 (res.ok === false)
//   ?erro=vite  → ficheiro inexistente: o Vite responde 200 com o index.html
//                 e res.json() lança SyntaxError ("Unexpected token '<'")
const ERROR_SOURCES = {
  404: 'https://api.github.com/repos/nodejs/nope',
  vite: '/itemz.json',
}
// lido em cada load(): tirar o ?erro do URL e clicar "Tentar de novo" recupera sem recarregar
const itemsUrl = () => ERROR_SOURCES[new URLSearchParams(location.search).get('erro')] ?? '/items.json'

// ---------------------------------------------------------------- estado: um ref por campo do state da Ficha 03
const status = ref('loading') // 'loading' | 'error' | 'ready'
const error = ref(null)
const items = ref([])
const query = ref('')
const category = ref('')
const sortDir = ref('desc')
const selectedId = ref(null)

// ---------------------------------------------------------------- dados
// traduz o erro técnico numa mensagem sobre a qual o utilizador pode agir
const describeError = (err) => {
  if (err instanceof SyntaxError) {
    return `O servidor não devolveu JSON válido (${err.message}). O ficheiro existe?`
  }
  if (err instanceof TypeError) {
    return `Sem resposta do servidor (${err.message}). Verifica a ligação.`
  }
  return `Não foi possível carregar o catálogo: ${err.message}`
}

async function load() {
  status.value = 'loading'
  error.value = null
  const url = itemsUrl()
  try {
    const res = await fetch(url) // 1. chegam os headers
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`) // 2. status 200–299?
    const data = await res.json() // 3. corpo → parse (pode lançar SyntaxError)
    if (!Array.isArray(data)) throw new Error('items.json não contém uma lista')
    items.value = data
    status.value = 'ready'
  } catch (err) {
    console.error(err)
    status.value = 'error'
    error.value = describeError(err)
  }
  // sem finally { render() }: mudar os refs chega para o Vue redesenhar
}

// ---------------------------------------------------------------- valores derivados: só leem estado
const visible = computed(() => {
  const found = search(items.value, query.value)
  const inCategory = category.value !== '' ? byCategory(found, category.value) : found
  return sortByPrice(inCategory, sortDir.value)
})

const cats = computed(() => categories(items.value))

const selected = computed(() => items.value.find((i) => i.id === selectedId.value))

// bónus B: "N de M artigos"
const countText = computed(() => {
  const label = items.value.length === 1 ? 'artigo' : 'artigos'
  return `${visible.value.length} de ${items.value.length} ${label}`
})

// ---------------------------------------------------------------- handlers: só mudam o estado
const toggleSort = () => {
  sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
}

const select = (id) => {
  selectedId.value = selectedId.value === id ? null : id // clicar outra vez fecha
}

load() // sem await: o componente aparece em loading e preenche-se quando a promessa resolve
</script>

<template>
  <header class="top">
    <p class="eyebrow">Bombeiros Voluntários de Valadares</p>
    <h1>Loja — catálogo</h1>
  </header>

  <main>
    <div class="controls">
      <label class="field field-search">
        Pesquisar
        <input v-model="query" type="search" placeholder="nome ou tag, ex.: miniatura metal" :disabled="status !== 'ready'" />
      </label>
      <label class="field">
        Categoria
        <select v-model="category" :disabled="status !== 'ready'">
          <option value="">Todas as categorias</option>
          <option v-for="c in cats" :key="c" :value="c">{{ categoryLabel(c) }}</option>
        </select>
      </label>
      <button type="button" class="sort" :disabled="status !== 'ready'" @click="toggleSort">
        {{ sortDir === 'desc' ? 'Preço: mais caro primeiro ↓' : 'Preço: mais barato primeiro ↑' }}
      </button>
      <!-- bónus B: o ref é a verdade — limpar o ref esvazia a caixa -->
      <button type="button" class="sort" :disabled="query === ''" @click="query = ''">Limpar</button>
    </div>

    <p v-if="status === 'loading'" class="msg">A carregar…</p>

    <div v-else-if="status === 'error'" class="msg msg-error">
      <p>{{ error }}</p>
      <button type="button" class="retry" @click="load">Tentar de novo</button>
    </div>

    <template v-else>
      <p v-if="visible.length === 0" class="msg">Sem resultados para “{{ query }}” — experimenta outra pesquisa ou categoria.</p>
      <p v-else class="count">{{ countText }}</p>

      <div class="panes">
        <ItemList :items="visible" :selected-id="selectedId" @select="select" />

        <section class="detail">
          <article v-if="selected">
            <div class="detail-head">
              <p class="eyebrow">{{ categoryLabel(selected.category) }}</p>
              <button type="button" class="close" @click="selectedId = null">Fechar</button>
            </div>
            <h2>{{ selected.name }}</h2>
            <p class="detail-price">{{ euro.format(selected.price) }}</p>
            <dl>
              <dt>Tags</dt>
              <dd>
                <ul class="tags">
                  <li v-for="t in selected.tags" :key="t">{{ t }}</li>
                </ul>
              </dd>
              <dt>Fornecedor</dt>
              <dd>{{ selected.supplier ? `${selected.supplier.name} · ${selected.supplier.country}` : '—' }}</dd>
              <dt>Referência</dt>
              <dd>#{{ selected.id }}</dd>
            </dl>
          </article>
          <p v-else class="hint">Escolhe um artigo da lista para ver o detalhe.</p>
        </section>
      </div>
    </template>
  </main>
</template>

<style scoped>
.top, main {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 16px;
}

.top { padding-top: 32px; padding-bottom: 8px; }

.eyebrow {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}

h1 { margin: 4px 0 0; font-size: 2rem; letter-spacing: -0.02em; }

/* ---------- controlos */
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
  margin: 20px 0 8px;
}

.field { display: grid; gap: 4px; font-size: 0.85rem; color: var(--muted); }
.field-search { flex: 1 1 260px; }

.sort, .retry {
  height: 40px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}

.retry { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 600; }

/* ---------- estado */
.msg, .count { margin: 8px 0; color: var(--muted); }
.msg-error {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: var(--radius);
  background: var(--accent-soft);
  color: var(--ink);
}
.msg-error p { margin: 0; }

/* ---------- lista + detalhe */
.panes {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  padding-bottom: 48px;
}

@media (min-width: 760px) {
  .panes { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); align-items: start; }
  .detail { position: sticky; top: 16px; }
}

.detail {
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}
.hint { margin: 0; color: var(--muted); }

.detail-head { display: flex; justify-content: space-between; align-items: center; }
.close { border: 0; background: none; color: var(--muted); padding: 4px 0; text-decoration: underline; }

.detail h2 { margin: 6px 0 4px; font-size: 1.35rem; line-height: 1.25; }
.detail-price { margin: 0 0 16px; font-size: 1.6rem; font-weight: 700; font-variant-numeric: tabular-nums; }

dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 0.92rem; }
dt { color: var(--muted); }
dd { margin: 0; }

.tags { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.tags li {
  padding: 1px 10px;
  border-radius: 999px;
  background: var(--accent-soft);
  font-size: 0.82rem;
}
</style>
