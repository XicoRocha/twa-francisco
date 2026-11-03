<script setup>
// ItemForm.vue — formulário com o seu próprio rascunho (reactive): não mexe nos itens do pai.
// Valida em HTML (required, minlength, min) e num computed; no fim emite UM objeto limpo.
// Bónus A: com a prop item, o formulário edita uma cópia e emite 'update' em vez de 'save'.
import { computed, reactive, watch } from 'vue'
import { categoryLabel } from '../format.js'

const props = defineProps({
  cats: { type: Array, required: true },
  item: { type: Object, default: null }, // bónus A: null = criar, objeto = editar
})
const emit = defineEmits(['save', 'update', 'cancel'])

const empty = { name: '', category: '', price: null, tags: '' }
const form = reactive({ ...empty })

// bónus A: copiar a prop para o rascunho sempre que muda (e logo ao montar)
watch(
  () => props.item,
  (item) => {
    if (item) {
      Object.assign(form, {
        name: item.name,
        category: item.category,
        price: item.price,
        tags: (item.tags ?? []).join(', '),
      })
    } else {
      Object.assign(form, empty)
    }
  },
  { immediate: true },
)

const errors = computed(() => {
  const e = {}
  if (form.name.length < 3) e.name = 'pelo menos 3 caracteres'
  if (!form.category) e.category = 'escolhe uma categoria'
  if (!(form.price > 0)) e.price = 'tem de ser > 0'
  return e
})
const isValid = computed(() => Object.keys(errors.value).length === 0)

function submit() {
  // o botão pode ser reativado nos DevTools — nunca confiar no DOM
  if (!isValid.value) return

  const clean = {
    name: form.name,
    category: form.category,
    price: form.price, // já é número graças ao .number
    tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
  }

  if (props.item) emit('update', { id: props.item.id, ...clean })
  else emit('save', clean)

  Object.assign(form, empty) // form = … perderia a reatividade
}
</script>

<template>
  <form class="card" @submit.prevent="submit">
    <h2>{{ item ? `Editar #${item.id}` : 'Novo artigo' }}</h2>

    <label class="field">
      Nome
      <input v-model.trim="form.name" required minlength="3" />
      <small v-if="errors.name">{{ errors.name }}</small>
    </label>

    <label class="field">
      Categoria
      <select v-model="form.category" required>
        <option value="" disabled>— escolhe —</option>
        <option v-for="c in cats" :key="c" :value="c">{{ categoryLabel(c) }}</option>
      </select>
      <small v-if="errors.category">{{ errors.category }}</small>
    </label>

    <label class="field">
      Preço (€)
      <input v-model.number="form.price" type="number" min="0" step="0.01" required />
      <small v-if="errors.price">{{ errors.price }}</small>
    </label>

    <label class="field">
      Tags
      <input v-model.trim="form.tags" placeholder="tags, separadas por vírgulas" />
    </label>

    <div class="buttons">
      <button type="submit" class="primary" :disabled="!isValid">{{ item ? 'Guardar alterações' : 'Adicionar' }}</button>
      <button v-if="item" type="button" class="secondary" @click="emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>

<style scoped>
.card {
  display: grid;
  gap: 12px;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}

h2 { margin: 0; font-size: 1.1rem; }

.field { display: grid; gap: 4px; font-size: 0.85rem; color: var(--muted); }
.field input, .field select { color: var(--ink); }
small { color: var(--accent); }

.buttons { display: flex; gap: 8px; }

.primary, .secondary {
  height: 40px;
  padding: 0 16px;
  border-radius: var(--radius);
  font-weight: 600;
}
.primary { border: 1px solid var(--accent); background: var(--accent); color: #fff; }
.secondary { border: 1px solid var(--line); background: var(--surface); }
</style>
