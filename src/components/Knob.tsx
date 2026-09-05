export function Knob({ label, value, min=0, max=100, suffix='%', onChange, accent='#40e9ff' }:{
  label:string; value:number; min?:number; max?:number; suffix?:string; accent?:string; onChange:(v:number)=>void
}) {
  const pct=(value-min)/(max-min)
  return <label className="knob-wrap">
    <div className="knob" style={{'--pct':`${pct*280-140}deg`,'--accent':accent} as React.CSSProperties}>
      <input aria-label={label} type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))}/>
      <span className="knob-line" />
    </div>
    <span>{label}</span><b>{Math.round(value)}{suffix}</b>
  </label>
}
