<template>
  <div class="card">
    <div class="card-header bg-primary-subtle">{{ header }}</div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
/**
 * Text to be displayed in the header of the Card (required).
 */
const header = defineModel('header', {
  type: String,
  default: 'Card Header'
})
</script>
