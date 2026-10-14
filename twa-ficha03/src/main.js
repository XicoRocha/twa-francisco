// main.js — a página do catálogo: load() → state → render() → DOM.
// Regra: só render() escreve no DOM; os handlers só mudam o state.
// Tudo o que vem dos dados entra com textContent — nunca innerHTML.
import './style.css'
import { search, byCategory, categories, sortByPrice } from './catalog.js'

// ---------------------------------------------------------------- fontes
// Para testar o estado de erro sem mexer no código:
//   ?erro=404   → a API do GitHub devolve mesmo 404 (res.ok === false)
//   ?erro=vite  → ficheiro inexistente: o Vite responde 200 com o index.html
//                 e res.json() lança SyntaxError ("Unexpected token '<'")
const ERROR_SOURCES = {
  404: 'https://api.github.com/repos/nodejs/nope',
  vite: '/itemz.json',
}
const ITEMS_URL = ERROR_SOURCES[new URLSearchParams(location.search).get('erro')] ?? '/items.json'
const STOCK_URL = '/stock.json' // bónus A: segunda fonte, em paralelo

// ---------------------------------------------------------------- estado
const state = {
  status: 'loading', error: null, items: [], stock: {},
  query: '', category: '', sortDir: 'desc',
  selectedId: null,
}

// ---------------------------------------------------------------- DOM
const els = {
  q: document.querySelector('#q'),
  category: document.querySelector('#category'),
  sort: document.querySelector('#sort'),
  status: document.querySelector('#status'),
  list: document.querySelector('#list'),
  detail: document.querySelector('#detail'),
}

const euro = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })
const countryName = new Intl.DisplayNames(['pt-PT'], { type: 'region' })
const CATEGORY_LABELS = {
  vestuario: 'Vestuário',
  acessorios: 'Acessórios',
  colecionaveis: 'Colecionáveis',
  livros: 'Livros',
}
const categoryLabel = (cat) => CATEGORY_LABELS[cat] ?? cat

// cria um elemento com classe e texto (texto sempre por textContent)
const el = (tag, { className, text } = {}, ...children) => {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  node.append(...children)
  return node
}

// ---------------------------------------------------------------- dados
async function getJSON(url) {
  const res = await fetch(url) // 1. chegam os headers
  if (!res.ok) { // 2. status 200–299?
    throw new Error(`HTTP ${res.status} — ${url}`)
  }
  return res.json() // 3. corpo → parse (pode lançar SyntaxError)
}

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
  state.status = 'loading'
  state.error = null
  render()
  try {
    const [items, stock] = await Promise.all([getJSON(ITEMS_URL), getJSON(STOCK_URL)])
    if (!Array.isArray(items)) throw new Error('items.json não contém uma lista')
    state.items = items
    state.stock = stock
    state.status = 'ready'
  } catch (err) {
    console.error(err)
    state.status = 'error'
    state.error = describeError(err)
  } finally {
    render() // corre de qualquer maneira
  }
}

// ---------------------------------------------------------------- vistas (devolvem nós; não tocam no DOM da página)
const visibleItems = () => {
  const inCategory = state.category ? byCategory(state.items, state.category) : state.items
  return sortByPrice(search(inCategory, state.query), state.sortDir)
}

const toStatus = (visible) => {
  if (state.status === 'loading') return [el('p', { className: 'msg', text: 'A carregar…' })]
  if (state.status === 'error') {
    const retry = el('button', { className: 'retry', text: 'Tentar de novo' })
    retry.type = 'button'
    retry.dataset.action = 'retry'
    return [el('div', { className: 'msg msg-error' }, el('p', { text: state.error }), retry)]
  }
  if (visible.length === 0) {
    return [el('p', { className: 'msg', text: 'Sem resultados — experimenta outra pesquisa ou categoria.' })]
  }
  const label = visible.length === 1 ? 'artigo' : 'artigos'
  return [el('p', { className: 'count', text: `${visible.length} de ${state.items.length} ${label}` })]
}

