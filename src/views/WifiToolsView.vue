<template>
  <main class="container system-tools">
    <div class="st-header">
      <h1 class="st-title"><IconTools width="20" height="20" aria-hidden="true" />System tools</h1>
      <p class="st-text">Maintenance and settings for this device.</p>
      <p class="st-text">Firmware version: {{ global.app_ver || '—' }}</p>
    </div>

    <form v-if="isWifiMode" @submit.prevent="save" class="st-card needs-validation" novalidate>
      <div>
        <h2 class="st-card-title">Storage sleep</h2>
        <BsInputSwitch
          v-model="config.storage_sleep"
          label="Storage sleep"
          help="When placed on its cap (less than 15°), sleep and check the angle once an hour."
          :disabled="global.disabled || !hibernateSupported"
        />
        <BsInputSwitch
          v-model="hibernateEnabled"
          label="Automatic long sleep"
          help="Stop automatic wake-ups after continuous storage. Use an external reset (for example a magnet with a reed switch) to wake the device."
          :disabled="global.disabled || !config.storage_sleep || !hibernateSupported"
        />
        <BsInputNumber
          v-if="hibernateEnabled"
          v-model="config.storage_hibernate_days"
          label="Enter long sleep after"
          unit="days"
          min="1"
          max="365"
          step="1"
          required
          width="4"
          help="1–365 days of continuous upside-down storage. Default: 30 days. Measurement or an external reset restarts the countdown."
          :disabled="global.disabled || !config.storage_sleep"
        />
        <p v-if="!hibernateSupported" class="st-text">Long sleep settings are unavailable on this firmware.</p>
      </div>
      <button type="submit" class="btn btn-primary"
        :disabled="global.disabled || !global.configChanged || !hibernateSupported">Save</button>
    </form>

    <section v-else class="st-card">
      <div>
        <h2 class="st-card-title"><IconUploadCloud width="16" height="16" aria-hidden="true" />Firmware update</h2>
        <p class="st-card-desc st-text">Open a firmware update page to install a new firmware version.</p>
      </div>
      <router-link to="/other/firmware" class="btn btn-outline-primary">Open</router-link>
    </section>

    <section class="st-card">
      <div>
        <h2 class="st-card-title"><IconInfoCircle width="16" height="16" aria-hidden="true" />About</h2>
        <p class="st-card-desc st-text">About CuckooTilt, GravityMon and licensing.</p>
      </div>
      <router-link to="/other/about" class="btn btn-outline-primary">Open</router-link>
    </section>

    <section class="st-card st-card-danger">
      <div>
        <h2 class="st-card-title st-title-danger"><IconExclamationTriangle width="16" height="16" aria-hidden="true" />Restore default settings</h2>
        <p class="st-card-desc st-text">
          Keep the WIFI settings, reset all other settings, remove uploaded templates and restart
          the device.
        </p>
        <div v-if="restoreState !== 'idle'" class="st-status" role="status" aria-live="polite">
          <span v-if="restoreState === 'requesting'" class="spinner-border spinner-border-sm st-status-danger" role="status" aria-hidden="true"></span>
          <span :class="{ 'st-text-danger': restoreState === 'failed' }">{{ restoreStatusText }}</span>
        </div>
      </div>
      <button type="button" class="btn btn-danger" :disabled="restoreState === 'requesting' || restoreState === 'accepted'"
        @click="confirmRestoreDefaults">Restore defaults</button>
    </section>

    <BsModalConfirm :callback="handleRestoreDefaults"
      message="Do you really want to restore default settings? WIFI settings are kept, all other settings are lost and the device will restart."
      id="restoreDefaults" title="Restore default settings" />
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { global, config, status } from '@/modules/pinia'
import { logError } from '@/modules/logger'
import { validateCurrentForm } from '@/modules/utils'
import { useStorageHibernate } from '@/composables/useStorageHibernate'

const isWifiMode = computed(() => status.wifi_setup === true && !global.forceConfigMode)
const { hibernateSupported, hibernateEnabled, validateStorageHibernate } = useStorageHibernate()

const save = () => {
  if (!validateStorageHibernate() || !validateCurrentForm()) return
  config.saveAll()
}

const restoreState = ref('idle') // idle | requesting | accepted | failed

let restoreReloadTimeout = null

const restoreStatusText = computed(() => {
  switch (restoreState.value) {
    case 'requesting':
      return 'Sending restore request...'
    case 'accepted':
      return 'Device is resetting and restarting, the page will reload'
    case 'failed':
      return 'Failed to restore settings, check the device connection and retry'
  }
  return ''
})

const confirmRestoreDefaults = () => document.getElementById('restoreDefaults').click()

const handleRestoreDefaults = async (confirmed) => {
  if (!confirmed) return

  restoreState.value = 'requesting'

  try {
    const response = await fetch(global.baseURL + 'api/factory', {
      method: 'GET',
      headers: { Authorization: global.token }
    })
    const json = await response.json()
    if (json.success !== true) throw new Error(json.message)
    restoreState.value = 'accepted'
    restoreReloadTimeout = setTimeout(() => location.reload(), 4000)
  } catch (err) {
    logError('SystemToolsView.handleRestoreDefaults()', err)
    restoreState.value = 'failed'
  }
}

onBeforeUnmount(() => {
  if (restoreReloadTimeout) clearTimeout(restoreReloadTimeout)
})
</script>

<style scoped>
.system-tools { padding-top: 24px; display: flex; flex-direction: column; gap: 32px; }

.st-header { display: flex; flex-direction: column; gap: 4px; }
.st-title { display: flex; align-items: center; gap: 8px; color: #16734e; font-size: 24px; font-weight: 600; letter-spacing: -.5px; margin: 0; }
.st-card-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; margin: 0; }
.st-text { color: #5e6863; font-size: 14px; margin: 0; }
.st-title-danger { color: #b02a37; }

.st-card { display: flex; flex-direction: column; align-items: flex-start; gap: 20px; border: 1px solid #ccd5d0; border-radius: 8px; padding: 24px; }
.st-card > div { width: 100%; }
.st-card-danger { border: 1px solid rgba(176, 42, 55, .3); }
.st-card-desc { max-width: 640px; margin-top: 8px; line-height: 1.5; }

.st-status { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 14px; min-height: 22px; }
.st-status-danger { color: #b02a37; }
.st-text-danger { color: #b02a37; }

.st-card .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; flex-shrink: 0; }

@media (max-width: 575px) {
  .st-card .btn { width: 100%; }
}
</style>
