// useLoad.js — os três estados (loading, error, ready) escritos uma vez.
// Recebe uma função que devolve uma promessa (o "fetcher") e devolve refs.
// O onMounted está cá dentro: quem chama useLoad no topo do <script setup> não tem de se lembrar dele.
import { onMounted, ref } from 'vue'

// traduz o erro técnico numa mensagem sobre a qual o utilizador pode agir
const describeError = (err) => {
  if (err instanceof SyntaxError) {
    return `O servidor não devolveu JSON válido (${err.message}). O ficheiro existe?`
  }
  if (err instanceof TypeError) {
    return `Sem resposta do servidor (${err.message}). Verifica a ligação.`
  }
  return `Não foi possível carregar os dados: ${err.message}`
}

export function useLoad(fetcher) {
  const status = ref('loading') // 'loading' | 'error' | 'ready'
  const error = ref(null)
  const data = ref(null)

  async function load() {
    status.value = 'loading'
    error.value = null
    try {
      data.value = await fetcher()
      status.value = 'ready'
    } catch (err) {
      console.error(err)
      error.value = describeError(err)
      status.value = 'error'
    }
  }

  onMounted(load)
  return { status, error, data, load }
}
