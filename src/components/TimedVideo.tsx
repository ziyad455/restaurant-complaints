import { useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink, Play } from 'lucide-react'
import { orderDialogue, pastaDialogue, type DialogueLine } from '../lesson'
import { orderWordStarts, pastaWordStarts } from '../videoTimings'
import { loadYouTubeApi, type YouTubePlayer } from '../youtube'
import { VideoControls } from './VideoControls'

type VideoKind = 'pasta' | 'order'
const videos = {
  pasta: { id: 'xrjELw1ZKe8', title: 'Restaurant Complaints', dialogue: pastaDialogue, starts: pastaWordStarts, portrait: false },
  order: { id: 'sHpARrjhGj4', title: 'Handling Complaints About Food Orders', dialogue: orderDialogue, starts: orderWordStarts, portrait: true },
} as const

export type TimedLine = DialogueLine & { start: number; end: number; words: { text: string; start: number; index: number }[] }

export function buildTimedLines(dialogue: DialogueLine[], starts: readonly number[]): TimedLine[] {
  const wordCount = dialogue.reduce((total, line) => total + line.text.split(/\s+/).length, 0)
  if (wordCount !== starts.length) throw new Error('Transcript words and timestamp data do not align.')
  let offset = 0
  return dialogue.map((line, lineIndex) => {
    const words = line.text.split(/\s+/).map((text, index) => ({ text, start: starts[offset + index], index: offset + index }))
    offset += words.length
    return { ...line, start: words[0].start, end: lineIndex === dialogue.length - 1 ? starts[starts.length - 1] + 1.2 : starts[offset], words }
  })
}

function findActiveWord(starts: readonly number[], time: number): number {
  if (time < starts[0] || time > starts[starts.length - 1] + 1.2) return -1
  let low = 0, high = starts.length - 1
  while (low <= high) {
    const middle = (low + high) >>> 1
    if (starts[middle] <= time) low = middle + 1
    else high = middle - 1
  }
  return high
}

