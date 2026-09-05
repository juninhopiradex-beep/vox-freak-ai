import type { AIInsight, VocalTrack } from '../types/audio'
import type { KeyGuess } from './music'

export function buildInsights(track: VocalTrack | undefined, key: KeyGuess, tracks: VocalTrack[]): AIInsight[] {
  if (!track || !track.notes.length) return [
    { level: 'info', title: 'Ready for analysis', detail: 'Drop a lead vocal to let VOX FREAK AI map pitch, timing and phrasing.' }
  ]
  const avgCents = track.notes.reduce((s, n) => s + Math.abs(n.centsOffset), 0) / track.notes.length
  const weak = track.notes.filter(n => n.confidence < 0.55).length
  const slaveCount = tracks.filter(t => t.role === 'slave').length
  return [
    { level: 'good', title: `Key detected: ${key.key}`, detail: `${Math.round(key.confidence * 100)}% tonal confidence from the current vocal.` },
    { level: avgCents > 18 ? 'warn' : 'good', title: avgCents > 18 ? 'Pitch drift worth correcting' : 'Pitch is already controlled', detail: `Average deviation is ${avgCents.toFixed(1)} cents. AI Tune can preserve transitions while centering unstable notes.` },
    { level: weak ? 'info' : 'good', title: weak ? 'Breathy / unvoiced regions found' : 'Voicing detection is clean', detail: weak ? `${weak} low-confidence note regions will be treated conservatively.` : 'Most detected notes are stable enough for transparent correction.' },
    { level: slaveCount ? 'info' : 'good', title: slaveCount ? `${slaveCount} alignment layer${slaveCount > 1 ? 's' : ''} ready` : 'Lead-only session', detail: slaveCount ? 'Use Auto Align to estimate timing offsets against the Lead Master.' : 'Add doubles or harmonies whenever you want a Master/Slave alignment stack.' }
  ]
}
