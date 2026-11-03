<script setup>
// App.vue — só a moldura: o <nav> e o <RouterView>, onde o Router põe a página do URL atual.
// Nenhum estado, nenhum computed: os itens vivem no store.js, cada ecrã é uma página em src/pages/.
</script>

<template>
  <header class="top">
    <p class="eyebrow">Bombeiros Voluntários de Valadares · Loja</p>
    <nav>
      <RouterLink to="/">Catálogo</RouterLink>
      <RouterLink to="/items/new">Novo artigo</RouterLink>
      <RouterLink to="/pokemon">Pokémon</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.top, main {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 16px;
}

.top { padding-top: 28px; padding-bottom: 20px; }

.eyebrow {
  margin: 0 0 10px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
}

nav a {
  padding: 6px 12px;
  border-radius: 999px;
  color: var(--muted);
  font-weight: 600;
  text-decoration: none;
}
nav a:hover { color: var(--ink); }

/* o RouterLink da rota atual recebe esta classe */
nav a.router-link-active {
  background: var(--accent-soft);
  color: var(--accent);
}

main { padding-bottom: 48px; }
</style>
