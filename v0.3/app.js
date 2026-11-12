import * as THREE from './vendor/three.module.js';
import {data} from './src/planets.js';
import {createUniverse} from './src/universe.js';
import {UniverseCamera} from './src/camera.js';
import {createCloseup,closeupView} from './src/closeup.js';
import {createExploration} from './src/exploration.js';
import {createSave} from './src/save.js';
import {createUI,$} from './src/ui.js';
import {createAudio} from './src/audio.js';
import {createI18n} from './src/i18n.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let storage;try{storage=localStorage;}catch{storage={getItem(){throw Error('Storage disabled');},setItem(){throw Error('Storage disabled');}};}
const persistence=createSave(storage),{state,save}=persistence;
const i18n=createI18n(persistence);i18n.apply();
document.querySelectorAll('[data-language]').forEach(button=>button.onclick=()=>i18n.setLanguage(button.dataset.language));
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});}catch{$('fallback').hidden=false;$('intro').hidden=true;throw Error('WebGL unavailable');}
renderer.setClearColor(0x050814);renderer.outputColorSpace=THREE.SRGBColorSpace;$('universe').append(renderer.domElement);
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('fallback').hidden=false;});
const camera=new THREE.PerspectiveCamera(43,1,.1,180),rig=new UniverseCamera(camera),universe=createUniverse(state.visits),closeup=createCloseup(renderer);
let mode='overview',focused=-1,world=null,returnView=null,time=0,last=0,lastSoundUpdate=0;
const clock=new THREE.Clock(),ray=new THREE.Raycaster();
const ui=createUI(persistence,{focus,home,enter,leave,action(i){audio.tone(i);if(i===4)universe.petals.forEach(p=>p.userData.r+=.06);}},reduced,i18n);
const audio=createAudio(persistence,i18n,ui.toast);
function overviewView(){return {position:new THREE.Vector3(0,1,innerWidth<700?36:24),target:new THREE.Vector3(0,0,0)};}
function home(initial=false){mode='overview';focused=-1;rig.min=2;rig.max=65;rig.minHeight=-Infinity;rig.polarMax=Math.PI-.08;rig.setColliders(universe.colliders);const v=overviewView();rig.setView(v.position,v.target);ui.home(initial===true);audio.setScene('overview');resize();}
function focus(i){if(i===5&&state.visits<2)return;mode='closeup';focused=i;rig.min=.7;rig.max=35;rig.minHeight=-Infinity;rig.polarMax=Math.PI-.08;rig.setColliders(universe.colliders);const v=closeupView(universe.planets[i],camera,rig.target,innerWidth<700);rig.setView(v.position,v.target);ui.showPlanet(i);audio.setScene('closeup',i);audio.tone(i);resize();}
function enter(){if(mode!=='closeup'||focused!==1)return;returnView=rig.snapshot();world??=createExploration();mode='inside';rig.min=6;rig.max=38;rig.minHeight=-.4;rig.polarMax=Math.PI/2;rig.setColliders(world.colliders);rig.setView(world.position,world.target,true);ui.inside();audio.setScene('inside',focused);resize();}
function leave(){if(mode!=='inside')return;mode='closeup';rig.min=.7;rig.max=35;rig.minHeight=-Infinity;rig.polarMax=Math.PI-.08;rig.setColliders(universe.colliders);rig.setView(returnView.position,returnView.target,true);ui.showPlanet(focused,false);audio.setScene('closeup',focused);resize();}
function resize(){const w=innerWidth,h=innerHeight;camera.aspect=w/h;camera.clearViewOffset();if(mode==='closeup')camera.setViewOffset(w,h,w<700?0:w*.17,w<700?h*.20:0,w,h);camera.updateProjectionMatrix();renderer.setSize(w,h);closeup.resize();}
function quality(){renderer.setPixelRatio(Math.min(devicePixelRatio,state.low?1:1.7));universe.setQuality(state.low,renderer.getPixelRatio());$('quality').textContent=i18n.t(state.low?'qualityLow':'qualityHigh');$('quality').setAttribute('aria-pressed',String(state.low));resize();save();}
$('quality').onclick=()=>{state.low=!state.low;quality();};window.addEventListener('resize',resize);
function ndc(x,y){const r=renderer.domElement.getBoundingClientRect();return new THREE.Vector2((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);}
function objects(){return mode==='inside'?[]:universe.planets.filter(p=>p.group.visible).map(p=>p.ball);}
function select(x,y){if(mode==='inside')return;ray.setFromCamera(ndc(x,y),camera);const hit=ray.intersectObjects(universe.pickable,false).find(h=>h.object.parent.visible);if(!hit)return;if(hit.object===universe.anomalyHit){ui.secret('mirror');audio.tone(4);}else focus(hit.object.userData.index);}
// Pointer capture + per-gesture movement flag prevents drag and pinch releases becoming clicks.
const pointers=new Map();let gesture=null,pinch=0;
const canvas=renderer.domElement;
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1)gesture={x:e.clientX,y:e.clientY,moved:false};else{gesture.moved=true;const [a,b]=[...pointers.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y);}ui.dismiss(true);});
canvas.addEventListener('pointermove',e=>{const old=pointers.get(e.pointerId);if(!old)return;const dx=e.clientX-old.x,dy=e.clientY-old.y;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>5)gesture.moved=true;if(pointers.size>=2){const [a,b]=[...pointers.values()],distance=Math.max(1,Math.hypot(a.x-b.x,a.y-b.y));rig.zoomAt(ndc((a.x+b.x)/2,(a.y+b.y)/2),Math.log(Math.max(1,pinch)/distance)/.0015,objects());pinch=distance;}else if(gesture.moved)rig.orbit(dx,dy);});
canvas.addEventListener('pointerup',e=>{if(!pointers.has(e.pointerId))return;const click=pointers.size===1&&!gesture.moved;pointers.delete(e.pointerId);if(click)select(e.clientX,e.clientY);if(!pointers.size)gesture=null;});
function cancel(e){pointers.delete(e.pointerId);if(gesture)gesture.moved=true;if(!pointers.size)gesture=null;}
canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('lostpointercapture',cancel);
canvas.addEventListener('wheel',e=>{e.preventDefault();ui.dismiss(true);const unit=e.deltaMode===1?16:e.deltaMode===2?innerHeight:1;rig.zoomAt(ndc(e.clientX,e.clientY),e.deltaY*unit,objects());},{passive:false});
window.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||e.target?.closest?.('input,textarea,select,[contenteditable]'))return;if(e.key==='Escape'){ui.dismiss();mode==='inside'?leave():home();return;}const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'];if(!keys.includes(e.key))return;e.preventDefault();ui.dismiss(true);if(e.key==='ArrowLeft')rig.orbit(-24,0);if(e.key==='ArrowRight')rig.orbit(24,0);if(e.key==='ArrowUp')rig.orbit(0,-24);if(e.key==='ArrowDown')rig.orbit(0,24);if(['+','=','-'].includes(e.key))rig.zoomAt(new THREE.Vector2(),e.key==='-'?100:-100,objects());});
quality();home(true);const initial=overviewView();rig.setView(initial.position,initial.target,true);
function animate(now){requestAnimationFrame(animate);if(document.hidden)return;if(state.low&&now-last<32)return;last=now;const dt=Math.min(clock.getDelta(),.05);time+=reduced?0:dt;rig.update(dt);
 if(mode==='inside'){world.update(time);renderer.render(world.scene,camera);}else{universe.update(dt,time,focused,reduced,state.secrets,camera);if(mode==='closeup')closeup.render(universe.scene,camera,universe.planets[focused].group.position,state.low);else renderer.render(universe.scene,camera);}
 if(now-lastSoundUpdate>250){lastSoundUpdate=now;const distance=mode==='inside'?0:Math.min(...universe.planets.filter(p=>p.group.visible).map(p=>camera.position.distanceTo(p.group.position)-data[p.ball.userData.index].r));audio.setProximity(mode==='inside'?.35:Math.exp(-Math.max(0,distance)/8));}
 ui.updateLabels(camera,universe.planets,mode,dt);
}
requestAnimationFrame(animate);document.addEventListener('visibilitychange',()=>{clock.getDelta();audio.visibility();});
