<template>
  <div class="container">
    <p></p>
    <p class="h3">Push - HTTP Post</p>
    <hr />

    <form @submit.prevent="save" class="needs-validation" novalidate>
      <div class="row">
        <div class="col-md-9">
          <BsInputSwitch
            v-model="config.use_http_post"
            label="Http Post Switch"
            :disabled="global.disabled"
          ></BsInputSwitch>
        </div>
        <div class="col-md-9">
          <BsInputNumber
            v-model="config.http_post_sleep_interval"
            :label="'Sleep interval' + sleepLabel"
            unit="s"
            min="300"
            max="3600"
            step="1"
            width="4"
            help="The number of seconds that the device will sleep between gravity readings. Recommended value is 900s"
            :disabled="global.disabled"
          />
        </div>
        <div class="col-md-9">
          <BsInputText
            v-model="config.http_post2_target"
            type="url"
            maxlength="120"
            label="HTTP URL"
            help="URL to push target, use format http://servername.com/resource (Supports http and https)"
            :disabled="pushDisabled"
          />
          <details>
            <summary class="pt-2 fw-bold" style="cursor: pointer">Data Format</summary>
            <div>
              <BsInputTextAreaFormat
                v-model="config.http_post2_format_gravity"
                rows="6"
                help="Format template used to create the data sent to the remote service"
                :disabled="pushDisabled"
              />
              <BsModal
                @click="renderFormat2"
                v-model="render"
                :code="true"
                :json="true"
                title="Format preview"
                button="Preview format"
                :disabled="pushDisabled"
              />
            </div>
          </details>
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
            Save
          </button>
          <button
            @click="runTest"
            type="button"
            class="btn btn-secondary mx-2"
            :disabled="pushDisabled"
          >
            <span
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
              :hidden="!global.disabled"
            ></span>
            Run push test
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { config, global, status } from '@/modules/pinia'
import { applyTemplate, validateCurrentForm } from '@/modules/utils'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { logError } from '@/modules/logger.js'

const { http_post_sleep_interval } = storeToRefs(config)
const render = ref('')
const sleepLabel = ref('')

watch(http_post_sleep_interval, () => {
  createSleepLabel()
})

onMounted(() => {
  createSleepLabel()
})

const createSleepLabel = () => {
  const s =
    Math.floor(http_post_sleep_interval.value / 60) +
    ' min ' +
    (http_post_sleep_interval.value % 60) +
    ' sec'
  sleepLabel.value = '(' + s + ')'
}

const pushDisabled = computed(() => {
  return global.disabled || config.use_wifi_direct
})

const renderFormat2 = () => {
  render.value = applyTemplate(status, config, config.http_post2_format_gravity)
}

const save = () => {
  if (!validateCurrentForm()) {
    return
  }

  config.saveAll()
}

const runTest = async () => {
  try {
    const data = {
      push_format: 'http_post2_format_gravity'
    }

    global.clearMessages()
    await config.runPushTest(data)
  } catch (error) {
    logError('PushHttpPost2View.runTest()', error)
    global.messageError = 'Failed to start push test'
  }
}
</script>
