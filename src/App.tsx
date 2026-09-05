import { useMemo, useRef, useState } from 'react'
import { BrainCircuit, Download, Link2, Music2, Play, Plus, Sparkles, Upload, Wand2, Waves } from 'lucide-react'
import type { VocalTrack } from './types/audio'
import { analyzePitch, noteName, segmentNotes } from './dsp/pitch'
import { bufferToMono, makeWaveform } from './dsp/waveform'
import { estimateOffsetMs } from './dsp/alignment'
import { buildInsights } from './lib/ai'
import { detectKey, snapMidiToKey } from './lib/music'
import { encodeWav } from './dsp/exportWav'

const COLORS=['#ff35db','#36dfff','#a548ff','#66ff34','#ff9c36','#7b7cff']

export default function App(){
  const [tracks,setTracks]=useState<VocalTrack[]>([])
  const [activeId,setActiveId]=useState<string|null>(null)
  const [strength,setStrength]=useState(75)
  const [humanize,setHumanize]=useState(30)
  const [status,setStatus]=useState('Drop or import a vocal to begin')
  const inputRef=useRef<HTMLInputElement>(null)
  const audioCtx=useRef<AudioContext|null>(null)
  const active=tracks.find(t=>t.id===activeId)??tracks[0]
  const key=useMemo(()=>detectKey((active?.pitch??[]).map(p=>p.midi)),[active?.pitch])
  const insights=useMemo(()=>buildInsights(active,key,tracks),[active,key,tracks])

  async function addFiles(list:FileList|File[]){
    const files=Array.from(list); if(!files.length)return
    const ctx=audioCtx.current??new AudioContext(); audioCtx.current=ctx
    for(const file of files){
      setStatus(`Analyzing ${file.name}…`)
      const buf=await ctx.decodeAudioData((await file.arrayBuffer()).slice(0))
      const samples=bufferToMono(buf); const pitch=analyzePitch(samples,buf.sampleRate); const notes=segmentNotes(pitch)
      const id=crypto.randomUUID(); const role=tracks.length===0?'master':'slave'
      const track:VocalTrack={id,name:role==='master'?'Lead Master':`Vocal ${tracks.length+1}`,role,color:COLORS[tracks.length%COLORS.length],audioBuffer:buf,samples,sampleRate:buf.sampleRate,duration:buf.duration,waveform:makeWaveform(samples),pitch,notes,gain:1,mute:false,solo:false,offsetMs:0,fileName:file.name}
      setTracks(prev=>[...prev,track]); setActiveId(id); setStatus(`${notes.length} note regions detected`)
    }
  }

  function patch(id:string,p:Partial<VocalTrack>){setTracks(ts=>ts.map(t=>t.id===id?{...t,...p}:t))}
  function aiTune(){
    if(!active)return
    const notes=active.notes.map(n=>{const target=snapMidiToKey(n.detectedMidi,key.root,key.mode);const blend=n.detectedMidi+(target-n.detectedMidi)*(strength/100)*(1-humanize/140);return {...n,midi:Math.round(blend),strength,humanize,centsOffset:(blend-Math.round(blend))*100}})
    patch(active.id,{notes});setStatus('AI Tune applied non-destructively')
  }
  function autoAlign(){
    const master=tracks.find(t=>t.role==='master'&&t.samples&&t.sampleRate); if(!master?.samples||!master.sampleRate)return
    setTracks(ts=>ts.map(t=>{if(t.role!=='slave'||!t.samples||!t.sampleRate)return t;const off=estimateOffsetMs(master.samples!,t.samples,t.sampleRate);return {...t,offsetMs:-off}}));setStatus('Master/Slave timing offsets calculated')
  }
  async function play(){
    const ctx=audioCtx.current??new AudioContext();audioCtx.current=ctx;await ctx.resume();const anySolo=tracks.some(t=>t.solo)
    tracks.filter(t=>t.audioBuffer&&!t.mute&&(!anySolo||t.solo)).forEach(t=>{const s=ctx.createBufferSource();const g=ctx.createGain();s.buffer=t.audioBuffer!;g.gain.value=t.gain;s.connect(g).connect(ctx.destination);s.start(ctx.currentTime+.03+Math.max(0,t.offsetMs/1000))})
  }
  function exportActive(){if(!active?.samples||!active.sampleRate)return;const b=encodeWav(active.samples,active.sampleRate);const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='vox-freak-preview.wav';a.click();URL.revokeObjectURL(u)}

  return <div className="app" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void addFiles(e.dataTransfer.files)}}>
    <header><div className="brand"><div className="logo"><i/><i/><i/><i/><i/></div><div><h1>VOX FREAK <b>AI</b></h1><small>HUMAN VOICES. HIGHER POTENTIAL.</small></div></div><nav><button className="active"><Waves/>Tune</button><button><Link2/>Align</button><button><BrainCircuit/>AI Assistant</button></nav><button className="ghost" onClick={exportActive}><Download/>Export</button></header>
    <main>
      <aside className="tracks"><div className="section-title">TRACKS <button onClick={()=>inputRef.current?.click()}><Plus/></button></div>{tracks.map(t=><button key={t.id} className={`track ${active?.id===t.id?'selected':''}`} onClick={()=>setActiveId(t.id)}><span style={{background:t.color}}/><div><b>{t.name}</b><small>{t.role==='master'?'Lead Vocal':'Slave Vocal'}</small></div><em>{t.offsetMs>=0?'+':''}{t.offsetMs} ms</em></button>)}<button className="import" onClick={()=>inputRef.current?.click()}><Upload/>Import vocals</button><input ref={inputRef} hidden multiple type="file" accept="audio/*" onChange={e=>e.target.files&&void addFiles(e.target.files)}/><div className="card"><small>GLOBAL TUNING</small><strong>{key.key}</strong><span>{Math.round(key.confidence*100)}% confidence</span></div></aside>
      <section className="workspace">
        <div className="overview">{active?<Wave data={active.waveform} color={active.color}/>:<div className="drop"><Upload/>Drop a vocal here</div>}</div>
        <div className="editor"><div className="editor-head"><div><span className="dot" style={{background:active?.color??'#ff35db'}}/> {active?.name??'LEAD MASTER'}</div><div><button onClick={aiTune}><Sparkles/>AI Tune</button><button onClick={autoAlign}><Link2/>Auto Align</button></div></div><PitchView track={active}/></div>
        <div className="alignment"><div className="editor-head"><b>VOCAL ALIGNMENT</b><button onClick={autoAlign}><Link2/>Master / Slaves</button></div>{tracks.map(t=><div className="lane" key={t.id}><label>{t.name}</label><div className="mini"><Wave data={t.waveform} color={t.color}/></div><span>{t.offsetMs>=0?'+':''}{t.offsetMs} ms</span></div>)}</div>
        <footer><button className="play" onClick={()=>void play()}><Play/></button><div className="macro"><label>Strength <b>{strength}%</b></label><input type="range" value={strength} onChange={e=>setStrength(+e.target.value)}/></div><div className="macro"><label>Humanize <b>{humanize}%</b></label><input type="range" value={humanize} onChange={e=>setHumanize(+e.target.value)}/></div><div className="status">{status}</div></footer>
      </section>
      <aside className="ai"><div className="ai-title"><BrainCircuit/> AI ASSISTANT <span>● Online</span></div><div className="hero">Let AI do the heavy lifting.<br/><b>You keep the soul.</b></div>{insights.map((x,i)=><div className={`insight ${x.level}`} key={i}><strong>{x.title}</strong><p>{x.detail}</p></div>)}<div className="actions"><button onClick={aiTune}><Sparkles/><div><b>AI Tune</b><small>Smart pitch correction</small></div></button><button onClick={autoAlign}><Link2/><div><b>AI Align</b><small>Sync timing & phrasing</small></div></button><button><Music2/><div><b>Detect Key</b><small>{key.key}</small></div></button><button><Wand2/><div><b>Naturalize Vibrato</b><small>Keep it human</small></div></button></div></aside>
    </main>
  </div>
}

function Wave({data,color}:{data:Float32Array;color:string}){const bars=Array.from(data.slice(0,120));return <div className="wave">{bars.map((v,i)=><i key={i} style={{height:`${Math.max(6,v*100)}%`,background:color}}/>)}</div>}

function PitchView({track}:{track:VocalTrack|undefined}){
  const notes=track?.notes??[]; const dur=Math.max(.1,track?.duration??1); const min=notes.length?Math.min(...notes.map(n=>n.midi))-2:48; const max=notes.length?Math.max(...notes.map(n=>n.midi))+2:72
  return <div className="pitch"><div className="piano">{Array.from({length:max-min+1},(_,i)=>max-i).map(n=><span key={n}>{noteName(n)}</span>)}</div><div className="grid">{notes.map(n=>{const left=n.start/dur*100;const width=Math.max(1.4,(n.end-n.start)/dur*100);const top=(max-n.midi)/Math.max(1,max-min)*100;return <div className="blob" key={n.id} style={{left:`${left}%`,width:`${width}%`,top:`${top}%`}}><span>{noteName(n.midi)}</span></div>})}</div></div>
}
