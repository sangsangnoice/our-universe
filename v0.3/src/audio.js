// Entirely synthesized. No recordings, licensed music, network requests or autoplay.
const PROFILES={
 overview:{root:82.4,ratios:[1,1.5,2.25],cutoff:850,wet:.34,level:.72},
 0:{root:98,ratios:[1,1.5,2],cutoff:1050,wet:.38,level:.77},
 1:{root:87.3,ratios:[1,1.333,2],cutoff:720,wet:.44,level:.70},
 2:{root:92.5,ratios:[1,1.25,1.875],cutoff:630,wet:.48,level:.68},
 3:{root:82.4,ratios:[1,1.414,2],cutoff:930,wet:.52,level:.62},
 4:{root:110,ratios:[1,1.5,2.5],cutoff:1300,wet:.40,level:.66},
 5:{root:98,ratios:[1,1.333,2],cutoff:900,wet:.46,level:.67},
 inside:{root:87.3,ratios:[1,1.333,2],cutoff:610,wet:.55,level:.66}
};
export function createAudioEngine({AudioContextClass,volume=.28,onChange=()=>{},onError=()=>{},isHidden=()=>false,interval=setInterval,clearIntervalFn=clearInterval}){
 let ctx=null,enabled=false,failed=!AudioContextClass,pending=null,timer=null,master,bus,filter,wetGain;
 let proximity=0,harmonyStep=0;
 let mode='overview',planet=-1,profile=PROFILES.overview,nextDust=0,nextHarmony=0,phase=0,lastTone=-100,desiredVolume=Math.max(0,Math.min(1,volume));
 const voices=[],continuous=[],transients=new Set();
 function status(){return {enabled:enabled&&!failed,available:!failed,starting:!!pending,volume:desiredVolume,running:ctx?.state==='running'};}
 function emit(){onChange(status());}
 function ramp(param,value,seconds=1.4){param.setTargetAtTime(value,ctx.currentTime,seconds);}
 function output(){if(master)ramp(master.gain,enabled&&!isHidden()&&ctx.state==='running'?desiredVolume*.65:0,.4);}
 function connectPan(node,pan){if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=pan;node.connect(p);p.connect(bus);return p;}node.connect(bus);return null;}
 function makeReverb(){
  const seconds=3.2,buffer=ctx.createBuffer(2,Math.ceil(ctx.sampleRate*seconds),ctx.sampleRate);let seed=2718;
  for(let ch=0;ch<2;ch++){const samples=buffer.getChannelData(ch);let smooth=0;for(let i=0;i<samples.length;i++){seed=(seed*1664525+1013904223)>>>0;smooth=smooth*.65+((seed/4294967296)*2-1)*.35;samples[i]=smooth*Math.pow(1-i/samples.length,2.6)*.3;}}
  return buffer;
 }
 function build(){
  ctx=new AudioContextClass();master=ctx.createGain();master.gain.value=0;
  const high=ctx.createBiquadFilter();high.type='highpass';high.frequency.value=65;high.Q.value=.5;
  const low=ctx.createBiquadFilter();low.type='lowpass';low.frequency.value=2200;low.Q.value=.5;
  const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-18;limiter.knee.value=12;limiter.ratio.value=8;limiter.attack.value=.02;limiter.release.value=.8;
  bus=ctx.createGain();bus.gain.value=.8;filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=profile.cutoff;filter.Q.value=.3;
  const reverb=ctx.createConvolver();reverb.buffer=makeReverb();wetGain=ctx.createGain();wetGain.gain.value=profile.wet;
  bus.connect(filter);filter.connect(master);filter.connect(reverb);reverb.connect(wetGain);wetGain.connect(master);
  master.connect(high);high.connect(low);low.connect(limiter);limiter.connect(ctx.destination);
  // Three widely spaced sine pairs; slow detuning and amplitude tides prevent a static drone.
  for(let i=0;i<3;i++){
   const amp=ctx.createGain();amp.gain.value=.045/(1+i*.35);const panner=connectPan(amp,(i-1)*.35);
   for(const cents of [-3,3]){const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=profile.root*profile.ratios[i];osc.detune.value=cents;gain.gain.value=.5;osc.connect(gain);gain.connect(amp);osc.start();voices.push({osc,index:i,amp});continuous.push(osc);}
   const breathe=ctx.createOscillator(),depth=ctx.createGain();breathe.frequency.value=.008+i*.003;depth.gain.value=.009/(i+1);breathe.connect(depth);depth.connect(amp.gain);breathe.start();continuous.push(breathe);
   if(panner){const drift=ctx.createOscillator(),width=ctx.createGain();drift.frequency.value=.005+i*.002;width.gain.value=.18;drift.connect(width);width.connect(panner.pan);drift.start();continuous.push(drift);}
  }
  // A very slow spectral tide changes colour without raising the output level.
  const tide=ctx.createOscillator(),tideDepth=ctx.createGain();tide.frequency.value=.0037;tideDepth.gain.value=85;tide.connect(tideDepth);tideDepth.connect(filter.frequency);tide.start();continuous.push(tide);
  // Scene level lives on the common bus, leaving every slow modulation independent.
  bus.gain.value=profile.level;nextDust=ctx.currentTime+18;nextHarmony=ctx.currentTime+72;
  ctx.onstatechange=()=>{output();emit();};timer=interval(tick,1000);
 }
 function setScene(nextMode,index=-1){proximity=0;harmonyStep=0;mode=nextMode;planet=index;profile=PROFILES[mode==='inside'?'inside':mode==='closeup'?planet:'overview']||PROFILES.overview;
  if(!ctx||failed)return;
  voices.forEach(v=>ramp(v.osc.frequency,profile.root*profile.ratios[v.index],2.5));ramp(filter.frequency,profile.cutoff,2);ramp(wetGain.gain,profile.wet,2);ramp(bus.gain,profile.level,2);nextHarmony=ctx.currentTime+72;
 }
 function setProximity(value){if(!Number.isFinite(value))return;proximity=Math.max(0,Math.min(1,value));if(!ctx||failed)return;ramp(filter.frequency,profile.cutoff*(1+proximity*.12),3);ramp(wetGain.gain,profile.wet-proximity*.045,3);}
 function shimmer(frequency,level,duration,pan){
  if(!ctx||ctx.state!=='running'||!enabled||isHidden()||failed)return;
  const osc=ctx.createOscillator(),g=ctx.createGain();osc.type='sine';osc.frequency.value=frequency;const now=ctx.currentTime;
  g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(level,now+duration*.3);g.gain.linearRampToValueAtTime(0,now+duration);
  osc.connect(g);const p=connectPan(g,pan);transients.add(osc);osc.onended=()=>{transients.delete(osc);osc.disconnect();g.disconnect();p?.disconnect();};osc.start(now);osc.stop(now+duration+.05);
 }
 function tick(){if(!ctx||ctx.state!=='running'||!enabled||isHidden()||failed)return;
  const now=ctx.currentTime;
  if(now>=nextDust){phase++;shimmer(390+(phase%5)*73,.011,6+(phase%3),Math.sin(phase*1.7)*.65);nextDust=now+22+(phase%4)*7;}
  if(now>=nextHarmony){harmonyStep++;const alternate=harmonyStep%2?[1,1.333,2]:profile.ratios;const root=profile.root*Math.pow(2,[0,2,0,-1][harmonyStep%4]/12);voices.forEach(v=>ramp(v.osc.frequency,root*alternate[v.index],18));nextHarmony=now+84+(harmonyStep%3)*13;}
 }
 async function toggle(){
  if(failed)return;const retryPaused=enabled&&ctx&&ctx.state!=='running'&&!pending;enabled=retryPaused?true:!enabled;
  if(!enabled){output();emit();return;}
  if(pending){emit();return pending;}
  // This is the sole construction/resume path, invoked by an explicit sound-button gesture.
  try{
   if(!ctx)build();
   const work=ctx.state!=='running'?ctx.resume():Promise.resolve();pending=work;emit();await work;pending=null;
   if(ctx.state!=='running'){enabled=false;onError('audioRetry');}output();emit();
  }catch(error){pending=null;enabled=false;output();
   if(error?.name==='NotAllowedError'){onError('audioRetry');}
   else {failed=true;clearIntervalFn(timer);timer=null;for(const o of continuous){try{o.stop();}catch{}}try{await ctx?.close();}catch{}onError('audioUnavailable');}
   emit();
  }
 }
 function setVolume(value){const n=Number(value);if(!Number.isFinite(n))return;desiredVolume=Math.max(0,Math.min(1,n));output();emit();}
 function tone(index){if(!ctx||ctx.currentTime-lastTone<2)return;lastTone=ctx.currentTime;shimmer(220*Math.pow(2,(index%6)/12),.018,3.5,0);}
 function visibility(){output();if(ctx){nextDust=ctx.currentTime+18;nextHarmony=ctx.currentTime+72;}}
 function dispose(){enabled=false;clearIntervalFn(timer);for(const o of [...continuous,...transients]){try{o.stop();}catch{}}if(ctx){ctx.onstatechange=null;ctx.close().catch(()=>{});}ctx=null;}
 return {toggle,setVolume,setScene,setProximity,tone,visibility,dispose,status};
}
export function createAudio(persistence,i18n,toast){
 const $=id=>document.getElementById(id);let current;
 function render(s=current){if(!s)return;current=s;const key=!s.available?'soundUnavailable':s.starting?'soundStarting':s.enabled&&!s.running?'soundPaused':s.enabled?'soundOn':'soundOff';$('sound').textContent=i18n.t(key);$('sound').setAttribute('aria-pressed',String(s.enabled));$('sound').disabled=!s.available;$('volume').disabled=!s.available;$('volume').value=String(Math.round(s.volume*100));$('volume').setAttribute('aria-valuetext',i18n.t('volumeValue',{value:Math.round(s.volume*100)}));$('volume-value').textContent=Math.round(s.volume*100)+'%';}
 const engine=createAudioEngine({AudioContextClass:window.AudioContext||window.webkitAudioContext,volume:persistence.state.volume,onChange:render,onError:toast,isHidden:()=>document.hidden});
 $('sound').onclick=()=>engine.toggle();$('volume').oninput=e=>{engine.setVolume(Number(e.target.value)/100);persistence.state.volume=engine.status().volume;persistence.save();};i18n.subscribe(()=>render());render(engine.status());return engine;
}
