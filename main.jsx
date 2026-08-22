import React, {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {Activity, AlertTriangle, Cloud, MapPin, Upload, Wind, ShieldCheck, Brain, Bell} from "lucide-react";
import "./styles.css";

const API="http://localhost:8000";

function Stat({icon:Icon,label,value,sub}) {
  return <div className="stat"><div className="statIcon"><Icon size={20}/></div><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div>
}

function App(){
  const [aqi,setAqi]=useState(null), [hotspots,setHotspots]=useState([]), [forecast,setForecast]=useState(null), [alerts,setAlerts]=useState([]);
  const [file,setFile]=useState(null), [analysis,setAnalysis]=useState(null), [loading,setLoading]=useState(false);

  useEffect(()=>{
    Promise.all([
      fetch(API+"/api/air-quality").then(r=>r.json()),
      fetch(API+"/api/hotspots").then(r=>r.json()),
      fetch(API+"/api/predictions").then(r=>r.json()),
      fetch(API+"/api/alerts").then(r=>r.json())
    ]).then(([a,h,p,l])=>{setAqi(a);setHotspots(h.hotspots);setForecast(p);setAlerts(l.alerts)})
      .catch(()=>{});
  },[]);

  async function analyze(){
    if(!file) return;
    setLoading(true); setAnalysis(null);
    const fd=new FormData(); fd.append("image",file);
    const r=await fetch(API+"/api/reports/analyze",{method:"POST",body:fd});
    setAnalysis(await r.json()); setLoading(false);
  }

  return <div className="app">
    <header>
      <div className="brand"><div className="logo">V</div><div><h1>VayuNet AI</h1><p>Hyper-local climate intelligence for India</p></div></div>
      <div className="headerRight"><span className="live"><i/> LIVE NETWORK</span><button className="iconBtn"><Bell size={19}/></button></div>
    </header>

    <main>
      <section className="hero">
        <div><p className="eyebrow">AI CLIMATE COMMAND CENTER</p><h2>See pollution before it becomes a crisis.</h2><p className="muted">Fuse citizen evidence, sensors, weather and satellite intelligence to detect hidden hotspots and forecast AQI spikes.</p></div>
        <div className="heroBadge"><Brain size={18}/> Gemini-powered intelligence</div>
      </section>

      <section className="stats">
        <Stat icon={Activity} label="CURRENT AQI" value={aqi?.aqi ?? "--"} sub={aqi?.status ?? "Loading..."}/>
        <Stat icon={Cloud} label="PM2.5" value={aqi ? aqi.pm25 : "--"} sub="µg/m³"/>
        <Stat icon={AlertTriangle} label="HOTSPOTS" value={hotspots.length || "--"} sub="AI detected"/>
        <Stat icon={ShieldCheck} label="CRITICAL ALERTS" value={alerts.filter(a=>a.severity==="critical").length || "--"} sub="Requires action"/>
      </section>

      <section className="grid">
        <div className="panel mapPanel">
          <div className="panelHead"><div><h3>Live Pollution Map</h3><span>Patna · Bihar</span></div><div className="legend"><i className="red"/> Critical <i className="orange"/> High <i className="yellow"/> Moderate</div></div>
          <div className="map">
            <div className="roads r1"/><div className="roads r2"/><div className="roads r3"/>
            {hotspots.map((h,i)=><div key={h.id} className="pin" style={{left:`${18+i*19}%`,top:`${28+(i%2)*28}%`}}><span className={h.risk>85?"critical":h.risk>75?"high":"medium"}></span><b>{h.risk}</b></div>)}
            <div className="mapLabel">AI HOTSPOT LAYER</div>
          </div>
        </div>

        <div className="panel">
          <div className="panelHead"><div><h3>AQI Forecast</h3><span>Next 24 hours</span></div><Wind size={19}/></div>
          <div className="forecast">{forecast?.forecast?.map((x)=><div className="forecastItem" key={x.hours}><span>{x.hours===0?"Now":`+${x.hours}h`}</span><strong>{x.aqi}</strong><div className="bar"><i style={{height:`${Math.min(100,x.aqi/2.4)}%`}}/></div></div>)}</div>
          <div className="confidence"><span>Model confidence</span><strong>{forecast?.confidence ?? "--"}%</strong></div>
        </div>
      </section>

      <section className="grid lower">
        <div className="panel">
          <div className="panelHead"><div><h3>Citizen AI Report</h3><span>Upload a pollution photo for multimodal analysis</span></div></div>
          <label className="drop"><Upload size={28}/><strong>{file ? file.name : "Choose pollution photo"}</strong><span>Smoke · burning · industrial emission · dust</span><input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])}/></label>
          <button className="primary" disabled={!file||loading} onClick={analyze}>{loading?"Analyzing with Gemini…":"Analyze with Gemini AI"}</button>
          {analysis && <div className="analysis"><div><span>Pollution</span><strong>{analysis.pollution_type}</strong></div><div><span>Severity</span><strong>{analysis.severity}</strong></div><div><span>Confidence</span><strong>{analysis.confidence}%</strong></div><p>{analysis.recommended_action}</p></div>}
        </div>

        <div className="panel">
          <div className="panelHead"><div><h3>Authority Alerts</h3><span>Prioritized interventions</span></div></div>
          <div className="alerts">{alerts.map(a=><div className="alert" key={a.id}><div className={`alertIcon ${a.severity}`}><AlertTriangle size={18}/></div><div><strong>{a.title}</strong><span><MapPin size={13}/> {a.location}</span></div><b>{a.risk}</b></div>)}</div>
        </div>
      </section>

      <section className="corridors panel">
        <div><h3>Federated India Network</h3><span>Shared predictive intelligence across cities and states</span></div>
        <div className="cities"><div><b>BIHAR</b><strong>82%</strong><small>Model health</small></div><div><b>DELHI NCR</b><strong>91%</strong><small>Model health</small></div><div><b>PUNJAB</b><strong>74%</strong><small>Model health</small></div><div><b>WEST BENGAL</b><strong>63%</strong><small>Model health</small></div></div>
      </section>
    </main>
  </div>
}
createRoot(document.getElementById("root")).render(<App/>);