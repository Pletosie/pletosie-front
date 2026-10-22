"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./shell";
export const clock = (seconds:number) => `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,"0")}`;
export function AudioPlayer({src,duration=0,privateAudio=false}:{src:string;duration?:number;privateAudio?:boolean}) {
 const element=useRef<HTMLAudioElement>(null);
 const [playing,setPlaying]=useState(false),[time,setTime]=useState(0),[length,setLength]=useState(duration),[error,setError]=useState(false);
 useEffect(()=>{setTime(0);setPlaying(false);setLength(duration);setError(false)},[src,duration]);
 return <div className="voice-player"><audio ref={element} src={src} crossOrigin={privateAudio?"use-credentials":undefined} preload="metadata" onLoadedMetadata={e=>{if(Number.isFinite(e.currentTarget.duration))setLength(e.currentTarget.duration)}} onTimeUpdate={e=>setTime(e.currentTarget.currentTime)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>setError(true)}/><button type="button" className="voice-play" aria-label={playing?"Mettre le vocal en pause":"Écouter le vocal"} onClick={()=>{const a=element.current;if(!a)return;if(playing)a.pause();else void a.play().catch(()=>setError(true))}}><Icon name={playing?"pause":"play"} size={19}/></button><div className="voice-track"><input aria-label="Position dans le vocal" type="range" min="0" max={length||1} step="0.1" value={Math.min(time,length||1)} disabled={!length} onChange={e=>{if(element.current)element.current.currentTime=Number(e.target.value)}}/><span>{error?"Lecture indisponible":`${clock(time)} / ${clock(length)}`}</span></div><Icon name="mic" size={17}/></div>;
}
export function VoiceRecorder({onReady,onError,disabled=false}:{onReady:(audio:string,mime:string,duration:number)=>void;onError:(message:string)=>void;disabled?:boolean}){
 const [stage,setStage]=useState<"idle"|"requesting"|"recording"|"paused">("idle"),[elapsed,setElapsed]=useState(0);
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),context=useRef<AudioContext|null>(null),canvas=useRef<HTMLCanvasElement>(null),frame=useRef(0),alive=useRef(true),discard=useRef(false),elapsedRef=useRef(0),previous=useRef(0);
 function release(){cancelAnimationFrame(frame.current);stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;if(context.current){void context.current.close().catch(()=>{});context.current=null}}
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;discard.current=true;if(recorder.current){recorder.current.onstop=null;recorder.current.ondataavailable=null;if(recorder.current.state!=="inactive")recorder.current.stop()}release()}},[]);
 async function start(){
  if(stage!=="idle")return;
  setStage("requesting");
  try{
   if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw new Error("L’enregistrement vocal n’est pas disponible dans ce navigateur.");
   const source=await navigator.mediaDevices.getUserMedia({audio:true});
   if(!alive.current){source.getTracks().forEach(t=>t.stop());return}
   stream.current=source;
   const mime=["audio/webm","audio/ogg","audio/mp4"].find(t=>MediaRecorder.isTypeSupported(t));
   if(!mime)throw new Error("Aucun format vocal compatible. Vous pouvez écrire votre message.");
   const r=new MediaRecorder(source,{mimeType:mime});recorder.current=r;
   discard.current=false;elapsedRef.current=0;setElapsed(0);
   const chunks:Blob[]=[];let bytes=0;
   r.ondataavailable=e=>{if(e.data.size){chunks.push(e.data);bytes+=e.data.size}if(bytes>10*1024*1024&&r.state!=="inactive")r.stop()};
   r.onerror=()=>{discard.current=true;if(r.state!=="inactive")r.stop();release();if(alive.current){setStage("idle");onError("L’enregistrement a été interrompu. Réessayez.")}};
   r.onstop=()=>{
    release();if(!alive.current)return;setStage("idle");
    if(discard.current)return;
    if(bytes>10*1024*1024){onError("Le vocal dépasse 10 Mo. Enregistrez un message plus court.");return}
    if(!bytes||elapsedRef.current<.2){onError("Le vocal est trop court. Réessayez.");return}
    const reader=new FileReader();const duration=elapsedRef.current;
    reader.onload=()=>{if(alive.current)onReady(String(reader.result),mime,duration)};
    reader.onerror=()=>{if(alive.current)onError("Impossible de préparer ce vocal.")};
    reader.readAsDataURL(new Blob(chunks,{type:mime}));
   };
   let analyser:AnalyserNode|null=null;
   try{const ac=new AudioContext();context.current=ac;analyser=ac.createAnalyser();analyser.fftSize=256;ac.createMediaStreamSource(source).connect(analyser);await ac.resume()}catch{/* Recording still works when visual audio analysis is unavailable. */}
   if(!alive.current){release();return}
   const samples=new Uint8Array(256),levels=Array<number>(48).fill(.04);let lastDraw=0;
   r.start(250);setStage("recording");previous.current=performance.now();
   const draw=(now:number)=>{
    if(!alive.current||r.state==="inactive")return;
    if(r.state==="recording")elapsedRef.current+=(now-previous.current)/1000;
    previous.current=now;
    if(now-lastDraw>90){lastDraw=now;setElapsed(elapsedRef.current);
     let rms=0;if(analyser&&r.state==="recording"){analyser.getByteTimeDomainData(samples);for(const sample of samples)rms+=((sample-128)/128)**2;rms=Math.sqrt(rms/samples.length)}
     if(r.state==="recording"){levels.shift();levels.push(Math.max(.04,Math.min(1,rms*5)))}
     const c=canvas.current,ctx=c?.getContext("2d");if(c&&ctx){ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle=getComputedStyle(c).color;const w=c.width/levels.length;levels.forEach((value,i)=>{const height=value*(c.height-8);ctx.fillRect(i*w+1,(c.height-height)/2,Math.max(2,w-3),height)})}
    }
    if(elapsedRef.current>=180){r.stop();return}frame.current=requestAnimationFrame(draw);
   };frame.current=requestAnimationFrame(draw);
  }catch(e){release();if(alive.current){setStage("idle");onError((e as Error).message)}}
 }
 if(stage==="idle"||stage==="requesting")return <button type="button" disabled={disabled||stage==="requesting"} className="record-start" aria-label="Enregistrer un vocal" onClick={()=>void start()}><Icon name="mic"/>{stage==="requesting"&&<span>Micro…</span>}</button>;
 return <div className={"voice-recording "+(stage==="paused"?"is-paused":"")}><button type="button" className="voice-icon" aria-label="Annuler le vocal" onClick={()=>{discard.current=true;recorder.current?.stop()}}><Icon name="trash" size={20}/></button><span className="record-dot"/><time>{clock(elapsed)}</time><div className="live-wave"><canvas ref={canvas} width="288" height="44" aria-label={stage==="paused"?"Enregistrement en pause":"Niveau sonore du microphone"}/><small>{stage==="paused"?"En pause":"Enregistrement…"}</small></div><button type="button" className="voice-icon" aria-label={stage==="paused"?"Reprendre l’enregistrement":"Mettre l’enregistrement en pause"} onClick={()=>{const r=recorder.current;if(r?.state==="recording"){r.pause();setStage("paused")}else if(r?.state==="paused"){previous.current=performance.now();r.resume();setStage("recording")}}}><Icon name={stage==="paused"?"play":"pause"}/></button><button type="button" className="voice-finish" aria-label="Terminer et écouter le vocal" onClick={()=>recorder.current?.stop()}><Icon name="check"/></button></div>;
}
