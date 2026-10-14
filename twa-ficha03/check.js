// check.js — `node check.js` não imprime nada quando passa tudo.
// Os dados vêm do mesmo public/items.json que a página carrega com fetch.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  byCategory, search, total, top, categories, withDiscount, groupByCategory,
  sortByPrice,
} from './src/catalog.js'

const items = JSON.parse(
  await readFile(new URL('./public/items.json', import.meta.url), 'utf8'),
)
const ids = (list) => list.map(({ id }) => id)
const original = structuredClone(items)

// byCategory
assert.deepEqual(ids(byCategory(items, 'livros')), [10])

// search — nome ou tags, sem distinguir maiúsculas; várias palavras = todas
assert.deepEqual(ids(search(items, 'MINIATURA')), [7, 8])
assert.deepEqual(ids(search(items, 'miniatura metal')), [7])
assert.equal(search(items, '').length, items.length) // pesquisa vazia = tudo

// total
assert.equal(total(items), 178.14)

// top — os n mais caros, por ordem decrescente
assert.deepEqual(ids(top(items, 3)), [2, 7, 8])

// categories — únicas e ordenadas
assert.deepEqual(categories(items), ['acessorios', 'colecionaveis', 'livros', 'vestuario'])

// withDiscount — preços novos, originais intactos
assert.deepEqual(withDiscount(items, 10).slice(0, 2).map(({ price }) => price), [13.5, 29.25])

// groupByCategory (bónus da Ficha 02)
assert.equal(groupByCategory(items).acessorios.length, 3)

// sortByPrice (Ficha 03) — asc e desc, array novo
const asc = sortByPrice(items, 'asc')
assert.deepEqual(ids(asc), [5, 9, 4, 3, 1, 6, 10, 8, 7, 2])
assert.deepEqual(ids(sortByPrice(items, 'desc')), [2, 7, 8, 10, 6, 1, 3, 4, 9, 5])
assert.deepEqual(ids(sortByPrice(items)), ids(asc)) // por omissão: asc
assert.notEqual(asc, items) // não devolve o mesmo array
assert.deepEqual(sortByPrice([], 'desc'), [])

// imutabilidade: nenhuma função alterou os dados
assert.deepEqual(items, original)
