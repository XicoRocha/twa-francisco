<script setup>
// NewItemPage.vue — o ItemForm da Ficha 05 tal como está; depois de guardar, navega para o item novo.
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { items, status, error, load, ensureLoaded, addItem } from '../store.js'
import { categories } from '../catalog.js'
import ItemForm from '../components/ItemForm.vue'

const router = useRouter()

// num reload em /items/new o store está vazio: sem itens não há categorias nem próximo id
onMounted(ensureLoaded)

const cats = computed(() => categories(items.value ?? []))

function onSave(item) {
  const id = addItem(item)
  router.push({ name: 'item', params: { id } }) // navegação em código
}
</script>

<template>
  <RouterLink to="/" class="back">← Catálogo</RouterLink>

  <div v-if="status === 'error'" class="msg msg-error">
    <p>{{ error }}</p>
    <button type="button" class="btn btn-primary" @click="load">Tentar de novo</button>
  </div>

  <p v-else-if="status !== 'ready'" class="msg">A carregar…</p>

  <div v-else class="new-page">
    <ItemForm :cats="cats" @save="onSave" />
  </div>
</template>

<style scoped>
.new-page { max-width: 560px; }
</style>
