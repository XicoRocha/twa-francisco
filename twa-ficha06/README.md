# TWA · Ficha 06 — Rotas e paginação

O catálogo da Ficha 05 com um URL por ecrã (Vue Router), o estado dos itens num `store.js` ao nível do módulo, e uma página `/pokemon` que pagina a PokéAPI com a página no URL.

A pasta é uma cópia da `twa-ficha05/` com `vue-router`. Os componentes `ItemList`, `ItemDetail` e `ItemForm` não mudaram; o `catalog.js`, o `items.json` e o `check.js` também não.

## Como correr (Node ≥ 22)

```bash
cd twa-ficha06
npm install
npm run dev          # http://localhost:5173
node check.js        # não imprime nada se tudo passar
```

## Rotas

| URL | Página | O quê |
|---|---|---|
| `/` | `CatalogPage.vue` | pesquisa, categoria, ordenação e `<ItemList>`; clicar num item faz `router.push({ name: 'item', params: { id } })` |
| `/items/new` | `NewItemPage.vue` | `<ItemForm @save>` → `addItem` do store → `router.push` para o item novo |
| `/items/:id` | `ItemPage.vue` | `<ItemDetail>`; o id vem de `route.params.id` (string → `Number`); "não existe" se não houver |
| `/pokemon?page=3` | `PokemonPage.vue` | 20 Pokémon por página, Anterior/Seguinte, "Página 3 de 68" |
| qualquer outro | `NotFound.vue` | rota apanha-tudo `/:pathMatch(.*)*` no fim da tabela |

## Ficheiros novos

| Ficheiro | Responsabilidade |
|---|---|
| `src/router.js` | a tabela URL → componente |
| `src/store.js` | `items`, `status`, `error`, `load()`, `ensureLoaded()`, `addItem()` e `updateItem()` — refs ao nível do módulo, partilhados por todas as páginas |
| `src/pages/*.vue` | uma página por rota; cada uma chama `onMounted(ensureLoaded)` |
| `src/api/pokeapi.js` | os URLs da PokéAPI; `list(page)` traduz a página para `offset`/`limit` |
| `src/api/describeError.js` | a mensagem de erro, usada pelo store e pelo `useLoad` |

O `App.vue` ficou só com o `<nav>` (três `RouterLink`, o ativo marcado pela classe `router-link-active`) e o `<RouterView />`.

## O que está feito

- **Parte 1:** `store.js` com `ensureLoaded()` (carrega uma vez), três páginas, `router.js`, `main.js` com `.use(router)`. Navegar não faz pedidos de documento e o `items.json` só é pedido uma vez.
- **Parte 2:** `/items/3` mostra o detalhe, `/items/999` diz que não existe, `/nada` mostra o `NotFound`. Um item criado em `/items/new` abre em `/items/11` e aparece na lista ao voltar a `/`; com reload desaparece. Reload em `/items/3` ou `/items/new` funciona porque cada página carrega o store.
- **Parte 3:** `PokemonPage` com `page` como `computed` sobre `route.query.page`, `useLoad(() => list(page.value))` e `watch(page, load)`. Seguinte/Anterior fazem `router.push({ query: { page } })`; back, forward e reload mostram a página certa; na página 1 o Anterior está desativado e na 68 o Seguinte. `?page=abc` ou `?page=0` contam como página 1. Com o código do enunciado (`offset = (page - 1) * 20`), a página 3 começa no #41 (zubat) e o spearow (#21) abre a página 2.
- **Parte 4:** é no repositório do grupo (sem entrega no Moodle), por isso não está nesta pasta.
- Do modo editar da Ficha 05 ficou o botão **Editar** no `ItemPage`, com `updateItem` no store e um `watch(id)` que sai da edição quando se muda de item sem desmontar a página.

### Bónus

- **A.** Pesquisa, categoria e ordenação no URL (`/?q=miniatura&cat=colecionaveis&sort=asc`), como `computed` com `get` (`route.query`) e `set` (`router.replace`). O back do browser volta à lista com os filtros. Com `push`, cada tecla seria uma entrada no histórico e o back apagava a pesquisa letra a letra. (Substitui o `localStorage` da Ficha 05.)
- **B.** `/pokemon` e o `NotFound` são rotas lazy (`() => import(...)`): o `npm run build` gera `PokemonPage-*.js` e `NotFound-*.js` à parte, e só são pedidos na primeira visita.
- **C.** O `useLoad` numera cada pedido e ignora respostas de um pedido antigo: com a página 3 lenta e back para a 2 antes de ela chegar, fica a 2. Os botões também ficam desativados enquanto a página carrega.
- **D.** (Pinia) não feito.

## Perguntas de reflexão

1. Com um `ref`, o reload voltava sempre à página 1, não dava para enviar o link da página 3 a ninguém e o back do browser saía da página em vez de voltar à anterior: o URL nunca mudava.
2. O store é um módulo ES, avaliado uma vez: os refs vivem enquanto a app estiver aberta, por isso navegar entre páginas não os apaga. O reload volta a carregar a app e os refs começam do zero, e o `items.json` não tem o item novo. No M2 o `addItem` faz um POST à API, que guarda na base de dados, e o reload volta a lê-lo de lá.
3. O `onMounted` só corre quando a página é montada: ao entrar de outra rota (`/` → `/items/1`) ou num reload. Entre `/items/1` e `/items/2` o Vue reutiliza o componente, por isso o que depende do parâmetro tem de ser um `computed` ou ter um `watch` (como o `watch(page, load)` do Pokémon).
4. Para o projeto, SPA: é uma aplicação (listas, detalhes e formulários sobre uma API) que não precisa de SEO, e o servidor só tem de servir ficheiros estáticos e a API. Para o site público da ISLA, SSG (ou SSR nas páginas que mudam muito): o HTML já vem pronto, por isso a primeira pintura é rápida e os motores de busca indexam o conteúdo.

## Uso de IA

Fiz esta ficha em casa com a ajuda do Claude (Anthropic), que gerou uma primeira versão do código e deste README. Revi e testei tudo, e percebi o código antes de o submeter.
