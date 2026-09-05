export type PitchPoint = {
  time: number
  hz: number
  midi: number
  cents: number
  confidence: number
}

export type NoteSegment = {
  id: string
  start: number
  end: number
  midi: number
  detectedMidi: number
  confidence: number
  centsOffset: number
  strength: number
  humanize: number
  vibrato: number
  locked?: boolean
}

export type VocalTrack = {
  id: string
  name: string
  role: 'master' | 'slave'
  color: string
  audioBuffer?: AudioBuffer
  samples?: Float32Array
  sampleRate?: number
  duration: number
  waveform: Float32Array
  pitch: PitchPoint[]
  notes: NoteSegment[]
  gain: number
  mute: boolean
  solo: boolean
  offsetMs: number
  fileName?: string
}

export type AIInsight = {
  level: 'good' | 'info' | 'warn'
  title: string
  detail: string
}
