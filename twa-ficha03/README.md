# TWA · Ficha 03 — O catálogo no browser

O catálogo da loja dos Bombeiros Voluntários de Valadares (Ficha 02) numa página Vite vanilla: carrega os artigos com `fetch`, mostra os três estados (a carregar, erro, pronto), pesquisa, filtra por categoria, ordena por preço e mostra o detalhe de um artigo.

O `catalog.js` é o meu da Ficha 02, sem alterações além da nova `sortByPrice`.

## Como correr (Node ≥ 22)

```bash
cd twa-ficha03
npm install
npm run dev          # http://localhost:5173
node check.js        # não imprime nada se tudo passar
```

Para ver o estado de erro sem mexer no código:

| URL | O que acontece |
|---|---|
| `http://localhost:5173/?erro=404` | fetch à API do GitHub que devolve mesmo 404 → `res.ok === false` |
| `http://localhost:5173/?erro=vite` | ficheiro inexistente: o Vite responde 200 com o `index.html` → `res.json()` lança `SyntaxError`, que o `catch` também trata |

Estado *loading*: DevTools → Network → *Slow 4G* → recarregar.

## Ficheiros

| Ficheiro | Responsabilidade |
|---|---|
| `index.html` | pesquisa, `<select>` de categoria, botão de ordenação, `#status`, `#list`, `#detail` |
| `src/main.js` | `state`, `load()`, `render()` e os eventos |
| `src/catalog.js` | funções puras da Ficha 02 + `sortByPrice(list, dir)` |
| `public/items.json` | os 10 artigos, gerados a partir do `data.js` da Ficha 02 |
| `public/stock.json` | bónus A: stock por artigo (dados de exemplo) |
| `check.js` | asserções com `node:assert/strict`, incluindo `sortByPrice` |

## O que está feito

- **`load()`** — `async`/`await`, `fetch`, verificação de `res.ok`, `try`/`catch`/`finally`; estados `loading` → `ready` ou `error`. Mensagens de erro diferentes para HTTP (404/500), JSON inválido (armadilha do Vite) e falta de rede.
- **Um só `render()`** — lê o `state` e reconstrói `#status`, `#list`, `#detail` e as opções do `<select>` com `createElement` + `textContent` e `replaceChildren`. Não há `innerHTML` em lado nenhum. A pesquisa nunca é reconstruída, por isso não perde o foco.
- **Eventos só mudam o `state`** e depois chamam `render()`:

  | controlo | evento | usa |
  |---|---|---|
  | pesquisa | `input` | `search(list, text)` |
  | categoria | `change` | `byCategory`, `categories` |
  | ordenação | `click` | `sortByPrice(list, dir)` |
  | item da lista | `click` | detalhe: nome, preço, stock, tags, fornecedor (objeto aninhado) |

- **`sortByPrice(list, dir)`** — pura, devolve um array novo (`toSorted`); `'asc'` por omissão. Testada no `check.js` (asc, desc, omissão, array novo, lista vazia, originais intactos).
- Controlos desativados enquanto carrega; "Sem resultados" quando a pesquisa não encontra nada (não é um erro).

### Bónus

- **A.** `Promise.all` com duas fontes: `items.json` + `stock.json` (o stock aparece no detalhe).
- **B.** Delegação de eventos: um só listener de clique no `#list` (`closest('li[data-id]')`); também no `#detail` (Fechar) e no `#status` (Tentar de novo).
- **C.** Botão **Tentar de novo** no estado de erro, que volta a chamar `load()`.

## Verificações feitas

- *Slow 4G* → aparece "A carregar…" com os controlos desativados.
- `?erro=404` e `?erro=vite` → a minha mensagem e o botão Tentar de novo, não uma página em branco.
- `<b>olá</b>` e `<img src=x onerror="alert(1)">` no nome de um item → aparecem como texto, sem alert.
- `node check.js` passa, agora com `sortByPrice`.

## Uso de IA

Fiz esta ficha em casa com a ajuda do Claude (Anthropic), que gerou uma primeira versão do código. Revi, testei e percebi todas as funções antes de submeter.
