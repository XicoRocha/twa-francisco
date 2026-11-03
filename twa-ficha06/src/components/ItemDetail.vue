<script setup>
// ItemDetail.vue — mostra um item (prop só de leitura).
// Fechar é um pedido ao pai (emit 'close'); os botões extra entram pelo <slot> (bónus C).
import { euro, categoryLabel } from '../format.js'

defineProps({
  item: { type: Object, required: true },
})
const emit = defineEmits(['close'])
</script>

<template>
  <article class="detail">
    <div class="detail-head">
      <p class="eyebrow">{{ categoryLabel(item.category) }}</p>
      <button type="button" class="close" @click="emit('close')">Fechar</button>
    </div>
    <h2>{{ item.name }}</h2>
    <p class="detail-price">{{ euro.format(item.price) }}</p>
    <dl>
      <dt>Tags</dt>
      <dd>
        <ul v-if="item.tags?.length" class="tags">
          <li v-for="t in item.tags" :key="t">{{ t }}</li>
        </ul>
        <span v-else>—</span>
      </dd>
      <dt>Fornecedor</dt>
      <dd>{{ item.supplier ? `${item.supplier.name} · ${item.supplier.country}` : '—' }}</dd>
      <dt>Referência</dt>
      <dd>#{{ item.id }}</dd>
    </dl>
    <div class="actions">
      <slot />
    </div>
  </article>
</template>

<style scoped>
.detail {
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}

.eyebrow {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}

.detail-head { display: flex; justify-content: space-between; align-items: center; }
.close { border: 0; background: none; color: var(--muted); padding: 4px 0; text-decoration: underline; }

h2 { margin: 6px 0 4px; font-size: 1.35rem; line-height: 1.25; }
.detail-price { margin: 0 0 16px; font-size: 1.6rem; font-weight: 700; font-variant-numeric: tabular-nums; }

dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 0.92rem; }
dt { color: var(--muted); }
dd { margin: 0; }

.tags { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.tags li {
  padding: 1px 10px;
  border-radius: 999px;
  background: var(--accent-soft);
  font-size: 0.82rem;
}

.actions:empty { display: none; }
.actions { margin-top: 16px; display: flex; gap: 8px; }
</style>
