<template>
  <section id="storage-sleep" class="border rounded-3 p-3 my-3">
    <h2 class="h5 mb-1">Storage &amp; sleep</h2>
    <p class="text-body-secondary small mb-2">Save battery while your hydrometer is stored upside down.</p>
    <div class="row g-3">
      <div class="col-md-6">
        <BsInputSwitch
          v-model="config.storage_sleep"
          label="Storage sleep"
          help="When placed on its cap (less than 15°), sleep and check the angle once an hour."
          :disabled="global.disabled"
          aria-label="Storage sleep"
        />
      </div>
      <div class="col-md-6">
        <BsInputSwitch
          v-model="hibernateEnabled"
          label="Automatic long sleep"
          help="Stop waking automatically after continuous storage."
          :disabled="global.disabled || !config.storage_sleep || !supported"
          aria-label="Automatic long sleep"
        />
      </div>
      <div v-if="hibernateEnabled" class="col-md-6">
        <BsInputNumber
          v-model="config.storage_hibernate_days"
          label="Enter long sleep after"
          unit="days"
          min="1"
          max="365"
          step="1"
          required
          width="6"
          help="1–365 days of continuous upside-down storage. Default: 30 days."
          :disabled="global.disabled || !config.storage_sleep || !supported"
          aria-label="Continuous storage days"
        />
      </div>
    </div>
    <p v-if="!supported" class="small text-body-secondary mt-3 mb-0">
      Update the device firmware to configure automatic long sleep.
    </p>
    <div v-else class="rounded-2 bg-body-tertiary p-3 mt-3 small" aria-live="polite">
      <template v-if="!config.storage_sleep">Storage sleep is off. Automatic long sleep will not start.</template>
      <template v-else-if="!hibernateEnabled">Checks the angle once an hour. Automatic long sleep is off.</template>
      <template v-else>
        After <strong>{{ config.storage_hibernate_days }} days</strong>, automatic wake-ups stop.
        <strong>Use a magnet to reset and wake the device.</strong>
        Returning to normal measurement or resetting the device restarts the storage countdown.
      </template>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { config, global } from '@/modules/pinia'

const supported = computed(() => config.storage_hibernate_days !== null)
const hibernateEnabled = computed({
  get: () => supported.value && config.storage_hibernate_days > 0,
  set: (enabled) => { config.storage_hibernate_days = enabled ? 30 : 0 }
})
</script>
