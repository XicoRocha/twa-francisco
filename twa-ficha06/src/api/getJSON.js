// getJSON.js — o mesmo do template do projeto: fetch + res.ok + parse
export async function getJSON(url) {
  const res = await fetch(url) // 1. chegam os headers
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`) // 2. status 200–299?
  return res.json() // 3. corpo → parse (pode lançar SyntaxError)
}
