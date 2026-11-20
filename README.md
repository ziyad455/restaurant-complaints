# Boston English Center: Restaurant Complaints

A guided A2 English lesson built with React, TypeScript, Vite, Tailwind CSS, and Motion. The original 17 Canva slides are reorganized into a standalone revision stage and four sections with one activity at a time.

## Run locally

```sh
npm install
npm run dev
```

Open the address printed by Vite. Microphone recording requires a secure context, such as `localhost` or HTTPS. Recordings stay in memory for the current visit; answers and progress are saved in this browser's local storage.

## Check the app

```sh
npm run build
npm test
```

To run the browser checks, keep the development server running and execute `node scripts/browser-check.mjs` and `node scripts/full-flow-check.mjs`. Set `LESSON_URL` if Vite uses another port. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` if Playwright's bundled Chromium is unavailable.

For a focused video check, run `node scripts/video-startup-check.mjs`. It checks both videos, Watch Again, caption timing, pause, seek, completion, and player cleanup with a simulated YouTube player.

The focused browser check uses a fake microphone and a simulated YouTube player to verify the lesson UI and word highlighting. The full-flow check clicks through every learning step. These checks do not verify playback from YouTube's live service.

## Lesson sources and media

- Educational content: [original Canva presentation](https://www.canva.com/design/DAHJnuLd03I/5IGEAb89XLZi_PgcegHtCA/edit)
- Brand logo: [Boston English Center](https://bostonenglishcenter.com/)
- Videos: [Restaurant Complaints](https://youtu.be/xrjELw1ZKe8) and [Wrong Food Order](https://youtu.be/sHpARrjhGj4)

The synchronized dialogue uses word start times aligned to the videos' English caption tracks. The highlight is driven by the YouTube IFrame Player API's playback time, including seeking and replaying. The full dialogue is also available in a disclosure below each video.

The separate undercooked steak dialogue has no source audio in the presentation. It is a reading exercise, and its quiz follows that dialogue. Practice 5 presents the readable Canva scenarios as open response practice, with a polite example for each situation. No unverified answer choices were added.
