<template>
  <header class="wifi-header">
    <div class="wifi-header-inner">
      <div class="wifi-brand-row">
        <router-link to="/" class="wifi-brand">CuckooTilt</router-link>
        <span v-if="global.configChanged" class="small text-warning-emphasis" role="status">Save needed</span>
        <span v-if="global.disabled" class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Loading...</span>
        </span>
      </div>
      <nav class="wifi-navigation" aria-label="Main navigation">
        <router-link v-for="item in menu" :key="item.path" :to="item.path"
          class="wifi-nav-link" exact-active-class="wifi-nav-active"
          :class="{ 'wifi-nav-active': item.path === '/other/system-tools' && ['/other/firmware', '/other/about'].includes($route.path) }">
          <component :is="item.icon" width="16" height="16" aria-hidden="true" />
          {{ item.label }}
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { global } from '@/modules/pinia'

const menu = computed(() => [
  { path: '/', label: 'Home', icon: 'IconHome' },
  { path: '/device/wifi', label: 'WIFI', icon: 'IconWifi' },
  { path: '/push/http-post', label: 'HTTP Post', icon: 'IconCloudUpArrow' },
  ...(!global.isEsp8266 ? [{ path: '/push/bluetooth', label: 'Bluetooth', icon: 'IconCpu' }] : []),
  { path: '/gravity/formula2', label: 'Gravity Formula', icon: 'IconGraphUpArrow' },
  { path: '/device/battery', label: 'Battery', icon: 'IconCpu' },
  { path: '/other/system-tools', label: 'Tools', icon: 'IconTools' }
])

// WIFI mode always uses light colors without changing the saved config theme.
onMounted(() => document.documentElement.setAttribute('data-bs-theme', 'light'))
</script>

<style scoped>
.wifi-header { position: sticky; top: 0; z-index: 1020; background: #fff; border-bottom: 1px solid #e4e7e5; }
.wifi-header-inner { max-width: 1120px; margin: auto; padding: 12px 20px 0; }
.wifi-brand-row { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }
.wifi-brand { color: #16734e; font-size: 20px; font-weight: 650; letter-spacing: -.5px; text-decoration: none; margin-right: auto; }
.wifi-navigation { display: flex; gap: 4px; overflow-x: auto; padding: 0 0 8px; scrollbar-width: thin; }
.wifi-nav-link { display: flex; flex-shrink: 0; align-items: center; gap: 7px; min-height: 44px; padding: 8px 12px; border-radius: 6px; color: #5e6863; text-decoration: none; font-size: 14px; font-weight: 500; }
.wifi-nav-link:hover { background: #f3f5f4; color: #234a37; }
.wifi-nav-active { background: #e8f3ec; color: #16734e; }
.wifi-nav-link:focus-visible, .wifi-brand:focus-visible { outline: 2px solid #16734e; outline-offset: -2px; }
@media (min-width: 1100px) {
  .wifi-header-inner { display: flex; align-items: center; gap: 20px; padding-block: 8px; }
  .wifi-brand-row { margin-bottom: 0; flex-shrink: 0; }
  .wifi-navigation { margin-left: auto; padding-bottom: 0; min-width: 0; }
}
@media (max-width: 575px) {
  .wifi-header-inner { padding: 12px 16px 0; }
  .wifi-navigation { margin-inline: -4px; }
}
</style>
