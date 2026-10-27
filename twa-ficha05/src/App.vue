<script setup>
// App.vue — o pai: é o dono do estado (itens, pesquisa, seleção).
// Os filhos recebem por props o que precisam e pedem alterações por emits.
import { ref, computed, watch } from 'vue'
import { search, byCategory, categories, sortByPrice } from './catalog.js'
import { getJSON } from './api/getJSON.js'
import { useLoad } from './composables/useLoad.js'
import ItemList from './components/ItemList.vue'
import ItemDetail from './components/ItemDetail.vue'
import ItemForm from './components/ItemForm.vue'
import { categoryLabel } from './format.js'

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

// ---------------------------------------------------------------- dados: os três estados vêm do useLoad
const { status, error, data: items, load } = useLoad(() => getJSON(itemsUrl()))

// ---------------------------------------------------------------- estado da página
// bónus B: a pesquisa sobrevive ao reload
const query = ref(localStorage.getItem('query') ?? '')
const category = ref('')
const sortDir = ref('desc')
const selectedId = ref(null)
const editingId = ref(null) // bónus A: id do item em edição

// ---------------------------------------------------------------- valores derivados (items é null até o load resolver)
const visible = computed(() => {
  const found = search(items.value ?? [], query.value)
  const inCategory = category.value !== '' ? byCategory(found, category.value) : found
  return sortByPrice(inCategory, sortDir.value)
})

const cats = computed(() => categories(items.value ?? []))

const selected = computed(() => (items.value ?? []).find((i) => i.id === selectedId.value))

const editingItem = computed(() => (items.value ?? []).find((i) => i.id === editingId.value) ?? null)

const nextId = computed(() => Math.max(0, ...(items.value ?? []).map((i) => i.id)) + 1)

const countText = computed(() => {
  const total = (items.value ?? []).length
  const label = total === 1 ? 'artigo' : 'artigos'
  return `${visible.value.length} de ${total} ${label}`
})

// ---------------------------------------------------------------- efeitos (watch): fazem algo, não derivam um valor
watch(query, () => {
  selectedId.value = null // escrever na pesquisa limpa a seleção
})

watch(query, (q) => localStorage.setItem('query', q)) // bónus B

watch(selectedId, () => {
  editingId.value = null // bónus A: mudar de item (ou fechar) cancela a edição
})

// ---------------------------------------------------------------- handlers: só mudam o estado
const toggleSort = () => {
  sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
}

// o id é o pai que o dá — é ele o dono da lista
function addItem(item) {
  items.value.push({ id: nextId.value, ...item })
}

// bónus A: substitui o item pelo id, mantendo os campos que o formulário não edita (supplier)
function updateItem(item) {
  const i = items.value.findIndex(({ id }) => id === item.id)
  if (i !== -1) items.value[i] = { ...items.value[i], ...item }
  editingId.value = null
}
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
        <ItemList :items="visible" :selected-id="selectedId" @select="selectedId = $event" />

        <div class="side">
          <ItemDetail v-if="selected" :item="selected" @close="selectedId = null">
            <!-- bónus C: o botão entra pelo <slot> do ItemDetail -->
            <button type="button" class="edit" :disabled="editingId === selected.id" @click="editingId = selected.id">Editar</button>
          </ItemDetail>
          <p v-else class="hint">Escolhe um artigo da lista para ver o detalhe.</p>

          <ItemForm :cats="cats" :item="editingItem" @save="addItem" @update="updateItem" @cancel="editingId = null" />
        </div>
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
}

.side { display: grid; gap: 16px; }

.hint {
  margin: 0;
  padding: 20px;
  border: 1px dashed var(--line);
  border-radius: var(--radius);
  color: var(--muted);
}

.edit {
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  font-weight: 600;
}
</style>
