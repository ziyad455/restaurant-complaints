import { chromium } from 'playwright'
import assert from 'node:assert/strict'

const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
const errors = []
page.on('pageerror', error => errors.push(error.message))
await page.addInitScript(() => {
  window.YT = { Player: class {
    constructor(_element, options) {
      this.events = options.events
      window.__mockPlayer = this
      setTimeout(() => this.events.onReady({ target: this, data: -1 }), 0)
    }
    getCurrentTime() { return 0 }
    getPlayerState() { return 0 }
    seekTo() {}
    playVideo() {}
    destroy() {}
  } }
})

try {
  await page.goto(process.env.LESSON_URL ?? 'http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' })
  const steps = await page.evaluate(async () => (await import('/src/flow.ts')).steps)
  let visited = 0

  for (const step of steps) {
    const currentId = await page.evaluate(() => JSON.parse(localStorage.getItem('boston-common-complaints-guided-v1')).currentId)
    assert.equal(currentId, step.id)
    if (step.kind === 'done') break

    switch (step.kind) {
      case 'intro':
      case 'speaking-intro':
      case 'section-complete':
      case 'activity-complete':
        await page.locator('.footer-action').click()
        break
      case 'choice':
      case 'match':
      case 'sort':
        await page.locator('.option-button').nth(step.correct).click()
        await page.getByRole('button', { name: 'Check answer' }).click()
        assert.match(await page.locator('.answer-feedback').textContent(), /Correct/)
        await page.locator('.footer-action').click()
        break
      case 'fill':
        await page.getByLabel('Missing word').fill(step.answer)
        await page.getByRole('button', { name: 'Check answer' }).click()
        assert.match(await page.locator('.answer-feedback').textContent(), /Correct/)
        await page.locator('.footer-action').click()
        break
      case 'recording':
        await page.getByRole('button', { name: 'Skip recording' }).click()
        await page.getByRole('button', { name: 'Next question' }).click()
        break
      case 'video':
        await page.getByText('Ready to play').waitFor()
        await page.getByRole('button', { name: `Play ${step.video === 'pasta' ? 'Restaurant Complaints' : 'Handling Complaints About Food Orders'}` }).click()
        await page.evaluate(() => window.__mockPlayer.events.onStateChange({ target: window.__mockPlayer, data: 0 }))
        await page.getByRole('button', { name: step.action }).click()
        break
      case 'vocabulary':
      case 'language':
        await page.locator('.footer-action').click()
        break
      case 'dialogue':
        for (let index = 1; index < step.dialogue.length; index++) {
          await page.getByRole('button', { name: 'Next line' }).click()
        }
        await page.locator('.footer-action').click()
        break
      case 'unjumble':
        for (const word of step.expression.split(' ')) {
          await page.locator('.word-bank').getByRole('button', { name: word, exact: true }).click()
        }
        await page.getByRole('button', { name: 'Check sentence' }).click()
        assert.match(await page.locator('.answer-feedback').textContent(), /Correct/)
        await page.locator('.footer-action').click()
        break
      case 'practice-five':
        await page.getByRole('button', { name: 'Skip this prompt' }).click()
        await page.locator('.footer-action').click()
        break
      case 'writing':
        await page.getByLabel('Your email').fill('Dear Manager, I visited your restaurant last weekend. My pasta arrived cold and the chicken was undercooked. I told the waiter, who brought a new dish and apologized. I appreciate the help, but I would like a refund for the original meal. Thank you.')
        await page.getByRole('button', { name: 'Finish writing' }).click()
        break
      case 'reflection':
        await page.getByLabel('Your reflection').fill('I learned undercooked.')
        await page.getByRole('button', { name: 'Finish lesson' }).click()
        break
      default:
        throw new Error(`No browser path for step kind: ${step.kind}`)
    }
    visited++
  }

  assert.equal(visited, steps.length - 1)
  const progress = page.getByRole('progressbar')
  assert.equal(await progress.getAttribute('aria-valuenow'), await progress.getAttribute('aria-valuemax'))
  assert.deepEqual(errors, [])
  console.log(`Full lesson flow passed: ${visited} completed steps across revision and four sections.`)
} finally {
  await browser.close()
}
