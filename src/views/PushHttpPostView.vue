<template>
  <div class="container">
    <p></p>
    <p class="h3">Push - HTTP Post</p>

    <form @submit.prevent="save" class="needs-validation" novalidate :disabled="config.use_wifi_direct">
      <div class="row">
        <div class="col-md-12">
          <hr />
        </div>
        <div class="col-md-9">
          <p class="h5">HTTP Post #1</p>
        </div>
        <div class="col-md-9">
          <BsInputText v-model="config.http_post_target" type="url" maxlength="120" label="HTTP URL"
            help="URL to push target, use format http://servername.com/resource (Supports http and https)"
            :disabled="pushDisabled" />
        </div>
        <div class="col-md-9">
          <BsInputTextAreaFormat v-model="config.http_post_format_gravity" rows="6" label="Data format"
            help="Format template used to create the data sent to the remote service" :disabled="pushDisabled" />
        </div>
        <div class="col-md-9">
          <BsModal @click="renderFormat" v-model="render" :code="true" :json="true" title="Format preview"
            button="Preview format" :disabled="pushDisabled" />
        </div>
      </div>

      <div class="row">
        <div class="col-md-12">
          <hr />
        </div>
        <div class="col-md-9">
          <p class="h5">HTTP Post #2</p>
        </div>
        <div class="col-md-9">
          <BsInputText v-model="config.http_post2_target" type="url" maxlength="120" label="HTTP URL"
            help="URL to push target, use format http://servername.com/resource (Supports http and https)"
            :disabled="pushDisabled" />
        </div>
        <div class="col-md-9">
          <BsInputTextAreaFormat v-model="config.http_post2_format_gravity" rows="6" label="Data format"
            help="Format template used to create the data sent to the remote service" :disabled="pushDisabled" />
        </div>
        <div class="col-md-9">
          <BsModal @click="renderFormat2" v-model="render" :code="true" :json="true" title="Format preview"
            button="Preview format" :disabled="pushDisabled" />
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <hr />
        </div>
        <div class="col-md-9">
          <p class="h5">HTTP Post Settings</p>
        </div>
        <div class="col-md-9">
          <BsInputNumber v-model="config.sleep_interval" :label="'Sleep interval' + sleepLabel" unit="s" min="10"
            max="3600" step="1" width="4"
            help="The number of seconds that the device will sleep between gravity readings. Recommended value is 900s"
            :disabled="global.disabled" />
        </div>
      </div>
      <div class="row gy-2">
        <div class="col-md-12">
          <hr />
        </div>
        <div class="col-md-12">
          <button type="submit" class="btn btn-primary w-2" :disabled="global.disabled || !global.configChanged">
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"
              :hidden="!global.disabled"></span>
            &nbsp;Save</button>&nbsp;
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { config, global, status } from '@/modules/pinia'
import {
  applyTemplate,
  validateCurrentForm
} from '@/modules/utils'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'

const { sleep_interval } = storeToRefs(config)
const render = ref('')
const sleepLabel = ref('')

watch(sleep_interval, () => {
  createSleepLabel()
})

onMounted(() => {
  createSleepLabel()
})

const createSleepLabel = () => {
  const s = Math.floor(sleep_interval.value / 60) + ' min ' + (sleep_interval.value % 60) + ' sec'
  sleepLabel.value = '(' + s + ')'
}

const pushDisabled = computed(() => {
  return global.disabled || config.use_wifi_direct
})

const renderFormat = () => {
  render.value = applyTemplate(status, config, config.http_post_format_gravity)
}

const renderFormat2 = () => {
  render.value = applyTemplate(status, config, config.http_post2_format_gravity)
}

const save = () => {
  if (!validateCurrentForm()) return

  config.saveAll()
}
</script>
