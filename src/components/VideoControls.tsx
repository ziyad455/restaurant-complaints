import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'

type Props = {
  status: 'loading' | 'ready' | 'error'
  playerState: number
  playRequested: boolean
  autoplayBlocked: boolean
  volume: number
  muted: boolean
  volumeSupported: boolean
  onPlay: () => void
  onPause: () => void
  onReplay: () => void
  onVolumeChange: (volume: number) => void
  onToggleMute: () => void
}

export function VideoControls({ status, playerState, playRequested, autoplayBlocked, volume, muted, volumeSupported, onPlay, onPause, onReplay, onVolumeChange, onToggleMute }: Props) {
  const active = playerState === 1 || playerState === 3
  const playbackStatus = status === 'error' ? 'Player unavailable'
    : status === 'loading' ? 'Preparing player'
    : autoplayBlocked ? 'Press play in the video'
    : playerState === 1 ? 'Playing'
    : playerState === 2 ? 'Paused'
    : playerState === 3 ? 'Buffering'
    : playerState === 0 ? 'Finished'
    : playRequested ? 'Starting playback' : 'Ready to play'

  return <div className="video-controls" role="group" aria-label="Video playback controls">
    <button type="button" className="video-control-button video-control-primary" disabled={status !== 'ready'}
      onClick={active ? onPause : onPlay} aria-label={active ? 'Pause video' : 'Play video'}>
      {active ? <Pause size={18} fill="currentColor" aria-hidden="true" /> : <Play size={18} fill="currentColor" aria-hidden="true" />}
    </button>
    <button type="button" className="video-control-button" disabled={status !== 'ready'} onClick={onReplay} aria-label="Replay video from beginning" title="Replay video">
      <RotateCcw size={18} aria-hidden="true" />
    </button>
    <span className="video-playback-status" role="status" aria-live="polite">{playbackStatus}</span>
    <div className="video-volume-controls">
      <button type="button" className="video-control-button" disabled={status !== 'ready' || !volumeSupported}
        onClick={onToggleMute} aria-label={muted ? 'Unmute video' : 'Mute video'} title={muted ? 'Unmute' : 'Mute'}>
        {muted || volume === 0 ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
      </button>
      {volumeSupported ? <>
        <label className="sr-only" htmlFor="video-volume">Video volume</label>
        <input id="video-volume" type="range" min="0" max="100" step="1" value={volume}
          disabled={status !== 'ready'} onChange={event => onVolumeChange(Number(event.target.value))}
          aria-valuetext={`${volume}%`} />
        <output className="video-volume-value" htmlFor="video-volume">{volume}%</output>
      </> : <span className="video-device-volume">Use device volume controls</span>}
    </div>
  </div>
}
