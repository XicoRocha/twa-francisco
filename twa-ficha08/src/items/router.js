// src/items/router.js — o recurso /api/items: uma mini-aplicação montada em app.js.
// Os caminhos aqui são relativos ao sítio onde é montado: '/' é /api/items, '/:id' é /api/items/3.
import { Router } from 'express'
import { readFile } from 'node:fs/promises'
import { search } from '../catalog.js'

const router = Router()

// a "base de dados": um array em memória, carregado uma vez ao arrancar.
// O caminho é relativo a ESTE ficheiro, não à pasta onde se corre o node.
const items = JSON.parse(
  await readFile(new URL('../../data/items.json', import.meta.url), 'utf8'))

// ---------------------------------------------------------------- ajudas

// as regras do ItemForm.vue (Ficha 05), outra vez no servidor: um curl não tem formulário.
// O formato { campo: mensagem } é o que o formulário já sabe mostrar.
function validate({ name, price, tags }) {
  const errors = {}
  if (typeof name !== 'string' || name.trim().length < 3) errors.name = 'at least 3 characters'
  if (typeof price !== 'number' || !(price > 0)) errors.price = 'must be > 0'
  // o search() faz toLowerCase a cada tag: uma tag que não seja texto rebentava a pesquisa
  if (tags !== undefined && !(Array.isArray(tags) && tags.every((t) => typeof t === 'string'))) {
    errors.tags = 'must be an array of strings'
  }
  return errors
}

const hasErrors = (errors) => Object.keys(errors).length > 0

// os parâmetros chegam como string: '3' → 3; 'abc' → NaN, que não encontra nada → 404
const indexOf = (req) => items.findIndex((i) => i.id === Number(req.params.id))

const notFound = (req, res) => res.status(404).json({ error: `item ${req.params.id} not found` })

// ---------------------------------------------------------------- GET /api/items
// ?q=      filtra pelo search() do catalog.js (o terceiro consumidor, depois do check.js e do Vue)
// bónus A: ?page=&limit= → { count, results }, como a PokéAPI; sem eles, o array simples
router.get('/', (req, res) => {
  const { q, page, limit } = req.query // ?q=mini → 'mini'; sem ?q → undefined
  // ?q=a&q=b chega como array: só aceitamos texto
  if (q !== undefined && typeof q !== 'string') {
    return res.status(400).json({ errors: { q: 'must be a single text value' } })
  }
  const found = q ? search(items, q) : items

  if (page === undefined && limit === undefined) return res.json(found)

  const p = Number(page ?? 1)
  const n = Number(limit ?? 10)
  const errors = {}
  if (!Number.isInteger(p) || p < 1) errors.page = 'must be an integer ≥ 1'
  if (!Number.isInteger(n) || n < 1 || n > 100) errors.limit = 'must be an integer between 1 and 100'
  if (hasErrors(errors)) return res.status(400).json({ errors })

  // ?page=99 → 200 com results: [] — a coleção existe, só esta página é que está vazia
  res.json({ count: found.length, results: found.slice((p - 1) * n, p * n) })
})

// ---------------------------------------------------------------- GET /api/items/:id
router.get('/:id', (req, res) => {
  const i = indexOf(req)
  if (i === -1) return notFound(req, res) // o return: responder duas vezes rebenta
  res.json(items[i])
})

// ---------------------------------------------------------------- POST /api/items
router.post('/', (req, res) => {
  const body = req.body ?? {} // sem Content-Type: application/json, req.body é undefined
  const errors = validate(body)
  if (hasErrors(errors)) return res.status(400).json({ errors })

  const id = Math.max(0, ...items.map((i) => i.id)) + 1
  // tags por omissão (o search precisa); o id vem DEPOIS do spread: o cliente não o escolhe
  const item = { tags: [], ...body, id, name: body.name.trim() }
  items.push(item)
  res.status(201).location(`/api/items/${id}`).json(item) // bónus D: cabeçalho Location
})

// ---------------------------------------------------------------- PUT /api/items/:id — substitui tudo
router.put('/:id', (req, res) => {
  const i = indexOf(req)
  if (i === -1) return notFound(req, res)

  const body = req.body ?? {}
  const errors = validate(body) // o objeto novo tem de ser tão válido como um criado por POST
  if (hasErrors(errors)) return res.status(400).json({ errors })

  // o id vem sempre do URL, nunca do corpo
  items[i] = { tags: [], ...body, id: items[i].id, name: body.name.trim() }
  res.json(items[i])
})

// ---------------------------------------------------------------- PATCH /api/items/:id — bónus D
// altera só os campos enviados; o resultado tem de continuar válido
router.patch('/:id', (req, res) => {
  const i = indexOf(req)
  if (i === -1) return notFound(req, res)

  const merged = { ...items[i], ...(req.body ?? {}), id: items[i].id }
  const errors = validate(merged)
  if (hasErrors(errors)) return res.status(400).json({ errors })

  items[i] = { ...merged, name: merged.name.trim() }
  res.json(items[i])
})

// ---------------------------------------------------------------- DELETE /api/items/:id
router.delete('/:id', (req, res) => {
  const i = indexOf(req)
  if (i === -1) return notFound(req, res)
  items.splice(i, 1)
  res.status(204).end() // 204 = sem corpo: end(), não json()
})

export default router
