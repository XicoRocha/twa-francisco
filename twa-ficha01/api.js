import { writeFile } from 'node:fs/promises'

const res = await fetch('https://api.github.com/repos/nodejs/node')
if (!res.ok) throw new Error(`HTTP ${res.status}`)
const repo = await res.json()
console.log(repo.name, repo.stargazers_count)

const { name, full_name, description, stargazers_count, html_url } = repo
await writeFile(
  'repo.json',
  JSON.stringify({ name, full_name, description, stargazers_count, html_url }, null, 2)
)