export function TimedVideo({ video, onEnded, onUnavailable }: { video: VideoKind; onEnded: () => void; onUnavailable: () => void }) {
  const source = videos[video]
  const lines = useMemo(() => buildTimedLines(source.dialogue, source.starts), [source])
  const mountRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const onEndedRef = useRef(onEnded)
  const onUnavailableRef = useRef(onUnavailable)
  const playRequestedRef = useRef(false)
  const volumeCheckRef = useRef<number | undefined>(undefined)
  const [playRequested, setPlayRequested] = useState(false)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [activeWord, setActiveWord] = useState(-1)
  const [playerState, setPlayerState] = useState(-1)
  const [ended, setEnded] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const [volume, setVolume] = useState(100)
  const [muted, setMuted] = useState(false)
  const [volumeSupported, setVolumeSupported] = useState(true)

  useEffect(() => { onEndedRef.current = onEnded }, [onEnded])
  useEffect(() => { onUnavailableRef.current = onUnavailable }, [onUnavailable])

  useEffect(() => {
    let cancelled = false
    let interval: number | undefined
    let volumeInterval: number | undefined
    function syncVolume(player: YouTubePlayer) {
      if (typeof player.getVolume !== 'function' || typeof player.setVolume !== 'function' || typeof player.isMuted !== 'function' || typeof player.mute !== 'function' || typeof player.unMute !== 'function') {
        setVolumeSupported(false)
        return
      }
      if (volumeCheckRef.current === undefined) {
        const actualVolume = player.getVolume()
        if (Number.isFinite(actualVolume)) setVolume(Math.max(0, Math.min(100, Math.round(actualVolume))))
      }
      setMuted(player.isMuted())
    }
    loadYouTubeApi().then(api => {
      if (cancelled || !mountRef.current) return
      playerRef.current = new api.Player(mountRef.current, {
        videoId: source.id,
        width: '100%', height: '100%',
        playerVars: { controls: 1, playsinline: 1, rel: 0, origin: window.location.origin },
        events: {
          onReady: event => {
            if (cancelled) return
            setStatus('ready')
            interval = window.setInterval(() => {
              const player = playerRef.current
              if (!player || typeof player.getCurrentTime !== 'function') return
              const word = findActiveWord(source.starts, player.getCurrentTime())
              setActiveWord(previous => previous === word ? previous : word)
            }, 100)
            syncVolume(event.target)
            volumeInterval = window.setInterval(() => {
              if (playerRef.current) syncVolume(playerRef.current)
            }, 500)
            if (playRequestedRef.current) event.target.playVideo()
          },
          onStateChange: event => {
            if (cancelled) return
            setPlayerState(event.data)
            if (event.data === 0) { setEnded(true); onEndedRef.current() }
            else if (event.data === 1) { setEnded(false); setAutoplayBlocked(false) }
            if (typeof event.target.getCurrentTime === 'function') {
              setActiveWord(findActiveWord(source.starts, event.target.getCurrentTime()))
            }
            syncVolume(event.target)
          },
          onAutoplayBlocked: () => { if (!cancelled) setAutoplayBlocked(true) },
          onError: () => { if (!cancelled) { setStatus('error'); setMessage('This video cannot be played here. Open it on YouTube instead.'); onUnavailableRef.current() } },
        },
      })
    }).catch(error => { if (!cancelled) { setStatus('error'); setMessage(error instanceof Error ? error.message : 'The video player is unavailable.'); onUnavailableRef.current() } })
    return () => {
      cancelled = true
      if (interval) window.clearInterval(interval)
      if (volumeInterval) window.clearInterval(volumeInterval)
      if (volumeCheckRef.current !== undefined) window.clearTimeout(volumeCheckRef.current)
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [source])

  const activeLineIndex = lines.findIndex(line => activeWord >= line.words[0].index && activeWord <= line.words[line.words.length - 1].index)
  const displayIndex = ended ? lines.length - 1 : activeLineIndex < 0 ? 0 : activeLineIndex
  const current = lines[displayIndex]
  function seekTo(line: TimedLine) {
    playRequestedRef.current = true
    setPlayRequested(true)
    playerRef.current?.seekTo(line.start, true)
    playerRef.current?.playVideo()
  }
  function requestPlay() {
    playRequestedRef.current = true
    setPlayRequested(true)
    if (status === 'ready') playerRef.current?.playVideo()
  }
  function pause() { playerRef.current?.pauseVideo() }
  function replay() {
    const player = playerRef.current
    if (!player) return
    playRequestedRef.current = true
    setPlayRequested(true)
    setEnded(false)
    player.seekTo(0, true)
    player.playVideo()
    setActiveWord(findActiveWord(source.starts, player.getCurrentTime()))
  }
  function changeVolume(value: number) {
    const player = playerRef.current
    if (!player || typeof player.setVolume !== 'function') return
    const next = Math.max(0, Math.min(100, Math.round(value)))
    setVolume(next)
    player.setVolume(next)
    if (volumeCheckRef.current !== undefined) window.clearTimeout(volumeCheckRef.current)
    volumeCheckRef.current = window.setTimeout(() => {
      volumeCheckRef.current = undefined
      if (playerRef.current !== player || typeof player.getVolume !== 'function') return
      const actual = player.getVolume()
      if (Number.isFinite(actual) && Math.abs(actual - next) > 1) setVolumeSupported(false)
      else if (Number.isFinite(actual)) setVolume(Math.round(actual))
    }, 800)
  }
  function toggleMute() {
    const player = playerRef.current
    if (!player || typeof player.isMuted !== 'function') return
    if (player.isMuted()) player.unMute()
    else player.mute()
    setMuted(player.isMuted())
  }

  return <div className={`timed-video ${source.portrait ? 'is-portrait' : ''}`}>
    <div className="video-layout">
      <div className="video-player-column">
        <div className="video-frame">
          <div className="youtube-mount" aria-label={`${source.title} YouTube player`}><div ref={mountRef} /></div>
          {status !== 'error' && (!playRequested || status === 'loading') && <button className="video-poster" onClick={requestPlay} disabled={playRequested} aria-label={`Play ${source.title}`}>
            <img src={`https://i.ytimg.com/vi/${source.id}/hqdefault.jpg`} alt="" width="480" height="360" loading="lazy" />
            <span className="poster-play"><Play size={25} fill="currentColor" /></span><span className="poster-label">{playRequested ? 'Starting video…' : 'Play video'}</span>
          </button>}
          {status === 'error' && <div className="video-error" role="alert"><p>{message}</p><a href={`https://www.youtube.com/watch?v=${source.id}`} target="_blank" rel="noreferrer">Open video on YouTube <ExternalLink size={15} /></a></div>}
        </div>
        <VideoControls status={status} playerState={playerState} playRequested={playRequested} autoplayBlocked={autoplayBlocked}
          volume={volume} muted={muted} volumeSupported={volumeSupported} onPlay={requestPlay} onPause={pause}
          onReplay={replay} onVolumeChange={changeVolume} onToggleMute={toggleMute} />
      </div>
      <div className="caption-panel" aria-label="Synchronized transcript">
        <div className="caption-heading"><span>Follow the conversation</span><small>{status === 'error' ? 'Transcript available below' : status === 'loading' ? 'Preparing player' : autoplayBlocked ? 'Press play in the YouTube player' : playerState === 1 ? 'Playing' : playerState === 2 ? 'Paused' : playerState === 3 ? 'Buffering video' : playerState === 0 ? 'Replay video' : playRequested ? 'Starting playback' : 'Ready to play'}</small></div>
        {activeLineIndex > 0 && <button className="caption-neighbour" onClick={() => seekTo(lines[activeLineIndex - 1])} disabled={status !== 'ready'} aria-label={`Replay previous line: ${lines[activeLineIndex - 1].text}`}><span>{lines[activeLineIndex - 1].speaker}</span>{lines[activeLineIndex - 1].text}</button>}
        <div className="caption-current"><span className="caption-speaker">{current.speaker}</span><p aria-label={current.text}>{current.words.map(word => <span key={word.index} aria-hidden="true" className={word.index === activeWord ? 'word-active' : word.index < activeWord ? 'word-past' : ''}>{word.text} </span>)}</p></div>
        {displayIndex < lines.length - 1 && <button className="caption-neighbour" onClick={() => seekTo(lines[displayIndex + 1])} disabled={status !== 'ready'} aria-label={`Go to next line: ${lines[displayIndex + 1].text}`}><span>{lines[displayIndex + 1].speaker}</span>{lines[displayIndex + 1].text}</button>}
        <div className="caption-foot">Word timing follows the video’s English captions. You can seek with the YouTube controls.</div>
      </div>
    </div>
    <details className="full-transcript"><summary>Read the full conversation</summary><ol>{source.dialogue.map((line, index) => <li key={index}><strong>{line.speaker}</strong> {line.text}</li>)}</ol></details>
  </div>
}
