// format.js — formatação partilhada pelo App.vue e pelo ItemList.vue
export const euro = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

const CATEGORY_LABELS = {
  vestuario: 'Vestuário',
  acessorios: 'Acessórios',
  colecionaveis: 'Colecionáveis',
  livros: 'Livros',
}
export const categoryLabel = (cat) => CATEGORY_LABELS[cat] ?? cat
