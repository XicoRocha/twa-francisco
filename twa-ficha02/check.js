// check.js — `node check.js` não imprime nada quando passa tudo.
import assert from 'node:assert/strict'
import { items } from './data.js'
import {
  byCategory, search, total, top, categories, withDiscount, groupByCategory,
} from './catalog.js'

const ids = (list) => list.map(({ id }) => id)
const original = structuredClone(items)

// byCategory
assert.deepEqual(ids(byCategory(items, 'livros')), [10])

// search — nome ou tags, sem distinguir maiúsculas; várias palavras = todas
assert.deepEqual(ids(search(items, 'MINIATURA')), [7, 8])
assert.deepEqual(ids(search(items, 'miniatura metal')), [7])

// total
assert.equal(total(items), 178.14)

// top — os n mais caros, por ordem decrescente
assert.deepEqual(ids(top(items, 3)), [2, 7, 8])

// categories — únicas e ordenadas
assert.deepEqual(categories(items), ['acessorios', 'colecionaveis', 'livros', 'vestuario'])

// withDiscount — preços novos, originais intactos
assert.deepEqual(withDiscount(items, 10).slice(0, 2).map(({ price }) => price), [13.5, 29.25])

// groupByCategory (bónus)
assert.equal(groupByCategory(items).acessorios.length, 3)

// imutabilidade: nenhuma função alterou os dados
assert.deepEqual(items, original)
