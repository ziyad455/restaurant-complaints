import { chromium } from 'playwright'
import assert from 'node:assert/strict'

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
})
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
const errors = []
page.on('pageerror', error => errors.push(error.message))
await page.addInitScript(() => {
  window.__players = []
  window.YT = { Player: class {
    constructor(_element, options) {
      this.events = options.events
      this.time = 0
      this.videoId = options.videoId
      this.playCalls = 0
      this.pauseCalls = 0
      this.state = -1
      this.volume = 80
      this.muted = false
      this.destroyed = false
      window.__players.push(this)
      setTimeout(() => this.events.onReady({ target: this }), 120)
    }
    getCurrentTime() { return this.time }
    getPlayerState() { return this.state }
    seekTo(seconds) { this.time = seconds; if (this.state !== 2) { this.state = 1; this.events.onStateChange({ target: this, data: 1 }) } }
    playVideo() { this.playCalls++; this.state = 1; this.events.onStateChange({ target: this, data: 1 }) }
    pauseVideo() { this.pauseCalls++; this.state = 2; this.events.onStateChange({ target: this, data: 2 }) }
    setVolume(value) { this.volume = value }
    getVolume() { return this.volume }
    mute() { this.muted = true }
    unMute() { this.muted = false }
    isMuted() { return this.muted }
    destroy() { this.destroyed = true }
  } }
})

async function openStep(id) {
  await page.evaluate(stepId => {
    localStorage.setItem('boston-common-complaints-guided-v1',
      JSON.stringify({ currentId: stepId, answers: {}, submitted: [], completed: [], skipped: [] }))
  }, id)
  await page.reload({ waitUntil: 'domcontentloaded' })
}

try {
  await page.goto(process.env.LESSON_URL ?? 'http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' })
  for (const [stepId, title, videoId, firstWordTime] of [
    ['pasta-video', 'Restaurant Complaints', 'xrjELw1ZKe8', 9.3],
    ['pasta-rewatch', 'Restaurant Complaints', 'xrjELw1ZKe8', 9.3],
    ['order-video', 'Handling Complaints About Food Orders', 'sHpARrjhGj4', 0.45],
  ]) {
    await openStep(stepId)
    await page.waitForFunction(() => window.__players.length === 1)
    assert.equal(await page.evaluate(() => window.__players[0].videoId), videoId)
    if (stepId === 'pasta-rewatch') {
      await page.locator('.video-playback-status').getByText('Ready to play').waitFor()
      await page.getByRole('button', { name: /Go to next line/ }).click()
    } else {
      await page.getByRole('button', { name: `Play ${title}` }).click()
    }
    await page.locator('.video-playback-status').getByText('Playing').waitFor()
    assert.equal(await page.locator('.video-poster').count(), 0)
    assert.equal(await page.evaluate(() => window.__players[0].playCalls), 1)
    assert.equal(await page.evaluate(() => window.__players.length), 1)

    await page.evaluate(time => { window.__players[0].time = time }, firstWordTime)
    await page.locator('.word-active').waitFor()
    await page.waitForTimeout(150)
    assert.equal(await page.locator('.word-active').count(), 1)
    const pausedWord = await page.locator('.word-active').textContent()
    await page.getByRole('button', { name: 'Pause video' }).click()
    await page.locator('.video-playback-status').getByText('Paused').waitFor()
    assert.equal(await page.evaluate(() => window.__players[0].pauseCalls), 1)
    await page.waitForTimeout(250)
    assert.equal(await page.locator('.word-active').textContent(), pausedWord)
    await page.getByRole('button', { name: 'Play video', exact: true }).click()
    await page.locator('.video-playback-status').getByText('Playing').waitFor()
    await page.evaluate(() => window.__players[0].pauseVideo())
    await page.getByRole('button', { name: 'Play video', exact: true }).waitFor()
    await page.evaluate(() => window.__players[0].playVideo())
    await page.getByRole('button', { name: 'Pause video' }).waitFor()

    await page.getByRole('slider', { name: 'Video volume' }).press('Home')
    await page.getByRole('slider', { name: 'Video volume' }).press('ArrowRight')
    assert.equal(await page.evaluate(() => window.__players[0].volume), 1)
    await page.getByRole('button', { name: 'Mute video' }).click()
    assert.equal(await page.evaluate(() => window.__players[0].isMuted()), true)
    await page.getByRole('button', { name: 'Unmute video' }).click()
    assert.equal(await page.evaluate(() => window.__players[0].volume), 1)
    await page.waitForTimeout(900)
    await page.evaluate(() => { window.__players[0].volume = 55 })
    await page.getByText('55%', { exact: true }).waitFor()

    await page.getByRole('button', { name: 'Replay video from beginning' }).click()
    assert.equal(await page.evaluate(() => window.__players[0].time), 0)
    assert.equal(await page.evaluate(() => window.__players.length), 1)
    await page.evaluate(() => window.__players[0].seekTo(window.__players[0].time + 1))
    await page.locator('.video-playback-status').getByText('Playing').waitFor()

    await page.evaluate(() => window.__players[0].events.onStateChange({ target: window.__players[0], data: 0 }))
    await page.getByText('Video complete. Continue when you’re ready.').waitFor()
    await page.locator('.footer-action').click()
    await page.waitForFunction(() => window.__players[0].destroyed)
    assert.equal(await page.evaluate(() => window.__players[0].destroyed), true)
  }
  assert.deepEqual(errors, [])
  console.log('Video controls check passed for both videos and Watch Again: play, pause, native state changes, keyboard volume, mute, replay, captions, completion, and cleanup.')
} finally {
  await browser.close()
}
