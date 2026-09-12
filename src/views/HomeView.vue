<template>
  <div class="container">
    <p></p>

    <template v-if="status">
      <BsMessage v-if="!status.self_check.push_targets" dismissable="true" message="" alert="danger">
        No remote services are active. Check your push settings and enable at least one service.
      </BsMessage>

      <BsMessage v-if="!status.self_check.gyro_connected && isConfigMode" dismissable="true" message="" alert="danger">
        No gyro is detected. Try to reboot / power-off. If this persists, check for hardware issues.
      </BsMessage>
    </template>

    <div v-if="status" :class="isConfigMode ? 'container overflow-hidden text-center' : 'wifi-overview'">
      <div class="row gy-4" v-if="isConfigMode">
        <div class="col-md-4" v-if="status.self_check.gravity_formula && isConfigMode">
          <BsCard header="Measurement" color="info" title="Gravity">
            <p class="text-center">
              {{ status.gravity }}
              {{ status.gravity_unit === 'G' ? ' SG' : ' P' }}
            </p>
          </BsCard>
        </div>

        <div class="col-md-4" v-if="!status.self_check.gravity_formula && isConfigMode">
          <BsCard header="Measurement" title="Error" :iserr="true" icon="bi-x-circle">
            <p class="text-center">
              Missing
              <router-link class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
                to="/gravity/formula">formula
              </router-link>
              , unable to calculate gravity
            </p>
          </BsCard>
        </div>

        <div class="col-md-4" v-if="
          status.self_check.gyro_calibration && status.self_check.gyro_connected && isConfigMode
        ">
          <BsCard header="Measurement" color="info" title="Angle">
            <p class="text-center">
              <template v-if="status.self_check.gyro_moving"> Gyro is moving</template>
              <template v-else>
                {{ status.angle }}
              </template>
            </p>
          </BsCard>
        </div>
        <div class="col-md-4" v-if="
          status.self_check.gyro_calibration && status.self_check.gyro_connected && isConfigMode
        ">
          <BsCard header="Measurement" color="info" title="Average Angle">
            <p class="text-center">
              {{ angle.average }} ({{ angle.count }})
              <button @click="clearAverage" type="button" class="btn btn-outline-info btn-sm" style="font-size: 0.7rem">
                Clear
              </button>
            </p>
          </BsCard>
        </div>
        <div class="col-md-4" v-if="!status.self_check.gyro_calibration && isConfigMode">
          <BsCard header="Measurement" title="Error" :iserr="true" icon="bi-x-circle">
            <p class="text-center">
              Gyro has not been
              <router-link class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
                to="/device/gyro">calibrated
              </router-link>
              at 90 degrees
            </p>
          </BsCard>
        </div>

        <div class="col-md-4" v-if="status.self_check.temp_connected && isConfigMode">
          <BsCard header="Measurement" color="info" title="Temperature">
            <p class="text-center">{{ status.temp }} °{{ status.temp_unit }}</p>
          </BsCard>
        </div>

        <div class="col-md-4" v-if="!status.self_check.temp_connected && isConfigMode">
          <BsCard header="Measurement" title="Error" :iserr="true" icon="bi-x-circle">
            <p class="text-center">No temperature sensor detected</p>
          </BsCard>
        </div>

        <div class="col-md-4" v-if="status.self_check.battery_level">
          <BsCard header="Measurement" color="info" title="Battery">
            <p class="text-center">{{ status.battery }} V</p>
          </BsCard>
        </div>
        <div class="col-md-4" v-if="!status.self_check.battery_level">
          <BsCard header="Measurement" title="Error" :iserr="true" icon="bi-x-circle">
            <p class="text-center">Battery level not valid</p>
          </BsCard>
        </div>

        <div class="col-md-4">
          <BsCard header="Device" title="WIFI">
            <p class="text-center">{{ status.rssi }} dBm - {{ status.wifi_ssid }}</p>
          </BsCard>
        </div>

        <div class="col-md-4">
          <BsCard header="Device" title="IP Address">
            <p class="text-center">
              {{ status.ip }}
            </p>
          </BsCard>
        </div>

        <div class="col-md-4">
          <BsCard header="Device" title="Memory">
            <p class="text-center">
              Free: {{ status.free_heap }} kb, Total: {{ status.total_heap }} kb
            </p>
          </BsCard>
        </div>

        <div class="col-md-4" v-if="newVersion.new">
          <BsCard header="Device" title="Upgrade available">
            <p class="text-center">
              {{ newVersion.ver }} available on
              <a class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
                href="https://github.com/mp-se/gravitymon/releases" target="_blank">github.com</a>
            </p>
          </BsCard>
        </div>

        <div class="col-md-4">
          <BsCard header="Device" title="Software version">
            <p class="text-center">
              Firmware: {{ global.app_ver }} ({{ global.app_build }}) UI: {{ global.uiVersion }} ({{
                global.uiBuild
              }})
            </p>
          </BsCard>
        </div>

        <div class="col-md-4">
          <BsCard header="Device" title="Platform">
            <p class="text-center">
              Platform: <span class="badge bg-secondary">{{ global.platform }}</span> Variant:
              <span class="badge bg-secondary">{{ global.hardware }}</span>
            </p>
          </BsCard>
        </div>

        <div class="col-md-4" v-if="isConfigMode">
          <BsCard header="Device" title="Hardware">
            <p class="text-center">
              Board: <span class="badge bg-secondary">{{ global.board }}</span> Gyro:
              <span class="badge bg-secondary">{{ status.gyro_family }}</span>
            </p>
          </BsCard>
        </div>

        <div class="col-md-4">
          <BsCard header="Device" title="ID">
            <p class="text-center">{{ status.id }}</p>
          </BsCard>
        </div>

        <div class="col-md-4">
          <BsCard header="Device" title="Force config mode">
            <div class="d-flex justify-content-center">
              <div class="form-check form-switch" style="height: 0.7rem">
                <input v-model="flag" class="form-check-input" type="checkbox" role="switch" />
              </div>
            </div>
          </BsCard>
        </div>
      </div>
      <main v-else>
        <div class="wifi-page-heading">
          <p class="wifi-mode-label">WIFI MODE</p>
          <h1>Device overview</h1>
          <p class="text-secondary">Device information and connection details.</p>
        </div>

        <div class="wifi-info-sections">
          <section aria-labelledby="device-info-heading">
            <h2 id="device-info-heading">Device</h2>
            <dl class="wifi-details">
              <div><dt>Device ID</dt><dd class="wifi-id-value"><span>{{ status.id || '—' }}</span>
                <button type="button" class="btn btn-outline-secondary btn-sm" @click="copyId"
                  :disabled="!status.id" aria-live="polite">{{ copied ? 'Copied!' : 'Copy ID' }}</button>
              </dd></div>
              <div><dt>Battery</dt><dd>{{ status.battery ?? '—' }} <span class="text-secondary">V</span></dd></div>
              <div><dt>Firmware version</dt><dd>{{ global.app_ver || '—' }}</dd></div>
              <div><dt>Board</dt><dd>{{ global.board || '—' }}</dd></div>
            </dl>
          </section>
          <section aria-labelledby="wifi-info-heading">
            <h2 id="wifi-info-heading">WIFI</h2>
            <dl class="wifi-details">
              <div><dt>Network</dt><dd>{{ status.wifi_ssid || 'Not connected' }}</dd></div>
              <div><dt>IP address</dt><dd>{{ status.ip || '—' }}</dd></div>
              <div><dt>Signal strength</dt><dd>{{ status.wifi_ssid && status.rssi ? `${status.rssi} dBm` : '—' }}</dd></div>
              <div><dt>Device name</dt><dd>{{ config.mdns || '—' }}</dd></div>
            </dl>
          </section>
        </div>

      </main>

    </div>
  </div>
