// check-ts.ts — as mesmas verificações, contra a versão TypeScript.
// node --experimental-strip-types check-ts.ts  (silencioso quando passa)
import assert from 'node:assert/strict'
import { items } from './data.js'
import type { Item } from './catalog.ts'
import { byCategory, search, total, top, categories, withDiscount } from './catalog.ts'

const list = items as Item[]
const ids = (l: Item[]) => l.map(({ id }) => id)

assert.deepEqual(ids(byCategory(list, 'livros')), [10])
assert.deepEqual(ids(search(list, 'miniatura metal')), [7])
assert.equal(total(list), 178.14)
assert.deepEqual(ids(top(list, 3)), [2, 7, 8])
assert.deepEqual(categories(list), ['acessorios', 'colecionaveis', 'livros', 'vestuario'])
assert.equal(withDiscount(list, 10)[0].price, 13.5)
