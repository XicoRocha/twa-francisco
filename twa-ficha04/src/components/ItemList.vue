<script setup>
// ItemList.vue — bónus A: a lista recebe os itens do pai por props.
// Para avisar o pai do clique usa defineEmits (matéria da próxima aula).
import { euro, categoryLabel } from '../format.js'

defineProps(['items', 'selectedId'])
defineEmits(['select'])
</script>

<template>
  <ul class="list">
    <li v-for="item in items" :key="item.id" :class="{ selected: item.id === selectedId }">
      <button type="button" class="item" :aria-pressed="item.id === selectedId" @click="$emit('select', item.id)">
        <span class="item-name">{{ item.name }}</span>
        <span class="item-cat">{{ categoryLabel(item.category) }}</span>
        <span class="item-price">{{ euro.format(item.price) }}</span>
      </button>
    </li>
  </ul>
</template>

<style scoped>
.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }

.item {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas: "name price" "cat price";
  gap: 2px 12px;
  padding: 12px 14px;
  text-align: left;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}
.item:hover { border-color: var(--muted); }
.selected .item { border-color: var(--accent); box-shadow: inset 3px 0 0 var(--accent); }

.item-name { grid-area: name; font-weight: 600; }
.item-cat { grid-area: cat; font-size: 0.85rem; color: var(--muted); }
.item-price { grid-area: price; align-self: center; font-variant-numeric: tabular-nums; font-weight: 600; }
</style>
