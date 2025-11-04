<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid align-center">

      <div class="navbar-brand">
        {{ brand }}
      </div>

      <!-- 保留这个是为了样式留白 -->
      <div class="collapse navbar-collapse" id="navbar"></div>

      <div class="text-white">
        {{ config.mdns }}
      </div>

      <div class="vr d-none d-lg-flex h-200 mx-lg-2 text-white"></div>

      <div v-if="global.configChanged">
        <span class="badge bg-danger fs-6">Save needed &nbsp;</span>
      </div>

      <div class="vr d-none d-lg-flex h-200 mx-lg-2 text-white" v-if="global.configChanged"></div>

      <div class="p-2">
        <div class="spinner-border gx-4" role="status" style="color: white" :hidden="!disabled">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div class="p-2">
        <div class="form-check form-switch">
          &nbsp;<input
            v-model="config.dark_mode"
            class="form-check-input"
            type="checkbox"
            role="switch"
            style="border-color: white"
          />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
/**
 * 2024-05-28 Bootstrap VueJS wrapper, Magnus Persson
 */

import { config, global } from '@/modules/pinia'
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
/**
 * Purpose: Provide an meny with dropdown options, dark mode toggle and spinner.
 *
 * Note! Item structure is stored in the router file.
 */

/**
 * Ref that steers if this component is enabled or not (required).
 */
const disabled = defineModel('disabled', {
  type: Boolean,
  default: false
})

/**
 * Ref that contains the brand name.
 */
const brand = defineModel('brand', {
  type: String,
  default: 'Brand',
  validator: (value) => {
    return typeof value === 'string' && value.trim().length > 0
  }
})

/**
 * Darkmode ref is imported from the config store (required).
 */
const { dark_mode } = storeToRefs(config)

onMounted(() => {
  setMode()
})

watch(dark_mode, () => {
  setMode()
})

const setMode = () => {
  if (config.dark_mode) {
    document.documentElement.setAttribute('data-bs-theme', 'dark')
  } else {
    document.documentElement.setAttribute('data-bs-theme', 'light')
  }
}

</script>
