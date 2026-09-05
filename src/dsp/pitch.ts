import type { NoteSegment, PitchPoint } from '../types/audio'

export const hzToMidi=(hz:number)=>69+12*Math.log2(hz/440)
export const noteName=(m:number)=>{
  const names=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B']
  const n=Math.round(m); return `${names[((n%12)+12)%12]}${Math.floor(n/12)-1}`
}

function framePitch(x:Float32Array,sr:number){
  let e=0; for(let i=0;i<x.length;i++) e+=x[i]*x[i]
  const rms=Math.sqrt(e/x.length); if(rms<.012) return {hz:0,confidence:0}
  const minTau=Math.floor(sr/1000), maxTau=Math.min(Math.floor(sr/70),x.length>>1)
  let best=Infinity,bestTau=0
  for(let tau=minTau;tau<=maxTau;tau+=2){
    let d=0,c=0
    for(let i=0;i<x.length-tau;i+=2){const z=x[i]-x[i+tau];d+=z*z;c++}
    d/=Math.max(1,c); if(d<best){best=d;bestTau=tau}
  }
  const confidence=Math.max(0,Math.min(1,1-best/(rms*rms*2+1e-8)))
  return confidence>.42?{hz:sr/bestTau,confidence}:{hz:0,confidence}
}

export function analyzePitch(samples:Float32Array,sr:number):PitchPoint[]{
  const out:PitchPoint[]=[]; const size=2048,hop=1024
  for(let p=0;p+size<samples.length;p+=hop){
    const {hz,confidence}=framePitch(samples.subarray(p,p+size),sr)
    if(hz){const midi=hzToMidi(hz);out.push({time:(p+size/2)/sr,hz,midi,cents:(midi-Math.round(midi))*100,confidence})}
  }
  return out
}

export function segmentNotes(points:PitchPoint[]):NoteSegment[]{
  if(!points.length)return[]
  const out:NoteSegment[]=[]; let group:PitchPoint[]=[]; let note=Math.round(points[0].midi)
  const flush=()=>{if(group.length<2){group=[];return};const avg=group.reduce((s,p)=>s+p.midi,0)/group.length;const conf=group.reduce((s,p)=>s+p.confidence,0)/group.length;const start=group[0].time;const end=group[group.length-1].time+.03;out.push({id:`n${out.length}`,start,end,midi:Math.round(avg),detectedMidi:avg,confidence:conf,centsOffset:(avg-Math.round(avg))*100,strength:75,humanize:30,vibrato:50});group=[]}
  for(const p of points){const n=Math.round(p.midi);const gap=group.length?p.time-group[group.length-1].time:0;if(group.length&&(n!==note||gap>.11)){flush();note=n}group.push(p)}
  flush();return out.filter(n=>n.end-n.start>.055)
}
