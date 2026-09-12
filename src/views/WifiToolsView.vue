<template>
  <main class="container wifi-tools">
    <h1 class="h3">Tools</h1>
    <p class="text-secondary">Firmware, device maintenance and product information.</p>

    <div class="tool-row">
      <div><h2>Firmware</h2><p>Current version: {{ global.app_ver || '—' }}</p></div>
      <router-link class="btn btn-outline-secondary" to="/other/firmware">Update firmware</router-link>
    </div>
    <div class="tool-row">
      <div><h2>Restore default settings</h2><p>Keep WIFI credentials, reset other settings and restart the device.</p></div>
      <button type="button" class="btn btn-outline-secondary" :disabled="global.disabled"
        @click="confirmRestoreDefaults">Restore defaults</button>
    </div>
    <div class="tool-row">
      <div><h2>About</h2><p>About CuckooTilt, GravityMon and licensing.</p></div>
      <router-link class="btn btn-outline-secondary" to="/other/about">About CuckooTilt</router-link>
    </div>

    <BsModalConfirm :callback="confirmRestoreCallback"
      message="Do you really want to restore default settings? WiFi settings are kept, all other settings are lost and the device will restart."
      id="restoreDefaults" title="Restore default settings" />
  </main>
</template>

<script setup>
import { global } from '@/modules/pinia'
import { restoreFactoryDefaults } from '@/modules/utils'

const confirmRestoreDefaults = () => document.getElementById('restoreDefaults').click()
const confirmRestoreCallback = (confirmed) => {
  if (confirmed) restoreFactoryDefaults()
}
</script>

<style scoped>
.wifi-tools { padding-top: 24px; }
.tool-row { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 24px 0; border-top: 1px solid #e4e7e5; }
.tool-row h2 { font-size: 16px; font-weight: 650; margin-bottom: 8px; }
.tool-row p { color: #5e6863; font-size: 14px; margin: 0; }
.tool-row .btn { flex-shrink: 0; }
@media (max-width: 575px) {
  .tool-row { align-items: flex-start; flex-direction: column; gap: 12px; }
}
</style>
