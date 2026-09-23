<template>
  <svg v-bind="$attrs" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" :width="width" :height="height">
    <path
      fill-rule="evenodd"
      d="M7.646 5.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2z"
    />
    <path
      d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z"
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