</template>

<script setup>
import { onBeforeMount, onMounted, ref, watch, computed } from 'vue'
import { global, status, config } from '@/modules/pinia'
import { logDebug, logError, logInfo } from '@/modules/logger'
import { useTimers } from '@/composables/useTimers'
import { useFetch } from '@/composables/useFetch'
import { copyToClipboard } from '@/modules/utils.js'

const { createInterval, createTimeout } = useTimers()
const { managedFetch } = useFetch()

const polling = ref(null)
const flag = ref(false)
const angle = ref({ average: 0, sum: 0, count: 0 })
const newVersion = ref({ new: false, ver: '' })
const isConfigMode = computed(() => status.wifi_setup === false || global.forceConfigMode)

watch(flag, async () => {
  status.setSleepMode(flag.value, () => { })
})

function clearAverage() {
  angle.value.sum = 0
  angle.value.count = 0
  angle.value.sum = 0
}

function refresh() {
  status.load((success) => {
    if (success) {
      if (!status.self_check.gyro_moving) {
        angle.value.sum += parseFloat(status.angle)
        angle.value.count++
        angle.value.average = (
          Math.round((angle.value.sum / angle.value.count) * 100) / 100
        ).toFixed(2)
      }
    }
  })
}

onMounted(async () => {
  flag.value = status.sleep_mode

  createTimeout(async () => {
    try {
      logInfo('HomeView.onMounted()', 'Checking for new sw')
      const versionFile = global.isEsp8266 ? 'version.json' : 'version32c3.json'
      const response = await managedFetch(`${config.ota_url}${versionFile}`)

      if (!response) {
        // Request was aborted
        return
      }

      const json = await response.json()

      logDebug('HomeView.onMounted()', json)
      if (checkForNewGravMonVersion(json)) {
        newVersion.value.new = true
        newVersion.value.ver = json.version
        logInfo('HomeView.onMounted()', 'Newer version found')
      }

      logInfo('HomeView.onMounted()', 'Fetching latest gravtmon version completed')
    } catch (err) {
      logError('HomeView.onMounted()', err)
    }
  }, 500)
})

