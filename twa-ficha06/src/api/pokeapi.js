// pokeapi.js — os URLs da PokéAPI só aqui: a página pede "a página 3" e isto traduz para offset/limit.
import { getJSON } from './getJSON.js'

const BASE = 'https://pokeapi.co/api/v2'
export const PAGE = 20

// → { count, next, previous, results: [{ name, url }] }
export const list = (page = 1) =>
  getJSON(`${BASE}/pokemon?limit=${PAGE}&offset=${(page - 1) * PAGE}`)

export const get = (name) => getJSON(`${BASE}/pokemon/${name}`)

// o número do Pokémon vem no fim do url de cada resultado (…/pokemon/25/)
export const idFromUrl = (url) => Number(url.split('/').filter(Boolean).at(-1))
