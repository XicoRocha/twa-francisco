// useLoad.js — os três estados (loading, error, ready) escritos uma vez.
// Recebe uma função que devolve uma promessa (o "fetcher") e devolve refs.
// O onMounted está cá dentro: quem chama useLoad no topo do <script setup> não tem de se lembrar dele.
import { onMounted, ref } from 'vue'
import { describeError } from '../api/describeError.js'

export function useLoad(fetcher) {
  const status = ref('loading') // 'loading' | 'error' | 'ready'
  const error = ref(null)
  const data = ref(null)

  // bónus C: cada load() leva um número; uma resposta que chega depois de um pedido mais
  // recente já foi feito é ignorada (página 3 a chegar depois da 4 não a sobrepõe)
  let lastRequest = 0

  async function load() {
    const request = ++lastRequest
    status.value = 'loading'
    error.value = null
    try {
      const result = await fetcher()
      if (request !== lastRequest) return // resposta fora de ordem
      data.value = result
      status.value = 'ready'
    } catch (err) {
      if (request !== lastRequest) return
      console.error(err)
      error.value = describeError(err)
      status.value = 'error'
    }
  }

  onMounted(load)
  return { status, error, data, load }
}