onBeforeMount(() => {
  refresh()
  polling.value = createInterval(refresh, 4000)
})

function checkForNewGravMonVersion(json) {
  const current = global.app_ver
  const latest = json.version

  const newVer = latest.split('.')
  const curVer = current.split('.')

  if (newVer.length !== 3 && curVer.length !== 3) {
    return false
  }

  if (newVer[0] > curVer[0]) {
    return true
  } else if (newVer[0] === curVer[0] && newVer[1] > curVer[1]) {
    return true
  } else if (newVer[0] === curVer[0] && newVer[1] === curVer[1] && newVer[2] > curVer[2]) {
    return true
  }

  return false
}

const copied = ref(false)

function copyId() {
  const result = copyToClipboard(status.id)
  if (result) {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  }
}

</script>

<style scoped>
.wifi-page-heading { padding: 20px 0 24px; }
.wifi-mode-label { color: #16734e; font-size: 12px; font-weight: 650; letter-spacing: 1.2px; margin-bottom: 8px; }
.wifi-page-heading h1 { font-size: 30px; font-weight: 600; letter-spacing: -.8px; }
.wifi-page-heading p:last-child { margin-bottom: 0; }
.wifi-info-sections { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
.wifi-overview h2 { font-size: 16px; font-weight: 650; margin-bottom: 16px; }
.wifi-details { margin: 0; }
.wifi-details > div { display: grid; grid-template-columns: 140px minmax(0, 1fr); align-items: center; gap: 12px; min-height: 64px; padding: 10px 0; border-top: 1px solid #e4e7e5; }
.wifi-details dt { color: #5e6863; font-size: 14px; font-weight: 400; }
.wifi-details dd { margin: 0; font-size: 15px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.wifi-id-value { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
@media (max-width: 767px) {
  .wifi-info-sections { grid-template-columns: 1fr; gap: 28px; }
  .wifi-page-heading { padding-top: 12px; }
  .wifi-page-heading h1 { font-size: 26px; }
  .wifi-details > div { grid-template-columns: 126px minmax(0, 1fr); }
}
</style>
