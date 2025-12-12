<template>
  <div class="container">
    <p></p>
    <p class="h3">Push - Settings</p>

    <form @submit.prevent="save" class="needs-validation" novalidate>
      <div class="row">
        <div class="col-md-12">
          <hr />
        </div>
        <div class="col-md-9">
          <BsInputNumber
            v-model="config.sleep_interval"
            :label="'Sleep interval' + sleepLabel"
            unit="s"
            :min="sleepMin"
            max="3600"
            step="1"
            width="4"
            help="The number of seconds that the device will sleep between gravity readings. Recommended value is 900s"
            :disabled="global.disabled"
          />
        </div>
      </div>

      <div class="row">
        <div class="col-md-12">
          <hr />
        </div>
        <div class="col-md-9">
          <BsInputSwitch
            v-model="config.use_http_post"
            label="Http Post Switch"
            :disabled="global.disabled"
          ></BsInputSwitch>
          <router-link
            class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
            to="/push/http-post"
          >
            Http Post Settings
          </router-link>
        </div>
        <div class="col-md-9" v-if="!global.isEsp8266">
          <hr />
          <BsInputSwitch
            v-model="config.use_ble"
            label="Bluetooth Switch"
            :disabled="global.disabled"
          ></BsInputSwitch>
          <router-link
            class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
            to="/push/bluetooth"
          >
            Bluetooth Settings
          </router-link>
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
            ></span
            >Save
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { config, global } from '@/modules/pinia'
import { validateCurrentForm } from '@/modules/utils'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'

const { sleep_interval } = storeToRefs(config)
const sleepLabel = ref('')
const sleepMin = ref(15)
const sleepDefault = ref(900)

const updateSleepLabel = () => {
  if (sleep_interval.value < sleepMin.value) {
    sleep_interval.value = sleepMin.value
  }
  const s = Math.floor(sleep_interval.value / 60) + ' min ' + (sleep_interval.value % 60) + ' sec'
  sleepLabel.value = '(' + s + ')'
}

const updateSleepInterval = () => {
  if (config.use_ble) {
    sleepMin.value = 15
    sleepDefault.value = 30
  } else {
    sleepMin.value = 300
    sleepDefault.value = 900
  }
  config.sleep_interval = sleepDefault.value
}

watch(sleep_interval, updateSleepLabel)

watch([() => config.use_http_post, () => config.use_ble], updateSleepInterval)

onMounted(() => {
  updateSleepLabel()
})

const save = () => {
  if (!validateCurrentForm()) {
    return
  }

  config.saveAll()
}
</script>
