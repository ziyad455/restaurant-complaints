type PlayerEvent = { target: YouTubePlayer; data: number }

export interface YouTubePlayer {
  getCurrentTime(): number
  getPlayerState(): number
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  setVolume(volume: number): void
  getVolume(): number
  mute(): void
  unMute(): void
  isMuted(): boolean
  destroy(): void
}

interface YouTubeApi {
  Player: new (element: HTMLElement, options: {
    videoId: string
    width: string
    height: string
    playerVars: { controls: number; playsinline: number; rel: number; origin: string }
    events: { onReady: (event: PlayerEvent) => void; onStateChange: (event: PlayerEvent) => void; onAutoplayBlocked: () => void; onError: () => void }
  }) => YouTubePlayer
}

declare global {
  interface Window {
    YT?: YouTubeApi
    onYouTubeIframeAPIReady?: () => void
  }
}

let loading: Promise<YouTubeApi> | undefined

export function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (loading) return loading
  loading = new Promise<YouTubeApi>((resolve, reject) => {
    const script = document.createElement('script')
    let settled = false
    const fail = (error: Error) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      script.remove()
      if (window.onYouTubeIframeAPIReady === ready) window.onYouTubeIframeAPIReady = undefined
      loading = undefined
      reject(error)
    }
    const ready = () => {
      if (settled) return
      window.clearTimeout(timeout)
      if (window.YT?.Player) { settled = true; resolve(window.YT) }
      else fail(new Error('The video player is unavailable.'))
    }
    const timeout = window.setTimeout(() => fail(new Error('The video player did not load.')), 12000)
    window.onYouTubeIframeAPIReady = ready
    script.onerror = () => fail(new Error('The video player could not be loaded.'))
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    document.body.append(script)
  })
  return loading
}
