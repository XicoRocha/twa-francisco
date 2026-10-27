# TWA · Ficha 05 — Componentes e formulários

O catálogo da Ficha 04 partido em componentes: o `App.vue` é o dono do estado, e a lista, o detalhe e um formulário novo passam a filhos que recebem dados por props e avisam o pai com emits. Os três estados (loading, error, ready) passam para um composable `useLoad`.

A pasta é uma cópia da `twa-ficha04/`. O `catalog.js`, o `items.json` e o `check.js` não mudaram.

## Como correr (Node ≥ 22)

```bash
cd twa-ficha05
npm install
npm run dev          # http://localhost:5173
node check.js        # não imprime nada se tudo passar
```

Estado de erro sem mexer no código: `/?erro=404` (404 real da API do GitHub) ou `/?erro=vite` (o Vite devolve HTML → `SyntaxError`). O **Tentar de novo** chama o `load` do `useLoad`.

## Ficheiros

| Ficheiro | Responsabilidade |
|---|---|
| `src/App.vue` | o pai: `query`, `category`, `sortDir`, `selectedId`, `editingId`; `computed` (`visible`, `cats`, `selected`, `nextId`…); `watch`; `addItem` / `updateItem` |
| `src/components/ItemList.vue` | `defineProps({ items, selectedId })` + `defineEmits(['select'])` |
| `src/components/ItemDetail.vue` | `defineProps({ item })`, emit `close` e um `<slot />` para os botões |
| `src/components/ItemForm.vue` | rascunho `reactive`, `v-model.trim`/`.number`, validação HTML + `computed` `errors`/`isValid`, `@submit.prevent`, `emit('save', item)` |
| `src/composables/useLoad.js` | `status`, `error`, `data`, `load()` com `onMounted(load)` lá dentro |
| `src/api/getJSON.js` | `fetch` + `res.ok` + `res.json()` |
| `src/format.js` | preço em euros e nomes das categorias |

## O que está feito

- **Parte 1:** `ItemList` e `ItemDetail` com `defineProps` tipados. O `props.items.push({})` de propósito dá o aviso "Attempting to mutate prop" e foi apagado, por isso não está no código.
- **Parte 2:** o `ItemList` faz `emit('select', item.id)` e o pai faz `@select="selectedId = $event"`.
- **Parte 3:** `ItemForm` com rascunho próprio. Com o rascunho vazio há três mensagens e o botão está desativado; nome com 2 letras ou preço 0 não emite nada, mesmo reativando o botão nos DevTools. O pai dá o `id` (`nextId`) e faz `push`; o item aparece ordenado e o formulário fica limpo (`Object.assign(form, empty)`). As tags passam a array com `split(',')` + `trim` + `filter(Boolean)`.
- **Parte 4:** `useLoad(() => getJSON(...))` substituiu `status`, `error`, `items` e `load()` do `App.vue`; nos `computed` uso `items.value ?? []`. Chamado num handler dá o aviso do `onMounted` sem instância ativa; fica no topo do `<script setup>`.
- **Parte 5:** `watch(query, () => { selectedId.value = null })`.
- **Parte 6:** é no repositório do grupo (sem entrega no Moodle), por isso não está nesta pasta.

### Bónus

- **A. Modo editar:** **Editar** no detalhe faz o pai passar `:item="editingItem"` ao `ItemForm`; um `watch(() => props.item, …, { immediate: true })` copia a prop para o rascunho e o submit emite `update`. O pai substitui o item pelo id e mantém o `supplier`. **Cancelar** e mudar de item saem da edição. Não se pode fazer `v-model` nos campos da prop porque a prop é do pai: cada tecla alteraria logo o item na lista (antes de guardar e sem validar) e o Cancelar já não teria nada para desfazer.
- **B.** A pesquisa é guardada em `localStorage` com um `watch` e sobrevive ao reload.
- **C.** O botão **Editar** entra pelo `<slot />` do `ItemDetail`.

## Verificações feitas

- `npm run dev` sem erros nem avisos do Vue na consola; `node check.js` em silêncio.
- Adicionar um item a 5 € → aparece no fim em ↓ e no início em ↑, com o id 11.
- Selecionar um item e escrever na pesquisa → o detalhe desaparece.
- `<b>olá</b>` num nome aparece como texto. Não há `render()` nem `document.querySelector`.

## Perguntas de reflexão

1. A prop é do pai e é só de leitura: se o `ItemList` mudasse o `selectedId`, haveria dois sítios a escrever no mesmo estado. Com o emit, o filho só avisa e o pai decide, por isso o `ItemList` pode ser usado noutro sítio que trate a seleção de outra maneira.
2. Se é um valor que se calcula a partir de outros, é `computed` (`visible` só lê e devolve). Se é uma ação a fazer quando algo muda, como escrever noutro ref ou no `localStorage`, é `watch`.
3. Poupa-me escrever `status`/`error`/`data`/`load()` em cada um dos seis ecrãs: cada um faz `useLoad(() => api.list())`. Se o `onMounted` estivesse fora, cada componente teria de se lembrar de chamar `load()`, e bastava esquecer um para o ecrã ficar em loading para sempre.
4. O HTML e o `computed` dão feedback rápido ao utilizador, mas estão no browser e qualquer pessoa os contorna (DevTools, ou um pedido direto à API). Só a validação na API do M2 protege os dados.

## Uso de IA

Fiz esta ficha em casa com a ajuda do Claude (Anthropic), que gerou uma primeira versão do código e deste README. Revi e testei tudo, e percebi o código antes de o submeter.
