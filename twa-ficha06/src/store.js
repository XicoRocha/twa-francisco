// store.js — o estado dos itens vive aqui, fora de qualquer componente.
// Um módulo ES é avaliado uma vez e partilhado por quem o importa: estes refs são globais
// e reativos, e sobrevivem à navegação (as páginas montam e desmontam, o store fica).
// Não usa useLoad porque o onMounted precisa de um componente — e aqui não há nenhum.
import { ref } from 'vue'
import { getJSON } from './api/getJSON.js'
import { describeError } from './api/describeError.js'

// Para testar o estado de erro sem mexer no código:
//   ?erro=404   → a API do GitHub devolve mesmo 404 (res.ok === false)
//   ?erro=vite  → ficheiro inexistente: o Vite responde 200 com o index.html → SyntaxError
const ERROR_SOURCES = {
  404: 'https://api.github.com/repos/nodejs/nope',
  vite: '/itemz.json',
}
const itemsUrl = () => ERROR_SOURCES[new URLSearchParams(location.search).get('erro')] ?? '/items.json'

export const items = ref(null) // null até o primeiro load resolver
export const status = ref('idle') // 'idle' | 'loading' | 'error' | 'ready'
export const error = ref(null)

export async function load() {
  status.value = 'loading'
  error.value = null
  try {
    const data = await getJSON(itemsUrl())
    if (!Array.isArray(data)) throw new Error('items.json não contém uma lista')
    items.value = data
    status.value = 'ready'
  } catch (err) {
    console.error(err)
    error.value = describeError(err)
    status.value = 'error'
  }
}

// as páginas chamam isto ao montar: carrega UMA vez
export function ensureLoaded() {
  if (items.value === null && status.value !== 'loading') load()
}

const nextId = () => Math.max(0, ...items.value.map((i) => i.id)) + 1

// os únicos sítios onde `items` muda
export function addItem(item) {
  const id = nextId()
  items.value.push({ id, ...item })
  return id
}

// modo editar (bónus A da Ficha 05): substitui pelo id, mantém o que o formulário não edita (supplier)
export function updateItem(item) {
  const i = items.value.findIndex(({ id }) => id === item.id)
  if (i !== -1) items.value[i] = { ...items.value[i], ...item }
}
