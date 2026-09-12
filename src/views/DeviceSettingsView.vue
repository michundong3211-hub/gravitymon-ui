<template>
  <div class="container">
    <p></p>
    <p class="h2">Device - Settings</p>
    <hr />

    <BsMessage v-if="config.mdns === ''" dismissable="true" message="" alert="warning">
      You need to define a mdns name for the device
    </BsMessage>

    <form @submit.prevent="saveSettings" class="needs-validation" novalidate>
      <div class="row">
        <div class="col-md-12">
          <BsInputText
            v-model="config.mdns"
            maxlength="63"
            minlength="1"
            label="MDNS"
            help="Enter device name used on the network, the suffix .local will be added to this name"
            :badge="badge.deviceMdnsBadge()"
            :disabled="global.disabled"
          >
          </BsInputText>
        </div>

        <div class="col-md-12">
          <hr />
        </div>

        <div class="col-md-6">
          <BsInputRadio
            v-model="config.temp_unit"
            :options="tempOptions"
            label="Temperature Format"
            width=""
            :disabled="global.disabled"
          ></BsInputRadio>
        </div>
        <div class="col-md-6">
          <BsInputRadio
            v-model="config.gravity_unit"
            :options="gravityOptions"
            label="Gravity Format"
            width=""
            :disabled="global.disabled"
          ></BsInputRadio>
        </div>

        <div class="col-md-12">
          <hr />
        </div>

        <div class="col-md-9">
          <BsInputText
            v-model="otaUrl"
            type="url"
            maxlength="80"
            label="OTA URL"
            help="Base URL to where firmware and version.json file can be found. Needs to end with '/'', example: http://www.mysite.com/firmware/"
            :disabled="global.disabled"
          >
          </BsInputText>
        </div>

        <div class="col-md-3">
          <BsDropdown
            label="Predefined ota"
            button="URL"
            :options="otaOptions"
            :callback="otaCallback"
            :disabled="global.disabled"
          />
        </div>

        <div class="col-md-12">
          <hr />
        </div>

        <div class="col-md-6">
          <BsInputRadio
            v-model="config.dark_mode"
            :options="uiOptions"
            label="User Interface"
            width=""
            :disabled="global.disabled"
          ></BsInputRadio>
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

          <button
            @click="factory"
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
            &nbsp;Restore factory defaults
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { validateCurrentForm, restart, restoreFactoryDefaults as factory } from '@/modules/utils'
import { global, config } from '@/modules/pinia'
import * as badge from '@/modules/badge'

const otaUrl = computed({
  get: () => config.ota_url.trim(),
  set: val => { config.ota_url = val ? val.trim() : '' }
})

const otaOptions = ref([
  { label: '-blank-', value: '' },
  { label: 'Gravitymon.com', value: 'https://www.gravitymon.com/firmware/' }
])

const tempOptions = ref([
  { label: 'Celsius °C', value: 'C' },
  { label: 'Fahrenheit °F', value: 'F' }
])

const gravityOptions = ref([
  { label: 'Specific Gravity', value: 'G' },
  { label: 'Plato', value: 'P' }
])

const uiOptions = ref([
  { label: 'Day mode', value: false },
  { label: 'Dark mode', value: true }
])

const otaCallback = (opt) => {
  config.ota_url = opt
}

const saveSettings = () => {
  if (!validateCurrentForm()) return

  config.saveAll()
}
</script>