const toOption = (value, label) => {
  const option = el('option', { text: label })
  option.value = value
  return option
}

const toLi = (item) => {
  const selected = item.id === state.selectedId
  const button = el('button', { className: 'item' },
    el('span', { className: 'item-name', text: item.name }),
    el('span', { className: 'item-cat', text: categoryLabel(item.category) }),
    el('span', { className: 'item-price', text: euro.format(item.price) }),
  )
  button.type = 'button'
  button.setAttribute('aria-pressed', String(selected))
  const li = el('li', {}, button)
  li.dataset.id = item.id
  li.classList.toggle('selected', selected)
  return li
}

const stockText = (qty) => {
  if (qty === undefined) return 'Stock desconhecido'
  if (qty === 0) return 'Esgotado'
  return `${qty} em stock`
}

const toDetail = () => {
  const item = state.items.find(({ id }) => id === state.selectedId)
  if (!item) return el('p', { className: 'hint', text: 'Escolhe um artigo da lista para ver o detalhe.' })

  const close = el('button', { className: 'close', text: 'Fechar' })
  close.type = 'button'
  close.dataset.action = 'close'

  const qty = state.stock[item.id]
  const tags = el('ul', { className: 'tags' }, ...(item.tags ?? []).map((t) => el('li', { text: t })))
  const { supplier } = item

  return el('article', {},
    el('div', { className: 'detail-head' },
      el('p', { className: 'eyebrow', text: categoryLabel(item.category) }),
      close,
    ),
    el('h2', { text: item.name }),
    el('p', { className: 'detail-price', text: euro.format(item.price) }),
    el('p', { className: qty === 0 ? 'stock stock-out' : 'stock', text: stockText(qty) }),
    el('dl', {},
      el('dt', { text: 'Tags' }), el('dd', {}, tags),
      el('dt', { text: 'Fornecedor' }),
      el('dd', { text: supplier ? `${supplier.name} · ${countryName.of(supplier.country)}` : '—' }),
      el('dt', { text: 'Referência' }), el('dd', { text: `#${item.id}` }),
    ),
  )
}

// ---------------------------------------------------------------- render: o único sítio que escreve no DOM
function render() {
  const ready = state.status === 'ready'
  const visible = ready ? visibleItems() : []

  els.q.disabled = !ready
  els.category.disabled = !ready
  els.sort.disabled = !ready
  els.sort.textContent = state.sortDir === 'desc' ? 'Preço: mais caro primeiro ↓' : 'Preço: mais barato primeiro ↑'

  els.category.replaceChildren(
    toOption('', 'Todas as categorias'),
    ...categories(state.items).map((c) => toOption(c, categoryLabel(c))),
  )
  els.category.value = state.category

  els.status.replaceChildren(...toStatus(visible))
  els.list.replaceChildren(...visible.map(toLi))
  els.detail.replaceChildren(ready ? toDetail() : '')
}

// ---------------------------------------------------------------- eventos: só mudam o state, depois render()
els.q.addEventListener('input', (e) => {
  state.query = e.target.value
  render()
})

els.category.addEventListener('change', (e) => {
  state.category = e.target.value
  render()
})

els.sort.addEventListener('click', () => {
  state.sortDir = state.sortDir === 'desc' ? 'asc' : 'desc'
  render()
})

// bónus B: delegação — um só listener no #list, para itens que ainda não existem
els.list.addEventListener('click', (e) => {
  const li = e.target.closest('li[data-id]')
  if (!li) return
  const id = Number(li.dataset.id)
  state.selectedId = state.selectedId === id ? null : id // clicar outra vez fecha
  render()
})

els.detail.addEventListener('click', (e) => {
  if (!e.target.closest('[data-action="close"]')) return
  state.selectedId = null
  render()
})

// bónus C: Tentar de novo
els.status.addEventListener('click', (e) => {
  if (e.target.closest('[data-action="retry"]')) load()
})

load()
