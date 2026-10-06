# TWA · Ficha 02 — Módulo de catálogo

Catálogo da loja dos Bombeiros Voluntários de Valadares (vestuário, acessórios, colecionáveis, livros), em JavaScript moderno com módulos ES.

## Ficheiros

| Ficheiro | Responsabilidade |
|---|---|
| `data.js` | os dados: 10 artigos com `id`, `name`, `category`, `price`, `tags` e `supplier` (objeto aninhado) |
| `catalog.js` | funções puras — sem I/O, sem `console.log`, sem ciclos |
| `app.js` | ponto de entrada: lê argumentos, imprime, escreve `report.json` |
| `check.js` | verificações com `node:assert/strict` |
| `catalog.ts` + `check-ts.ts` | bónus: a mesma lógica com um tipo `Item` |

## Como correr (Node ≥ 22)

```bash
node app.js                      # lista tudo
node app.js vestuario            # só essa categoria
node app.js search bordado       # pesquisa no nome e nas tags
node app.js search miniatura metal   # várias palavras: tem de conter todas
node app.js top 3                # os 3 mais caros
node app.js groups               # agrupado por categoria (Object.groupBy)
node app.js report               # escreve report.json
node check.js                    # não imprime nada se tudo passar
node --experimental-strip-types check-ts.ts
```

## Bónus feitos

- `groupByCategory(list)` com `Object.groupBy`
- `search` com várias palavras (todas têm de aparecer no nome ou nas tags)
- `catalog.ts` com os tipos `Item` e `Category`, a correr com `--experimental-strip-types`

## Uso de IA

Fiz esta ficha em casa com a ajuda do Claude (Anthropic), que gerou uma primeira versão do código. Revi, testei e percebi todas as funções antes de submeter.
