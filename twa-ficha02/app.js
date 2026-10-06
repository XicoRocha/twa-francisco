import { writeFile } from 'node:fs/promises'
import { items } from './data.js'
import {
  byCategory, search, total, top, categories, groupByCategory,
} from './catalog.js'

const [cmd, ...args] = process.argv.slice(2)
const arg = args.join(' ')

const formatItem = ({ id, name, category, price }) =>
  `${id} · ${name} · ${category} · ${price.toFixed(2)} €`

const printList = (list) => {
  if (list.length === 0) {
    console.log('(nenhum item)')
    return
  }
  console.log(list.map(formatItem).join('\n'))
  const label = list.length === 1 ? 'item' : 'itens'
  console.log(`— ${list.length} ${label} · total ${total(list).toFixed(2)} €`)
}

const writeReport = async () => {
  const report = {
    count: items.length,
    total: total(items),
    categories: categories(items),
    top3: top(items, 3).map(({ id, name, price }) => ({ id, name, price })),
  }
  // ao lado do app.js, seja qual for a pasta de onde se corre o comando
  const file = new URL('./report.json', import.meta.url)
  await writeFile(file, JSON.stringify(report, null, 2) + '\n')
  console.log('report.json escrito:', report)
}

if (!cmd) {
  printList(items)
} else if (cmd === 'search') {
  if (!arg) {
    console.error('Uso: node app.js search <texto>')
    process.exitCode = 1
  } else {
    printList(search(items, arg))
  }
} else if (cmd === 'top') {
  const n = Number(arg || 3)
  if (!Number.isInteger(n) || n < 1) {
    console.error('Uso: node app.js top <n>  (n inteiro ≥ 1)')
    process.exitCode = 1
  } else {
    printList(top(items, n))
  }
} else if (cmd === 'groups') {
  Object.entries(groupByCategory(items)).forEach(([cat, list]) => {
    console.log(`\n# ${cat}`)
    printList(list)
  })
} else if (cmd === 'report') {
  await writeReport()
} else if (categories(items).includes(cmd)) {
  printList(byCategory(items, cmd))
} else {
  console.error(`Comando ou categoria desconhecida: "${cmd}"`)
  console.error(`Categorias: ${categories(items).join(', ')}`)
  console.error('Comandos: search <texto> · top <n> · groups · report')
  process.exitCode = 1
}
