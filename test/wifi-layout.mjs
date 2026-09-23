// Run with: node test/wifi-layout.mjs
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createServer as createHttpServer } from 'node:http'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

const server = await createServer({ server: { middlewareMode: true, hmr: { server: createHttpServer() } } })
try {
  // Load through Vite so the check exercises the actual Vue templates and stores.
  const { global, status } = await server.ssrLoadModule('/src/modules/pinia.js')
  const { default: Menu } = await server.ssrLoadModule('/src/components/WifiMenuBar.vue')
  const { default: Home } = await server.ssrLoadModule('/src/views/HomeView.vue')
  const { default: Tools } = await server.ssrLoadModule('/src/views/WifiToolsView.vue')
  const render = async (component, path = '/') => {
    const app = createSSRApp(component)
    app.config.globalProperties.$route = { path }
    app.component('RouterLink', { props: ['to'], setup: (props, { slots }) => () => h('a', { href: props.to }, slots.default?.()) })
    for (const name of ['BsCard', 'BsMessage', 'BsModalConfirm']) {
      app.component(name, { setup: (_, { slots }) => () => h('div', { 'data-component': name }, slots.default?.()) })
    }
    return renderToString(app)
  }
  status.wifi_setup = true
  global.platform = 'ESP32C3'
  let html = await render(Menu)
  for (const path of ['/device/wifi', '/push/http-post', '/push/bluetooth', '/gravity/formula2', '/device/battery', '/other/system-tools']) {
    assert.ok(html.includes(`href="${path}"`), path)
  }
  assert.ok(!html.includes('type="checkbox"'))
  assert.ok(!html.includes('href="/other/firmware"'))
  assert.ok(!html.includes('href="/other/about"'))
  for (const path of ['/other/firmware', '/other/about']) {
    assert.match(await render(Menu, path), /href="\/other\/system-tools" class="[^"]*wifi-nav-active/)
  }
  html = await render(Tools)
  assert.ok(html.includes('href="/other/firmware"'))
  assert.ok(html.includes('href="/other/about"'))
  assert.ok(html.includes('Restore defaults'))
  assert.ok(html.includes('data-component="BsModalConfirm"'))
  global.platform = 'ESP8266'
  assert.ok(!(await render(Menu)).includes('/push/bluetooth'))
  status.battery = 0
  status.wifi_ssid = ''
  html = await render(Home)
  assert.ok(html.includes('Device overview'))
  assert.ok(!html.includes('Restore defaults'))
  assert.ok(html.includes('Not connected'))
  assert.ok(html.includes('>0 <span'))
  assert.ok(!html.includes('data-component="BsCard"'))
  for (const forced of [false, true]) {
    status.wifi_setup = forced
    global.forceConfigMode = forced
    html = await render(Home)
    assert.ok(html.includes('data-component="BsCard"'))
    assert.ok(!html.includes('Device overview'))
  }
  console.log('PASS: WIFI navigation, ESP8266, zero battery, config and forced config layout')
} finally {
  await server.close()
}
