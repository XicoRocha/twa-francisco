// describeError.js — traduz o erro técnico numa mensagem sobre a qual o utilizador pode agir.
// Usado pelo store.js e pelo useLoad.js.
export function describeError(err) {
  if (err instanceof SyntaxError) {
    return `O servidor não devolveu JSON válido (${err.message}). O ficheiro existe?`
  }
  if (err instanceof TypeError) {
    return `Sem resposta do servidor (${err.message}). Verifica a ligação.`
  }
  return `Não foi possível carregar os dados: ${err.message}`
}
