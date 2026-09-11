<template>
  <div class="container">
    <p></p>
    <p class="h3">CuckooTilt - WiFi</p>
    <hr />

    <BsMessage
      v-if="scanning"
      :dismissable="false"
      message="Scanning for wifi networks in range"
      alert="info"
    >
    </BsMessage>

    <BsMessage
      v-if="config.wifi_ssid === '' && config.wifi_ssid2 === ''"
      dismissable="true"
      message=""
      alert="warning"
    >
      You need to define at least one wifi network
    </BsMessage>

    <form @submit.prevent="save" class="needs-validation" novalidate>
      <div class="row">
        <div class="col-md-9">
          <BsSelect
            v-model="config.wifi_ssid"
            label="SSID"
            width="6"
            :options="networks"
            :badge="badge.deviceWifi1Badge()"
            :disabled="global.disabled"
          />

          <BsInputText
            v-model="config.wifi_pass"
            type="password"
            width="6"
            maxlength="50"
            label="Password"
            help="Enter password for the wifi network"
            :disabled="global.disabled"
          ></BsInputText>

          <div class="has-validation pt-2">
            <label class="form-label fw-bold">Device ID: {{ status.id }}</label>
          </div>
        </div>
      </div>

      <div class="row gy-2">
        <div class="col-md-12">
          <hr />
        </div>

        <div class="col-md-12">
          <p>
            Using the WIFI direct feature means that the device will connect to the AP and send data
            using HTTP post to the Gravitymon Gateway.
          </p>
        </div>

        <div class="col-md-9">
          <BsInputText
            v-model="config.wifi_direct_ssid"
            label="Direct SSID"
            help="Enter the SSID for the wifi direct functionallity"
            :disabled="global.disabled"
          />
        </div>
        <div class="col-md-9">
          <BsInputText
            v-model="config.wifi_direct_pass"
            type="password"
            maxlength="50"
            label="Direct Password"
            help="Enter password for the wifi direct network"
            :disabled="global.disabled"
          ></BsInputText>
        </div>
        <div class="col-md-9">
          <BsInputSwitch
            v-model="config.use_wifi_direct"
            label="Use wifi direct in gravity mode"
            help="In gravity mode the wifi direct SSID/Password will be used for connection"
            :disabled="global.disabled"
          ></BsInputSwitch>
        </div>
      </div>

      <div class="row gy-2">
        <div class="col-md-12">
          <hr />
        </div>
        <div class="col-md-12">
          <button type="button" class="btn btn-primary" @click="copyId()">
            {{ copied ? 'Copied!' : 'Copy ID' }}
          </button>&nbsp;

          <button
            type="submit"
            class="btn btn-primary w-2"
            :disabled="global.disabled || !global.configChanged"
          >
            <span
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
              :hidden="!global.disabled"
            ></span>
            &nbsp;Save</button
          >&nbsp;

          <button
            @click="restart()"
            type="button"
            class="btn btn-secondary"
            :disabled="global.disabled"
          >
            <span
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
              :hidden="!global.disabled"
            ></span>
            &nbsp;Restart device
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { copyToClipboard, restart, validateCurrentForm } from '@/modules/utils'
import { config, global, status } from '@/modules/pinia'
import * as badge from '@/modules/badge'
import { onMounted, ref } from 'vue'
import { logDebug } from '@/modules/logger'

const scanning = ref(false)
const networks = ref([])

function wifiName(label, rssi, encr) {
  var l = label
  if (encr) {
    l += ' \u{1f512}'
  }
  if (rssi > -50) {
    l += ' (Excellent)'
  } else if (rssi > -60) {
    l += ' (Good)'
  } else if (rssi > -67) {
    l += ' (Minimum)'
  } else {
    l += ' (Poor)'
  }
  return l
}

onMounted(() => {
  scanning.value = true
  config.runWifiScan((success, data) => {
    if (success) {
      networks.value = [{ label: '-blank-', value: '', rssi: 0, encryption: 0, channel: 0 }]
      for (var n in data.networks) {
        var d = data.networks[n]
        var o = {
          label: wifiName(d.wifi_ssid, d.rssi, d.encryption),
          value: d.wifi_ssid,
          rssi: d.rssi,
          encryption: data.networks[n].encryption,
          channel: d.channel
        }

        var f = networks.value.filter((obj) => {
          return obj.value === d.wifi_ssid
        })
        logDebug('DeviceWifiView.onMounted()', 'result:', f, d.wifi_ssid)
        if (f.length === 0) {
          networks.value.push(o)
        }
      }
      scanning.value = false
    }
  })
})

const save = () => {
  if (!validateCurrentForm()) {
    return
  }

  config.saveAll()
  global.messageInfo =
    'If WIFI settings are changed, restart the device and enter the new URL of the device!'
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
