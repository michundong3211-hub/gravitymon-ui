<template>
  <div class="container">
    <p></p>

    <template v-if="status">
      <BsMessage v-if="!status.self_check.push_targets" dismissable="true" message="" alert="danger">
        No remote services are active. Check your push settings and enable at least one service.
      </BsMessage>

      <BsMessage v-if="!status.self_check.gyro_connected && status.wifi_setup == false" dismissable="true" message=""
        alert="danger">
        No gyro is detected. Try to reboot / power-off. If this persists, check for hardware issues.
      </BsMessage>
    </template>

    <div v-if="status" class="container overflow-hidden text-center">
      <div class="row gy-4">
        <div class="col-md-4">
          <BsCard header="WIFI" title="">
            <p class="text-center">{{ status.rssi }} dBm - {{ status.wifi_ssid }}</p>
            <p class="text-center">
              <router-link class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
                to="/device/wifi">
                WIFI Settings
              </router-link>
            </p>
          </BsCard>
        </div>
        <div class="col-md-4">
          <BsCard header="HTTP Post" title="">
            <p class="text-center">Send data to multiple endpoints</p>
            <p class="text-center">
              <router-link class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
                to="/push/http-post">
                HTTP Post Settings
              </router-link>
            </p>
          </BsCard>
        </div>
        <div class="col-md-4">
          <BsCard header="Bluetooth" title="">
            <p class="text-center">Multiple Bluetooth data tranmission options</p>
            <p class="text-center">
              <router-link class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
                to="/push/bluetooth">
                Bluetooth Settings
              </router-link>
            </p>
          </BsCard>
        </div>

        <div class="col-md-4">
          <BsCard header="Device" title="">
            <p class="text-center">
              Device Id: {{ status.id }}
              <button type="button" class="btn btn-outline-secondary btn-sm mx-2" @click="copyId">
                {{ copied ? 'Copied!' : 'Copy ID' }}
              </button>
            </p>
            <p class="text-center">
              IP Address: {{ status.ip }}
            </p>
          </BsCard>
        </div>

        <div class="col-md-4">
          <BsCard header="Firmware" title="">
            <p class="text-center">
              Current Version: {{ global.app_ver }}
            </p>
            <p class="text-center" v-if="newVersion.new">
              {{ newVersion.ver }} is available, go to
              <router-link
                class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
                to="/other/firmware">
                Firmware Update
              </router-link>
            </p>
            <p class="text-center" v-if="!newVersion.new">
              You have the latest version.
            </p>
          </BsCard>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeMount } from 'vue'
import { status, global } from '@/modules/pinia'
import { logDebug, logError, logInfo } from '@/modules/logger'
import { useTimers } from '@/composables/useTimers'
import { useFetch } from '@/composables/useFetch'

const { createInterval, createTimeout } = useTimers()
const { managedFetch } = useFetch()

const polling = ref(null)
const flag = ref(false)
const angle = ref({ average: 0, sum: 0, count: 0 })
const newVersion = ref({ new: false, ver: '' })

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
      const response = await managedFetch('http://localhost:3000/api/version.json')

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

  if (newVer.length != 3 && curVer.length != 3) return false

  if (newVer[0] > curVer[0]) return true
  else if (newVer[0] == curVer[0] && newVer[1] > curVer[1]) return true
  else if (newVer[0] == curVer[0] && newVer[1] == curVer[1] && newVer[2] > curVer[2]) return true

  return false
}

const copied = ref(false)

function copyId() {
  if (status.id) {
    navigator.clipboard.writeText(status.id).then(() => {
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 1200)
    })
  }
}
</script>
