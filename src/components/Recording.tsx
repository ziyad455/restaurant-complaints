import { useEffect, useRef, useState } from 'react'
import { Mic, Pause, Play, RotateCcw, Square, Volume2 } from 'lucide-react'
import { RevealItem } from './StepReveal'

function recordingError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') return 'Microphone access was blocked. You can allow it in your browser settings, type your answer, or skip this recording.'
    if (error.name === 'NotFoundError') return 'No microphone was found. You can type your answer or skip this recording.'
    if (error.name === 'NotReadableError') return 'Your microphone is in use by another app. You can try again, type your answer, or skip.'
  }
  return 'Recording could not start. You can try again, type your answer, or skip.'
}

function preferredAudioType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  return ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find(type => MediaRecorder.isTypeSupported(type))
}

export function Recording({ prompt, sequence, total, blob, onBlob, typed, onTyped, skipped, onSkip }: {
  prompt: string; sequence: number; total: number; blob?: Blob; onBlob: (blob?: Blob) => void
  typed: string; onTyped: (value: string) => void; skipped: boolean; onSkip: () => void
}) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const activeRef = useRef(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [url, setUrl] = useState<string>()
  const [status, setStatus] = useState<'idle' | 'requesting' | 'recording' | 'ready' | 'error'>(blob ? 'ready' : 'idle')
  const [message, setMessage] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [typeInstead, setTypeInstead] = useState(Boolean(typed))

  useEffect(() => {
    if (!blob) { setUrl(undefined); return }
    const nextUrl = URL.createObjectURL(blob)
    setUrl(nextUrl)
    return () => URL.revokeObjectURL(nextUrl)
  }, [blob])
  useEffect(() => {
    if (status !== 'recording') return
    const started = Date.now()
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 250)
    return () => window.clearInterval(timer)
  }, [status])
  useEffect(() => {
    activeRef.current = true
    return () => {
      activeRef.current = false
      recorderRef.current && (recorderRef.current.onstop = null)
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
      streamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [])

  async function start() {
    setMessage('')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setStatus('error'); setMessage('This browser cannot record audio here. Type your answer or skip this recording.'); return
    }
    setStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!activeRef.current) { stream.getTracks().forEach(track => track.stop()); return }
      streamRef.current = stream
      const mimeType = preferredAudioType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recorderRef.current = recorder
      const chunks: BlobPart[] = []
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
      recorder.onerror = () => { if (activeRef.current) { setStatus('error'); setMessage('Recording stopped unexpectedly. Please try again or type your answer.') } stream.getTracks().forEach(track => track.stop()) }
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null
        if (!activeRef.current) return
        if (chunks.length) { onBlob(new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/webm' })); setStatus('ready') }
        else { setStatus('error'); setMessage('No audio was recorded. Please try again or type your answer.') }
      }
      recorder.start()
      setSeconds(0)
      setStatus('recording')
    } catch (error) { streamRef.current?.getTracks().forEach(track => track.stop()); streamRef.current = null; if (activeRef.current) { setStatus('error'); setMessage(recordingError(error)) } }
  }
  function stop() { if (recorderRef.current?.state === 'recording') recorderRef.current.stop() }
  async function play() {
    const audio = audioRef.current
    if (!audio) return
    try { await audio.play(); setPlaying(true) } catch { setMessage('Your recording could not be played. You can record again or type an answer.') }
  }

  return <div className="recording-step"><RevealItem><div className="step-eyebrow">Speaking warm-up <span>{sequence} of {total}</span></div></RevealItem><RevealItem><h1>{prompt}</h1><p className="step-lead">Speak freely. There is no score for this answer.</p></RevealItem>
    <RevealItem><div className={`recording-stage ${status === 'recording' ? 'is-recording' : ''}`}>
      <div className="mic-mark"><Mic size={29} /></div>
      {status === 'idle' && <><h2>Ready when you are</h2><p>Record a short answer in your own words.</p><button className="primary-action" onClick={start}><Mic size={19} /> Start recording</button></>}
      {status === 'requesting' && <p role="status">Waiting for microphone permission…</p>}
      {status === 'recording' && <><h2>Recording your answer</h2><div className="recording-indicator" aria-hidden="true"><i /><i /><i /><i /><i /></div><p className="recording-time" role="status">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</p><button className="primary-action danger-action" onClick={stop}><Square size={18} fill="currentColor" /> Stop recording</button></>}
      {status === 'ready' && <><h2>Your answer is ready</h2><p>Listen to it or record another answer.</p>{url && <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} />}<div className="recording-actions"><button className="secondary-action" onClick={playing ? () => { audioRef.current?.pause(); setPlaying(false) } : play}>{playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />} {playing ? 'Pause my answer' : 'Play my answer'}</button><button className="text-action" onClick={() => { onBlob(undefined); setStatus('idle'); setPlaying(false) }}><RotateCcw size={17} /> Record again</button></div></>}
      {status === 'error' && <><h2>Microphone unavailable</h2><p role="alert">{message}</p><button className="secondary-action" onClick={start}><Mic size={18} /> Try again</button></>}
    </div></RevealItem>
    <RevealItem><div className="recording-alternative"><button className="text-action" onClick={() => setTypeInstead(value => !value)}><Volume2 size={16} /> {typeInstead ? 'Hide typed answer' : 'Type an answer instead'}</button><button className="text-action" onClick={onSkip}>Skip recording</button></div></RevealItem>
    {typeInstead && <label className="typed-answer">Your answer<textarea value={typed} onChange={event => onTyped(event.target.value)} placeholder="Write what you would say…" rows={4} /></label>}
    {skipped && <p className="support-note" role="status">Recording skipped. You can continue or return to record later.</p>}
    {message && status !== 'error' && <p className="support-note" role="alert">{message}</p>}
  </div>
}
