<template>
  <div class="container">
    <p></p>
    <p class="h3">Device - Battery</p>
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
      <div class="">
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
            ></span>Save</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { validateCurrentForm, restart } from '@/modules/utils'
import { global, config, status } from '@/modules/pinia'

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
