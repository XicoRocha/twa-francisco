// check.mjs — o cliente da API é o fetch de sempre. Silêncio = tudo bem.
// Correr com o servidor a trabalhar noutro terminal: npm run dev  →  node check.mjs
//
// É o check.mjs do enunciado, com UMA diferença: o enunciado pesquisa "puzzle" (os dados da
// solução publicada); os meus dados são os da loja dos Bombeiros, onde "miniatura" dá 2 itens.
import assert from 'node:assert/strict'

const BASE = process.env.BASE ?? 'http://localhost:3000/api'
const json = { 'Content-Type': 'application/json' }

let res = await fetch(`${BASE}/items`)
assert.equal(res.status, 200)
const all = await res.json()
assert.ok(all.length >= 8)

res = await fetch(`${BASE}/items?q=miniatura`) // no enunciado: ?q=puzzle
assert.equal((await res.json()).length, 2)

res = await fetch(`${BASE}/items/999`)
assert.equal(res.status, 404)
assert.ok((await res.json()).error)

res = await fetch(`${BASE}/items`, { method: 'POST', headers: json, body: JSON.stringify({ name: 'ab', price: -1 }) })
assert.equal(res.status, 400)
assert.deepEqual(Object.keys((await res.json()).errors).sort(), ['name', 'price'])

res = await fetch(`${BASE}/items`, {
  method: 'POST', headers: json,
  body: JSON.stringify({ name: 'Chess', price: 19.9, category: 'game' }),
})
assert.equal(res.status, 201)
const created = await res.json()
assert.equal(created.name, 'Chess')
assert.ok(created.id > 8)

res = await fetch(`${BASE}/items/${created.id}`)
assert.equal((await res.json()).name, 'Chess')

res = await fetch(`${BASE}/items?q=chess`) // o item criado também entra na pesquisa
assert.equal((await res.json()).length, 1)

// ---------------------------------------------------------------- além do enunciado
// limpar: o check pode correr várias vezes seguidas sem reiniciar o servidor
res = await fetch(`${BASE}/items/${created.id}`, { method: 'DELETE' })
assert.equal(res.status, 204)
assert.equal(await res.text(), '') // 204 não tem corpo

res = await fetch(`${BASE}/items/${created.id}`)
assert.equal(res.status, 404)

res = await fetch(`${BASE}/nada`) // o 404 do fim da fila é JSON, não HTML
assert.equal(res.status, 404)
assert.match(res.headers.get('content-type'), /application\/json/)
