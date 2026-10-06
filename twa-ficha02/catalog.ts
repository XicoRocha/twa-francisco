// catalog.ts — bónus: o mesmo catálogo com tipos.
// Corre com: node --experimental-strip-types check-ts.ts
// (só sintaxe que o Node consegue "apagar": type, anotações, import type)

export type Category = 'vestuario' | 'acessorios' | 'colecionaveis' | 'livros'

export type Item = {
  id: number
  name: string
  category: Category
  price: number
  tags?: string[]
  supplier: { name: string; country: string }
}

const toCents = (n: number): number => Math.round(n * 100) / 100

export const byCategory = (list: Item[], cat: Category): Item[] =>
  list.filter(({ category }) => category === cat)

export const search = (list: Item[], text: string): Item[] => {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean)
  return list.filter(({ name, tags = [] }) => {
    const haystack = [name, ...tags].map((s) => s.toLowerCase())
    return words.every((w) => haystack.some((s) => s.includes(w)))
  })
}

export const total = (list: Item[]): number =>
  toCents(list.reduce((sum, { price }) => sum + price, 0))

export const top = (list: Item[], n: number): Item[] =>
  list.toSorted((a, b) => b.price - a.price).slice(0, n)

export const categories = (list: Item[]): Category[] =>
  [...new Set(list.map(({ category }) => category))].toSorted()

export const withDiscount = (list: Item[], pct: number): Item[] =>
  list.map((item) => ({ ...item, price: toCents(item.price * (1 - pct / 100)) }))

export const groupByCategory = (list: Item[]) =>
  Object.groupBy(list, ({ category }) => category)
