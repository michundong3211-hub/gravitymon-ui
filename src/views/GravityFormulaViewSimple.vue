<template>
  <div class="container">
    <p></p>
    <p class="h3">Gravity Formula</p>
    <hr />

    <BsMessage v-if="config.gravity_formula === ''" dismissable="true" message="" alert="warning">
      You need to enter a formula in order to report gravity
    </BsMessage>

    <form @submit.prevent="save" class="needs-validation" novalidate>
      <div class="col-md-10">
        <BsInputText
          v-model="config.gravity_formula"
          maxlength="200"
          label="Gravity formula"
          help="Formula used to convert angle to gravity. If created outside CuckooTilt the formula needs to be created for Specific Gravity!"
          :badge="badge.gravityFormulaBadge()"
          :disabled="global.disabled"
        >
        </BsInputText>
      </div>

      <div class="col-md-12 mt-2">
        <button
          type="submit"
          class="btn btn-primary"
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
        <button
          type="button"
          class="btn btn-secondary mx-2"
          :disabled="global.disabled"
          @click="useDefaultFormula"
        >
          Use default formula
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { validateCurrentForm } from '@/modules/utils'
import { config, global } from '@/modules/pinia'
import * as badge from '@/modules/badge'

const save = async () => {
  if (!validateCurrentForm()) {
    return
  }

  await config.saveAll()
}

const useDefaultFormula = () => {
  config.gravity_formula = '0.979742642057399+0.0005883931405567239*tilt+0.000008876047085889598*tilt*tilt'
}
</script>
