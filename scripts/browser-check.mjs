import { chromium } from 'playwright'
import assert from 'node:assert/strict'

const baseUrl = process.env.LESSON_URL ?? 'http://127.0.0.1:5173/'
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
})
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['microphone'] })
const page = await context.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))

async function jumpTo(id, precomplete = false) {
  await page.evaluate(async ({ stepId, precomplete }) => {
    const key = 'boston-common-complaints-guided-v1'
    const state = JSON.parse(localStorage.getItem(key))
    if (precomplete) {
      const { countableSteps } = await import('/src/flow.ts')
      state.completed = countableSteps.filter(step => step.id !== 'writing' && step.id !== 'reflection').map(step => step.id)
    }
    localStorage.setItem(key, JSON.stringify({ ...state, currentId: stepId }))
  }, { stepId: id, precomplete })
  await page.reload({ waitUntil: 'domcontentloaded' })
}

try {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  assert.equal(await page.locator('.desktop-sidebar, .slide-link').count(), 0)
  assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'), '0')
  await page.waitForTimeout(300)
  await page.screenshot({ path: '/tmp/boston-guided-intro.png' })

  await page.getByRole('button', { name: 'Begin warm-up' }).click()
  assert.match(await page.locator('.question-prompt').textContent(), /music is very loud/)
  assert.equal(await page.locator('.question-prompt').count(), 1)
  await page.locator('.option-button').first().click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  assert.equal(await page.locator('.option-button.is-correct').count(), 1)
  assert.equal(await page.locator('.option-button.is-incorrect').count(), 1)
  await page.waitForTimeout(300)
  await page.screenshot({ path: '/tmp/boston-guided-question.png' })
  await page.getByRole('button', { name: 'Next question' }).click()
  assert.match(await page.locator('.question-prompt').textContent(), /dog keeps barking/)
  await page.getByRole('button', { name: 'Back' }).click()
  assert.equal(await page.locator('.option-button.is-incorrect').count(), 1)
  assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'), '2')
  await page.reload({ waitUntil: 'domcontentloaded' })
  assert.equal(await page.locator('.option-button.is-incorrect').count(), 1)

  await jumpTo('speaking-0')
  await page.getByRole('button', { name: 'Start recording' }).click()
  await page.getByRole('button', { name: 'Stop recording' }).waitFor({ timeout: 10000 })
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Stop recording' }).click()
  await page.getByRole('button', { name: 'Play my answer' }).waitFor({ timeout: 10000 })
  await page.getByRole('button', { name: 'Play my answer' }).click()
  await page.getByRole('button', { name: 'Pause my answer' }).waitFor()
  await page.waitForTimeout(300)
  await page.screenshot({ path: '/tmp/boston-guided-recording.png' })
  await page.getByRole('button', { name: 'Record again' }).click()
  await page.getByRole('button', { name: 'Type an answer instead' }).click()
  await page.getByLabel('Your answer').fill('The food might be cold.')
  await page.getByRole('button', { name: 'Next question' }).click()
  assert.match(await page.locator('h1').textContent(), /cold or bad food/)

  await page.addInitScript(() => {
    window.YT = { Player: class {
      constructor(_element, options) {
        this.events = options.events
        this.time = 0
        window.__mockPlayer = this
        setTimeout(() => this.events.onReady({ target: this, data: -1 }), 0)
      }
      getCurrentTime() { return this.time }
      getPlayerState() { return 1 }
      seekTo(time) { this.time = time; this.events.onStateChange({ target: this, data: 1 }) }
      playVideo() { this.events.onStateChange({ target: this, data: 1 }) }
      destroy() { window.__mockPlayer = undefined }
    } }
  })
  await jumpTo('pasta-video')
  await page.getByText('Ready to play').waitFor()
  assert.equal(await page.locator('.video-frame iframe').count(), 0)
  await page.getByRole('button', { name: 'Play Restaurant Complaints' }).click()
  assert.equal(await page.getByRole('button', { name: 'Continue to vocabulary' }).count(), 0)
  await page.getByText('Playing', { exact: true }).waitFor()
  await page.evaluate(() => { window.__mockPlayer.time = 9.3 })
  await page.waitForTimeout(180)
  assert.equal(await page.locator('.word-active').count(), 1)
  assert.match(await page.locator('.caption-current').textContent(), /Excuse me/)
  await page.evaluate(() => { window.__mockPlayer.time = 15 })
  await page.waitForTimeout(180)
  assert.equal(await page.locator('.word-active').count(), 1)
  await page.screenshot({ path: '/tmp/boston-guided-video.png' })
  await page.evaluate(() => { window.__mockPlayer.events.onStateChange({ target: window.__mockPlayer, data: 0 }) })
  await page.getByText('Video complete. Continue when you’re ready.').waitFor()
  await page.getByRole('button', { name: 'Continue to vocabulary' }).click()
  assert.equal(await page.locator('.vocabulary-focus h1').textContent(), 'undercooked')
  await page.getByRole('button', { name: 'Next word' }).click()
  assert.equal(await page.locator('.vocabulary-focus h1').textContent(), 'dish')

  await jumpTo('order-video')
  assert.equal(await page.locator('.timed-video.is-portrait').count(), 1)
  await page.getByText('Ready to play').waitFor()
  await page.getByRole('button', { name: 'Play Handling Complaints About Food Orders' }).click()
  await page.getByText('Playing', { exact: true }).waitFor()
  await page.evaluate(() => { window.__mockPlayer.time = 0.45 })
  await page.waitForTimeout(180)
  assert.equal(await page.locator('.word-active').count(), 1)

  await jumpTo('steak-review')
  assert.match(await page.locator('.dialogue-focus').textContent(), /steak medium/)
  await page.getByRole('button', { name: 'Next line' }).click()
  assert.match(await page.locator('.dialogue-focus').textContent(), /apologize/)

  await jumpTo('unjumble-0')
  for (const word of ['This', 'dish', 'is', 'too', 'spicy.']) {
    await page.locator('.word-bank').getByRole('button', { name: word, exact: true }).click()
  }
  await page.getByRole('button', { name: 'Check sentence' }).click()
  assert.match(await page.locator('.answer-feedback').textContent(), /Correct/)
  await jumpTo('sorting-0')
  await page.getByRole('button', { name: /Explaining the problem/ }).click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  assert.match(await page.locator('.answer-feedback').textContent(), /Correct/)
  await jumpTo('practice-five-0')
  await page.getByLabel('Your polite response').fill('Could you please check on our order?')
  await page.getByRole('button', { name: 'Next scenario' }).click()
  assert.match(await page.locator('.scenario-prompt').textContent(), /notice you/)

  await jumpTo('writing', true)
  const draft = 'I visited your restaurant on Saturday with my family. My chicken pasta was cold and the chicken was undercooked. I told the waiter about the problem, and he brought a new dish. I appreciate his help, but I would like a refund for the first meal.'
  await page.getByLabel('Your email').fill(draft)
  assert.equal(await page.getByRole('button', { name: 'Finish writing' }).isEnabled(), true)
  await page.waitForTimeout(300)
  await page.screenshot({ path: '/tmp/boston-guided-writing.png' })
  await page.reload({ waitUntil: 'domcontentloaded' })
  assert.equal(await page.getByLabel('Your email').inputValue(), draft)
  await page.getByRole('button', { name: 'Finish writing' }).click()
  await page.getByLabel('Your reflection').fill('I learnt undercooked.')
  await page.getByRole('button', { name: 'Finish lesson' }).click()
  const progress = page.getByRole('progressbar')
  assert.equal(await progress.getAttribute('aria-valuenow'), await progress.getAttribute('aria-valuemax'))

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
  mobile.on('pageerror', error => errors.push(error.message))
  await mobile.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await mobile.waitForTimeout(300)
  await mobile.screenshot({ path: '/tmp/boston-guided-mobile.png' })
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  await mobile.getByRole('button', { name: 'Begin warm-up' }).click()
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  await mobile.waitForTimeout(300)
  await mobile.screenshot({ path: '/tmp/boston-guided-mobile-question.png' })
  await mobile.getByRole('button', { name: 'Switch to dark mode' }).click()
  await mobile.waitForTimeout(300)
  await mobile.screenshot({ path: '/tmp/boston-guided-mobile-dark.png' })
  assert.deepEqual(errors, [])
  console.log('Browser check passed: progression, feedback, persistence, recording, captions, vocabulary, writing, completion, mobile width.')
} finally {
  await browser.close()
}
