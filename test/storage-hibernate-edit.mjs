// Run with: node test/storage-hibernate-edit.mjs
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createServer as createHttpServer } from 'node:http'
import { createServer } from 'vite'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'

const server = await createServer({
  plugins: [{
    name: 'storage-test-stubs',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'vue-router') return '\0stub-vue-router'
    },
    load(id) {
      if (id === '\0stub-vue-router') {
        return 'export const createRouter = () => ({ beforeEach: () => {} }); export const createWebHistory = () => ({})'
      }
      // Allow proving the same interaction test fails before the fix, without checkout.
      if (process.env.STORAGE_TEST_REVISION && /\/src\/views\/(WifiToolsView|DeviceHardwareView)\.vue$/.test(id)) {
        const file = id.slice(id.lastIndexOf('/src/') + 1)
        return execFileSync('git', ['show', `${process.env.STORAGE_TEST_REVISION}:${file}`], { encoding: 'utf8' })
      }
    }
  }],
  ssr: { noExternal: ['vue-router'] },
  server: { middlewareMode: true, hmr: { server: createHttpServer() } }
})

const originalDocument = globalThis.document
// Ignore native browser validation so the page's own save guard must reject bad days.
globalThis.document = {
  querySelectorAll: () => [{ checkValidity: () => true, classList: { add() {} } }]
}

try {
  const { global, config, status } = await server.ssrLoadModule('/src/modules/pinia.js')
  const fields = {}
  for (const name of ['BsInputBase', 'BsInputSwitch', 'BsInputNumber', 'BsInputRadio']) {
    fields[name] = (await server.ssrLoadModule(`/src/components/${name}.vue`)).default
  }
  const saved = []
  config.saveAll = () => { saved.push(config.storage_hibernate_days) }

  for (const page of ['WifiToolsView', 'DeviceHardwareView']) {
    const { default: component } = await server.ssrLoadModule(`/src/views/${page}.vue`)
    config.storage_sleep = true
    config.storage_hibernate_days = 30
    status.wifi_setup = page === 'WifiToolsView'
    global.forceConfigMode = false
    global.configChanged = true
    global.disabled = false
    const controls = new Map()
    let setupState
    // Reuse one page setup across SSR renders, preserving its real local refs.
    const session = {
      ...component,
      setup(props, context) {
        setupState ??= component.setup(props, context)
        return setupState
      }
    }
    const render = async () => {
      controls.clear()
      const app = createSSRApp(session)
      app.config.warnHandler = () => {}
      app.component('RouterLink', { props: ['to'], setup: (props, { slots }) => () => h('a', { href: props.to }, slots.default?.()) })
      for (const name of ['BsMessage', 'BsModalConfirm']) {
        app.component(name, { setup: (_, { slots }) => () => h('div', slots.default?.()) })
      }
      for (const [name, field] of Object.entries(fields)) {
        app.component(name, {
          ...field,
          setup(props, context) {
            if (name === 'BsInputSwitch' || name === 'BsInputNumber') {
              controls.set(props.label, {
                value: () => props.modelValue,
                disabled: () => props.disabled,
                set: (value) => context.emit('update:modelValue', value)
              })
            }
            return field.setup(props, context)
          }
        })
      }
      return renderToString(app)
    }
    await render()
    assert.equal(controls.get('Automatic long sleep').value(), true)
    assert.equal(controls.get('Enter long sleep after').value(), 30)

    for (const invalid of ['', 0, -1, 1.5, 366]) {
      controls.get('Enter long sleep after').set(invalid)
      await nextTick()
      const html = await render()
      assert.equal(controls.get('Automatic long sleep').value(), true, `${page}: editing ${JSON.stringify(invalid)} must keep the switch on`)
      assert.ok(controls.has('Enter long sleep after'), `${page}: invalid input must stay mounted`)
      assert.ok(html.includes('required'))
      if (invalid === '') {
        setupState = undefined
        await render()
        assert.equal(controls.get('Automatic long sleep').value(), true, `${page}: remounting an unfinished edit must keep the switch on`)
        assert.ok(controls.has('Enter long sleep after'))
      }
      const beforeSave = saved.length
      await setupState.save()
      assert.equal(saved.length, beforeSave, `${page}: invalid days must not be saved`)
    }

    for (const valid of [1, 365]) {
      controls.get('Enter long sleep after').set(valid)
      await nextTick()
      await render()
      const beforeSave = saved.length
      await setupState.save()
      assert.equal(saved.length, beforeSave + 1)
      assert.equal(saved.at(-1), valid)
    }

    controls.get('Automatic long sleep').set(false)
    await nextTick()
    await render()
    assert.equal(controls.get('Automatic long sleep').value(), false)
    assert.ok(!controls.has('Enter long sleep after'))
    await setupState.save()
    assert.equal(saved.at(-1), 0)

    controls.get('Automatic long sleep').set(true)
    await nextTick()
    await render()
    assert.equal(controls.get('Enter long sleep after').value(), 30)
    await setupState.save()
    assert.equal(saved.at(-1), 30)

    config.storage_hibernate_days = null
    await nextTick()
    await render()
    assert.equal(controls.get('Automatic long sleep').disabled(), true)
    assert.ok(!controls.has('Enter long sleep after'))
    console.log(`PASS: ${page} actual v-model edits, invalid/valid saves, explicit switch and unsupported firmware`)
  }
} finally {
  globalThis.document = originalDocument
  await server.close()
}
