<script setup>
// ItemPage.vue — o detalhe de um item, com o id a vir do URL (/items/3).
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { items, status, error, load, ensureLoaded, updateItem } from '../store.js'
import { categories } from '../catalog.js'
import ItemDetail from '../components/ItemDetail.vue'
import ItemForm from '../components/ItemForm.vue'

const route = useRoute()
const router = useRouter()

onMounted(ensureLoaded) // num reload em /items/3 esta é a primeira página — o store está vazio

const id = computed(() => Number(route.params.id)) // route.params.id é uma string ("3")
const item = computed(() => (items.value ?? []).find((i) => i.id === id.value))
const cats = computed(() => categories(items.value ?? []))

// modo editar (bónus A da Ficha 05)
const editing = ref(false)

// /items/1 → /items/2 reutiliza esta página (não volta a montar): é preciso um watch
// para sair do modo editar quando o id muda
watch(id, () => {
  editing.value = false
})

function onUpdate(changed) {
  updateItem(changed)
  editing.value = false
}
</script>

<template>
  <RouterLink to="/" class="back">← Catálogo</RouterLink>

  <div v-if="status === 'error'" class="msg msg-error">
    <p>{{ error }}</p>
    <button type="button" class="btn btn-primary" @click="load">Tentar de novo</button>
  </div>

  <p v-else-if="status !== 'ready'" class="msg">A carregar…</p>

  <p v-else-if="!item" class="msg">O artigo {{ route.params.id }} não existe.</p>

  <div v-else class="item-page">
    <ItemDetail :item="item" @close="router.push('/')">
      <button type="button" class="btn" :disabled="editing" @click="editing = true">Editar</button>
    </ItemDetail>

    <ItemForm v-if="editing" :cats="cats" :item="item" @update="onUpdate" @cancel="editing = false" />
  </div>
</template>

<style scoped>
.item-page {
  display: grid;
  gap: 16px;
  max-width: 560px;
}
</style>
