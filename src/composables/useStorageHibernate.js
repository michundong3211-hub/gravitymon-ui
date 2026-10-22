import { computed, ref } from 'vue'
import { config, global } from '@/modules/pinia'

export function useStorageHibernate() {
  const hibernateSupported = computed(() => config.storage_hibernate_days !== null)
  // Editing the number must not change the switch or remove its validation.
  const enabled = ref(hibernateSupported.value && config.storage_hibernate_days !== 0)
  const hibernateEnabled = computed({
    get: () => hibernateSupported.value && enabled.value,
    set: (value) => {
      enabled.value = value
      config.storage_hibernate_days = value ? 30 : 0
    }
  })

  const validateStorageHibernate = () => {
    if (!hibernateEnabled.value) return true
    const days = config.storage_hibernate_days
    if (Number.isInteger(days) && days >= 1 && days <= 365) return true

    global.clearMessages()
    global.messageError = 'Enter a whole number of days from 1 to 365.'
    return false
  }

  return { hibernateSupported, hibernateEnabled, validateStorageHibernate }
}
