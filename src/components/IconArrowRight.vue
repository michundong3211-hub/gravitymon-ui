<template>
  <svg v-bind="$attrs" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" :width="width" :height="height">
    <path
      fill-rule="evenodd"
      d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
    />
  </svg>
</template>

<script setup>
/**
 * Purpose: Show an svg icon on the UI. Used embedded svg to avoid downloading data from internet.
 */
defineOptions({
  inheritAttrs: false
})

/**
 * Width of the icon (optional).
 */
const width = defineModel('width', {
  type: [String, Number],
  default: 16,
  validator: (value) => {
    const num = Number(value)
    return !isNaN(num) && num > 0
  }
})

/**
 * Height of the icon (optional).
 */
const height = defineModel('height', {
  type: [String, Number],
  default: 16,
  validator: (value) => {
    const num = Number(value)
    return !isNaN(num) && num > 0
  }
})
</script>
