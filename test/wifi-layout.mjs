// Run with: node test/wifi-layout.mjs
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createServer as createHttpServer } from 'node:http'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

// BsMenuBar imports '@/modules/router', which runs createWebHistory() at module load and
// needs a DOM. Stub vue-router for SSR so the module (and its menu items) can load.
const stubVueRouter = {
  name: 'stub-vue-router',
  enforce: 'pre',
  resolveId(id) {
    if (id === 'vue-router') return '\0stub-vue-router'
  },
  load(id) {
    if (id === '\0stub-vue-router') {
      return 'export const createRouter = () => ({ beforeEach: () => {} })\nexport const createWebHistory = () => ({})'
    }
  }
}

const server = await createServer({
  plugins: [stubVueRouter],
  // Keep vue-router inside the Vite pipeline so the stub plugin can intercept it.
  ssr: { noExternal: ['vue-router'] },
  server: { middlewareMode: true, hmr: { server: createHttpServer() } }
})

try {
  // Load through Vite so the check exercises the actual Vue templates and stores.
  const { global, status, config } = await server.ssrLoadModule('/src/modules/pinia.js')
  const { default: Menu } = await server.ssrLoadModule('/src/components/BsMenuBar.vue')
  const { default: Home } = await server.ssrLoadModule('/src/views/HomeView.vue')
  const { default: Tools } = await server.ssrLoadModule('/src/views/WifiToolsView.vue')
  const { default: Hardware } = await server.ssrLoadModule('/src/views/DeviceHardwareView.vue')
  const { default: Wifi } = await server.ssrLoadModule('/src/views/DeviceWifiView.vue')
  const fields = {}
  for (const name of ['BsInputBase', 'BsInputSwitch', 'BsInputNumber', 'BsInputText', 'BsInputRadio', 'BsSelect']) {
    fields[name] = (await server.ssrLoadModule(`/src/components/${name}.vue`)).default
  }
  const render = async (component, path = '/') => {
    const app = createSSRApp(component)
    const route = { path }
    app.config.globalProperties.$route = route
    app.config.globalProperties.$router = { currentRoute: { value: route } }
    app.component('RouterLink', { props: ['to'], setup: (props, { slots }) => () => h('a', { href: props.to }, slots.default?.()) })
    for (const name of ['BsCard', 'BsCardSimple', 'BsMessage', 'BsModalConfirm']) {
      app.component(name, { setup: (_, { slots }) => () => h('div', { 'data-component': name }, slots.default?.()) })
    }
    for (const [name, component] of Object.entries(fields)) app.component(name, component)
    return renderToString(app)
  }
  status.wifi_setup = true
  global.platform = 'ESP32C3'
  let html = await render(Menu)
  // WIFI 模式菜单不展示导航链接，入口全部在首页卡片
  assert.ok(!html.includes('href="/other/about"'))
  assert.ok(!html.includes('href="/other/system-tools"'))
  assert.ok(!html.includes('href="/other/firmware"'))
  html = await render(Tools)
  assert.ok(html.includes('href="/other/firmware"'))
  assert.ok(html.includes('href="/other/about"'))
  assert.ok(html.includes('Restore defaults'))
  assert.ok(html.includes('data-component="BsModalConfirm"'))
  global.platform = 'ESP8266'
  status.battery = 0
  status.wifi_ssid = ''
  html = await render(Home)
  assert.ok(html.includes('data-component="BsCardSimple"'))
  assert.ok(!html.includes('Device overview'))
  assert.ok(!html.includes('Restore default settings'))
  assert.ok(html.includes('href="/other/system-tools"'))
  assert.ok(html.includes('href="/other/firmware"'))
  assert.ok(html.includes('href="/device/battery"'))
  assert.ok(!html.includes('href="/push/bluetooth"'))
  assert.ok(html.includes('Copy ID'))
  assert.ok(!html.includes('data-component="BsModalConfirm"'))
  for (const forced of [false, true]) {
    status.wifi_setup = forced
    global.forceConfigMode = forced
    html = await render(Home)
    assert.ok(html.includes('data-component="BsCard"'))
    assert.ok(!html.includes('data-component="BsCardSimple"'))
    assert.ok(html.includes('Force config mode'))
  }
  config.storage_sleep = true
  config.storage_hibernate_days = 30
  for (const [wifiSetup, forced, visible] of [[true, false, false], [false, false, true], [true, true, true]]) {
    status.wifi_setup = wifiSetup
    global.forceConfigMode = forced
    html = await render(Hardware)
    assert.equal(html.includes('Automatic long sleep'), visible)
    assert.equal(html.includes('Enter long sleep after'), visible)
    assert.ok(!html.includes('border rounded-3'))
    html = await render(Wifi)
    assert.ok(!html.includes('Automatic long sleep'))
    assert.ok(!html.includes('Enter long sleep after'))
  }
  status.wifi_setup = false
  global.forceConfigMode = false
  config.storage_hibernate_days = 0
  html = await render(Hardware)
  assert.ok(html.includes('Automatic long sleep'))
  assert.ok(!html.includes('Enter long sleep after'))
  console.log('PASS: storage controls only in config mode, inline layout, disabled long sleep')
  console.log('PASS: WIFI card layout without nav links, system tools card, ESP8266, zero battery, config and forced config layout')
} finally {
  await server.close()
}
