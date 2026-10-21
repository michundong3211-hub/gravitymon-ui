<template>
  <div class="container">
    <p></p>
    <p class="h3">Device - Hardware</p>
    <hr />

    <BsMessage dismissable="true" message="" alert="info">
      You can also use the voltage factor calculator under tools
      <router-link
        class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
        to="/other/tools"
        >here</router-link
      >
    </BsMessage>

    <form @submit.prevent="save" class="needs-validation" novalidate>
      <div class="row">
        <div class="col-md-6">
          <BsInputNumber
            v-model="config.voltage_factor"
            label="Voltage factor"
            min="0"
            max="6"
            step=".01"
            width="4"
            :unit="voltage"
            help="Factor used to calculate the battery voltage. Can vary depending on the R2 value (0 to 6)"
            :disabled="global.disabled"
          >
          </BsInputNumber>
        </div>
        <div class="col-md-6">
          <BsInputNumber
            v-model="config.voltage_config"
            unit="V"
            label="Voltage config"
            min="3"
            max="6"
            step=".01"
            width="4"
            help="Over this level the device will always go into configuration mode, some batteries might have a higher voltage when fully charged (3 to 6)"
            :disabled="global.disabled"
          ></BsInputNumber>
        </div>

        <div class="col-md-6">
          <BsInputSwitch
            v-model="config.storage_sleep"
            label="Storage sleep"
            help="When placed on its cap (less than 15°), sleep and check the angle once an hour."
            :disabled="global.disabled"
          ></BsInputSwitch>
        </div>
        <template v-if="isConfigMode">
          <div class="col-md-6">
            <BsInputSwitch
              v-model="hibernateEnabled"
              label="Automatic long sleep"
              help="Stop automatic wake-ups after continuous storage. Use an external reset (for example a magnet with a reed switch) to wake the device."
              :disabled="global.disabled || !config.storage_sleep || !hibernateSupported"
            ></BsInputSwitch>
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
              width="4"
              help="1–365 days of continuous upside-down storage. Default: 30 days. Measurement or an external reset restarts the countdown."
              :disabled="global.disabled || !config.storage_sleep"
            ></BsInputNumber>
          </div>
        </template>
        <div class="col-md-6" v-if="!global.isEsp8266">
          <BsInputSwitch
            v-model="config.charging_pin_enabled"
            label="Charging Pin Mode"
            help="Enter WiFi mode when charging power exceeds 2V on the defined pin. During storage, wake when charging power is connected."
            :disabled="global.disabled || !global.feature.charging"
          ></BsInputSwitch>
        </div>
        <!-- <div class="col-md-6">
          <BsInputSwitch
            v-model="config.battery_saving"
            label="Battery saving"
            help="When active, the sleep interval will be changed to 1 hour when battery drops below 25% (3.73V)"
            :disabled="global.disabled"
          ></BsInputSwitch>
        </div> -->
        <div class="col-md-12">
          <hr />
        </div>
        <div class="col-md-12">
          <BsInputRadio
            v-model="config.tempsensor_resolution"
            :options="tempsensorResolutionOptions"
            label="DS18B20 resolution"
            help="Resolution when reading the DS18B20 temperature sensor, higher resolution give better accuracy but takes longer to process and reduces battery life"
            :disabled="disableDs18b20"
          ></BsInputRadio>
        </div>
        <div class="col-md-6">
          <BsInputSwitch
            v-model="config.gyro_temp"
            label="Gyro temperature"
            help="Use the temperature sensor in the gyro instead of DS18B20, require a minimum 300s update interval to be accurate or the heat from the chip will affect reading"
            :disabled="global.disabled"
          ></BsInputSwitch>
        </div>
      </div>
      <div class="row gy-2">
        <div class="col-md-12">
          <hr />
        </div>
        <div class="col-md-12">
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
            &nbsp;Restart device</button
          >&nbsp;
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { validateCurrentForm, restart } from '@/modules/utils'
import { global, config, status } from '@/modules/pinia'

const isConfigMode = computed(() => status.wifi_setup === false || global.forceConfigMode)
const hibernateSupported = computed(() => config.storage_hibernate_days !== null)
const hibernateEnabled = computed({
  get: () => hibernateSupported.value && config.storage_hibernate_days > 0,
  set: (enabled) => { config.storage_hibernate_days = enabled ? 30 : 0 }
})

const tempsensorResolutionOptions = ref([
  { label: '0.5°C (93 ms)', value: 9 },
  { label: '0.25°C (187 ms)', value: 10 },
  { label: '0.125°C (375 ms)', value: 11 },
  { label: '0.0625°C (850 ms)', value: 12 }
])

const disableDs18b20 = computed(() => {
  return config.gyro_temp || global.disabled
})

const voltage = computed(() => {
  return status.battery + ' V'
})

const save = () => {
  if (!validateCurrentForm()) return

  global.clearMessages()
  config.saveAll()
}
</script>
