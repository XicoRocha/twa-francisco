# TWA · Ficha 08 — Uma API REST com Express

O outro lado do `fetch`: um servidor Node com Express 5 que serve o catálogo da loja dos Bombeiros Voluntários de Valadares como uma API REST. A "base de dados" é um array em memória carregado do `data/items.json` (o `public/items.json` da Ficha 06); a pesquisa usa o `catalog.js` da Ficha 02.

## Como correr (Node ≥ 22)

```bash
cd twa-ficha08
npm install
npm run dev          # node --watch src/app.js → http://localhost:3000
node check.mjs       # noutro terminal, com o servidor a correr; não imprime nada se tudo passar
```

Experimentar no browser: <http://localhost:3000/api/health>, <http://localhost:3000/api/items>, `/api/items?q=miniatura`, `/api/items/3`, `/api/items/999`.

Com `curl` (no PowerShell, `curl.exe`):

```bash
curl -i -X POST http://localhost:3000/api/items -H 'Content-Type: application/json' -d '{"name":"Chess","price":19.9,"category":"game"}'
curl -i -X POST http://localhost:3000/api/items -H 'Content-Type: application/json' -d '{"name":"ab","price":-1}'
curl -i -X DELETE http://localhost:3000/api/items/1
```

## Ficheiros

| Ficheiro | Responsabilidade |
|---|---|
| `src/app.js` | a fila de middlewares: logger → `express.json()` → `/api/health` → `/api/items` → 404 em JSON → erros em JSON |
| `src/items/router.js` | o `Router()` de `/api/items`: o array, a validação e as rotas |
| `src/catalog.js` | o da Ficha 02/06, sem alterações (o `search`) |
| `data/items.json` | os 10 artigos, lidos uma vez ao arrancar |
| `check.mjs` | o do enunciado, com `?q=miniatura` em vez de `?q=puzzle` (os meus dados não têm puzzles) e mais quatro verificações no fim |

## A API

| Pedido | Resposta |
|---|---|
| `GET /api/health` | `200 { ok, time }` |
| `GET /api/items` · `?q=texto` | `200 [ … ]` — com `?q=`, pelo `search()` (nome ou tags, todas as palavras) |
| `GET /api/items/:id` | `200 { … }` ou `404 { error }` |
| `POST /api/items` | `201 { …, id }` + `Location`, ou `400 { errors: { name, price } }` |
| `PUT /api/items/:id` | `200` (substitui tudo), `400` ou `404` |
| `PATCH /api/items/:id` | `200` (só os campos enviados), `400` ou `404` |
| `DELETE /api/items/:id` | `204` sem corpo, ou `404` |
| qualquer outro | `404 { error: 'not found' }` |

## O que está feito

- **Parte 0:** `npm init -y`, `express` 5, `"type": "module"`, `"dev": "node --watch src/app.js"`. O `.gitignore` da raiz já tem `node_modules/`.
- **Parte 1:** `GET /api/health`, a lista com `?q=` e o detalhe com 404 em JSON (com o `return` antes do 404).
- **Parte 2:** `express.json()` antes das rotas; `POST` com a validação do `ItemForm.vue` (nome ≥ 3 caracteres, preço > 0) → 201 ou 400 com `errors`. O id é sempre o servidor que o dá: um `id` no corpo é ignorado. Reiniciar o servidor apaga os itens criados.
- **Parte 3:** `PUT` e `DELETE` (204 com `end()`); as rotas passaram para `src/items/router.js`, montado com `app.use('/api/items', itemsRouter)`; o logger antes de tudo e o 404 depois de tudo.
- **Mais do que o enunciado pede:**
  - O `PUT` valida como o `POST`: senão podia gravar um item sem nome.
  - `tags` tem de ser uma lista de textos: `"tags": [1]` rebentava o `search()` a seguir.
  - `?q=a&q=b` chega como array e dá 400.
  - Um corpo com JSON partido dá `400 { error }` em JSON (tratador de erros com 4 argumentos), em vez da página HTML do Express.
  - O logger escreve quando a resposta sai, com o estado e o tempo: `POST /api/items 201 1ms`.
  - O `check.mjs` apaga o item que cria, por isso pode correr várias vezes seguidas.
- **Parte 4:** é no repositório do grupo (`server/`), sem entrega no Moodle; não está nesta pasta.

### Bónus

- **A. Paginação:** `GET /api/items?page=2&limit=3` → `{ count, results }`, como a PokéAPI; junta-se ao `?q=`. Sem `page` nem `limit`, a lista continua a ser o array simples (o `check.mjs` depende disso). `?page=99` responde **200** com `results: []`: o recurso existe, aquela página é que está vazia (é o que a PokéAPI faz, e a `PokemonPage` da Ficha 06 já mostra "a página não existe"). `?page=0` ou `?page=abc` respondem 400: o pedido está mal feito.
- **D.** `PATCH /api/items/:id` (junta os campos enviados ao item e valida o resultado) ao lado do `PUT` (substitui tudo), e cabeçalho `Location: /api/items/<id>` na resposta 201.
- **B** (ligar o cliente da Ficha 06 com proxy) e **C** (gravar no ficheiro) não estão feitos.

## Perguntas de reflexão

1. Quem decide o estado é o servidor (`res.status(404)`). Um 404 é uma resposta HTTP válida, com corpo (`{ error }`); só o cliente sabe se para ele é um erro ("artigo não existe" é um ecrã normal). Por isso o `fetch` só rejeita quando não há resposta, e o `getJSON` decide com o `res.ok`.
2. Os middlewares correm pela ordem do `app.use`: se o `express.json()` viesse depois, a rota já tinha respondido sem o corpo lido. Sem `Content-Type: application/json`, o `express.json()` não lê o corpo, o `req.body` fica `undefined` e o `?? {}` faz o POST falhar com os dois erros (400), mesmo que os dados estivessem certos.
3. Igual: os dados vivem em memória e perdem-se (no M1 com um reload, aqui ao reiniciar o servidor). Diferente: o `create()` do M1 vivia no browser de um utilizador; aqui o item fica no servidor, todos os clientes o veem e sobrevive a um reload. No M2 o array passa a MongoDB e os dados ficam guardados; as rotas não mudam.
4. Igual: uma rota (`Route::get('/api/items/{id}', …)`), um handler, a resposta em JSON e o estado (404). O Laravel dá mais feito (Eloquent, `findOrFail` com 404 automático, validação). O PHP corre o script do zero em cada pedido e deita a memória fora no fim, por isso um array nunca passava de um pedido para o seguinte. O Node é um só processo que fica a correr, e o array vive entre pedidos.

## Uso de IA

Fiz esta ficha em casa com a ajuda do Claude (Anthropic), que gerou uma primeira versão do código e deste README. Revi e testei tudo, e percebi o código antes de o submeter.
