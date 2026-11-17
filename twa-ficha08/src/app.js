// src/app.js — a aplicação: uma fila de middlewares (req, res, next).
// A ordem dos app.use é a ordem em que a fila corre.
import express from 'express'
import itemsRouter from './items/router.js'

const app = express()
const PORT = process.env.PORT ?? 3000

// 1.º — logger: corre em todos os pedidos. Escreve quando a resposta sai, para mostrar o estado.
app.use((req, res, next) => {
  const start = performance.now()
  res.on('finish', () => {
    console.log(req.method, req.originalUrl, res.statusCode, `${Math.round(performance.now() - start)}ms`)
  })
  next() // passa ao seguinte; sem isto, o pedido fica pendurado
})

// 2.º — lê corpos JSON para req.body. ANTES das rotas, senão req.body é undefined.
app.use(express.json())

// 3.º — as rotas
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date() })
})

app.use('/api/items', itemsRouter)

// último — só chega aqui o que ninguém respondeu: 404 em JSON, não a página HTML do Express
app.use((req, res) => res.status(404).json({ error: 'not found' }))

// tratador de erros (4 argumentos): um corpo com JSON partido faz o express.json() lançar
// um erro 400 — sem isto, o Express respondia com uma página HTML
app.use((err, req, res, next) => {
  const status = err.status ?? 500
  if (status >= 500) console.error(err)
  res.status(status).json({ error: status === 400 ? 'invalid JSON body' : 'internal server error' })
})

app.listen(PORT, () => console.log(`http://localhost:${PORT}`))
