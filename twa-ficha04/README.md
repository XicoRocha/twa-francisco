# TWA · Ficha 04 — O catálogo em Vue

O catálogo da Ficha 03 reescrito como componente Vue (`App.vue`): o estado está em `ref`, os valores derivados em `computed`, e o template descreve a página. Não há `render()`, `document.querySelector` nem `createElement`.

O `catalog.js`, o `items.json` e o `check.js` são os meus da Ficha 03, sem alterações.

## Como correr (Node ≥ 22)

```bash
cd twa-ficha04
npm install
npm run dev          # http://localhost:5173
node check.js        # não imprime nada se tudo passar
```

Para ver o estado de erro sem mexer no código:

| URL | O que acontece |
|---|---|
| `/?erro=404` | fetch à API do GitHub que devolve mesmo 404 → `res.ok === false` |
| `/?erro=vite` | ficheiro inexistente: o Vite responde 200 com o `index.html` → `res.json()` lança `SyntaxError`, que o `catch` apanha |

O URL é lido em cada `load()`: com o erro no ecrã, tirar o `?erro=…` da barra de endereço (sem recarregar) e clicar **Tentar de novo** carrega o catálogo.

## Ficheiros

| Ficheiro | Responsabilidade |
|---|---|
| `src/App.vue` | estado (`ref`), `load()`, `computed` (`visible`, `cats`, `selected`, `countText`), template e `<style scoped>` |
| `src/components/ItemList.vue` | bónus A: a lista, com `defineProps` |
| `src/format.js` | formatação de preços e nomes das categorias, partilhada pelos dois componentes |
| `src/catalog.js` | funções puras da Ficha 03 (`search`, `byCategory`, `categories`, `sortByPrice`, …) |
| `src/style.css` | só o global: variáveis de cor, `body`, controlos |
| `public/items.json` | os 10 artigos |
| `check.js` | asserções da Ficha 03 |

## O que está feito

- **Estado:** um `ref` por campo do `state` da Ficha 03 (`status`, `error`, `items`, `query`, `category`, `sortDir`, `selectedId`).
- **`load()`:** `fetch` + `res.ok` + `try`/`catch`; escreve nos refs, sem `finally { render() }`. Chamado no fim do script sem `await`.
- **`computed`:** `visible` (`search` → `byCategory` só se houver categoria → `sortByPrice`), `cats` (`categories`) e `selected` (`find` pelo id). Só leem estado.
- **Template:** `v-model` na pesquisa e no `<select>` ("Todas as categorias" estática e as outras com `v-for`), `@click` na ordenação (↓/↑), `v-if`/`v-else-if`/`v-else` para os três estados, **Tentar de novo** no erro, contagem ou "Sem resultados para …", lista com `v-for` + `:key="item.id"`, classe `selected` e detalhe (nome, preço, tags e o objeto aninhado `supplier`).
- **`<style scoped>`** em cada componente, com o CSS da Ficha 03.

### Bónus

- **A.** A lista está em `ItemList.vue` com `defineProps(['items', 'selectedId'])`. Para a seleção continuar a funcionar usei `defineEmits(['select'])` — é matéria da próxima aula, mas sem isso o clique não chegava ao pai.
- **B.** `computed` "N de M artigos" e botão **Limpar** que faz `query = ''` — a caixa de pesquisa esvazia-se sozinha, porque o ref é a verdade.
- **C.** Testei o XSS: com `<img src=x onerror=…>` no nome e `v-html`, o código corre. Voltei ao `{{ }}`, que mostra o mesmo nome como texto.

## Verificações feitas

- `npm run dev` sem erros nem avisos do Vue na consola; `node check.js` em silêncio.
- A pesquisa filtra enquanto escrevo e não perde o foco; "Todas as categorias" mostra tudo; a ordenação inverte; clicar num item mostra o detalhe.
- `?erro=404` e `?erro=vite` mostram a minha mensagem e o botão; tirar o `?erro` e clicar **Tentar de novo** recupera sem recarregar.
- `<b>olá</b>` no nome de um item aparece como texto com `{{ }}`.

## Perguntas de reflexão

1. Do `main.js` da Ficha 03 desapareceram o `render()`, os `document.querySelector`/`createElement` e os `addEventListener`. O objeto `state` passou a `ref`s, o `render()` passou a ser o template (o Vue redesenha quando os refs mudam) e os handlers passaram a `v-model` e `@click` no template.
2. Um `ref` é um objeto que guarda o valor em `.value`, para o Vue saber quando é lido e alterado. No script trabalho com o objeto, por isso escrevo `items.value`; no template o Vue desembrulha os refs automaticamente, por isso basta `items`.
3. `visible` depende de `items`, `query`, `category` e `sortDir`; o `computed` recalcula-se sozinho quando qualquer um muda. Com um `ref` teria de o atualizar à mão em cada handler e no `load()`; bastava esquecer um sítio para a lista ficar desatualizada em relação ao estado.
4. O `:key` diz ao Vue que elemento corresponde a que item, para reutilizar e mover os nós certos em vez de os reescrever. Com o índice como chave, ao reordenar o Vue associa o estado de cada `<li>` (foco, classe, inputs) à posição e não ao item, e esse estado fica no item errado.

## Uso de IA

Fiz esta ficha em casa com a ajuda do Claude (Anthropic), que gerou uma primeira versão do código, dos testes e deste README. Revi e testei tudo, e percebi o código antes de o submeter.
