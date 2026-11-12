import * as THREE from '../vendor/three.module.js';
import {data} from './planets.js';
export const $=id=>document.getElementById(id);
export function createUI(persistence,callbacks,reduced,i18n){
 const {state,save}=persistence,{t}=i18n;let focused=-1,sequence=[],timer,activeToast=null,revealed=false,introTimer;
 const labels=data.map((d,i)=>{const b=document.createElement('button');b.className='planet-label';b.hidden=true;b.onclick=()=>callbacks.focus(i);$('labels').append(b);return b;});
 const navButtons=data.slice(0,5).map((_,i)=>{const b=document.createElement('button');b.className='atlas-planet';b.onclick=()=>{$('atlas').close();callbacks.focus(i);};$('planet-nav').append(b);return b;});
 function count(){return [0,1,2,3,4].filter(i=>state.seen.includes(i)).length;}
 function toast(key){activeToast=key;$('toast').textContent=t(key);$('toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>{$('toast').classList.remove('visible');activeToast=null;},6000);}
 function secret(id){if(!state.secrets.includes(id)){state.secrets.push(id);save();toast('notices.'+id);renderJournal();}}
 function progress(){$('progress').textContent=t('progress',{count:count()});}
 function dismiss(explore=false){clearTimeout(introTimer);$('intro').classList.add('dismissed');$('intro').hidden=true;if(explore===true){document.body.classList.add('exploring');$('title').inert=true;$('title').setAttribute('aria-hidden','true');}}
 function renderPlanet(){if(focused<0)return;const d=i18n.planet(focused);$('story-index').textContent=d.tag;$('story-title').textContent=d.name;$('story-en').textContent=d.subtitle;$('story-text').textContent=d.story;$('response').textContent=revealed?d.response:'';$('action').setAttribute('aria-expanded',String(revealed));$('explored-status').textContent=state.seen.includes(focused)?'✓ '+t('visited'):'';$('enter').hidden=focused!==1;$('enter').textContent=t('enter');$('coming-soon').hidden=focused===1;}
 function renderLabels(){labels.forEach((b,i)=>{const d=i18n.planet(i);b.replaceChildren();b.append(document.createTextNode(d.name));const small=document.createElement('small');small.textContent=d.tag+(state.seen.includes(i)?' · ✓':'');b.append(small);b.setAttribute('aria-label',d.name+(state.seen.includes(i)?' · '+t('visited'):''));});navButtons.forEach((b,i)=>{b.replaceChildren();const name=document.createElement('span'),status=document.createElement('small');name.textContent=String(i+1).padStart(2,'0')+'  '+i18n.planet(i).name;status.textContent=state.seen.includes(i)?'✓ '+t('visited'):t('unvisited');b.append(name);b.append(status);});}
 function renderJournal(){$('entries').replaceChildren();for(const i of state.seen){const d=i18n.planet(i);if(!d)continue;const e=document.createElement('div');e.className='entry';e.textContent=d.name;const sub=document.createElement('span');sub.textContent=d.subtitle;e.append(sub);$('entries').append(e);}for(const key of state.secrets){if(!['letter','return','mirror'].includes(key))continue;const e=document.createElement('div');e.className='entry';e.textContent=t('secrets.'+key);$('entries').append(e);}if(!state.seen.length)$('entries').textContent=t('journalEmpty');$('storage-note').textContent=t(persistence.available?'storage':'storageUnavailable');}
 function refresh(){progress();renderPlanet();renderLabels();renderJournal();$('quality').textContent=t(state.low?'qualityLow':'qualityHigh');if(activeToast)$('toast').textContent=t(activeToast);}
 function showPlanet(i,record=true){
  if(focused!==i||record)revealed=false;focused=i;labels.forEach(b=>b.hidden=true);dismiss(true);document.body.classList.add('focused','exploring');document.body.classList.remove('inside');$('story').hidden=false;$('world-panel').hidden=true;
  if(record){if(!state.seen.includes(i))state.seen.push(i);if(sequence.at(-1)!==i)sequence.push(i);sequence=sequence.slice(-3);if(sequence.join(',')==='0,1,2')secret('letter');if(i===5)secret('return');
   if(count()===5&&!state.completionSeen){state.completionSeen=true;toast('complete');}
   save();
  }
  refresh();$('story').scrollTop=0;
 }
 function home(initial=false){focused=-1;revealed=false;document.body.classList.remove('focused','inside');if(!initial)dismiss(true);$('story').hidden=true;$('world-panel').hidden=true;}
 function inside(){document.body.classList.add('inside');$('story').hidden=true;$('world-panel').hidden=false;labels.forEach(b=>b.hidden=true);}
 // Scroll only the story's own overflow box; never scrollIntoView the document.
 function reveal(){if(focused<0)return;revealed=true;renderPlanet();callbacks.action(focused);requestAnimationFrame(()=>{const box=$('story'),response=$('response');const top=box.scrollTop+response.getBoundingClientRect().top-box.getBoundingClientRect().top-24;box.scrollTo({top:Math.max(0,top),behavior:reduced?'auto':'smooth'});});}
 $('back').onclick=callbacks.home;$('overview').onclick=()=>callbacks.home();$('world-back').onclick=callbacks.leave;$('enter').onclick=callbacks.enter;$('action').onclick=reveal;
 $('nav').onclick=()=>{$('atlas').showModal();};$('journal').onclick=()=>{renderJournal();$('notebook').showModal();};
 $('wander').onclick=()=>dismiss(true);$('help').onclick=()=>$('instructions').showModal();$('skip').onclick=()=>dismiss();
 if(state.visits>1||reduced)dismiss();else introTimer=setTimeout(dismiss,5200);
 document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
 i18n.subscribe(refresh);
 const projected=new THREE.Vector3(),ray=new THREE.Raycaster();let labelTick=0;
 function updateLabels(camera,planets,mode,dt){
  labelTick+=dt;if(labelTick<.08)return;labelTick=0;
  const used=[];const w=innerWidth,h=innerHeight;
  const titleRect=!document.body.classList.contains('exploring')?$('title').getBoundingClientRect():null;
  planets.forEach((p,i)=>{
   const b=labels[i];b.hidden=mode!=='overview'||!p.group.visible;if(b.hidden)return;
   projected.copy(p.group.position).project(camera);if(projected.z>1||projected.z< -1||Math.abs(projected.x)>1.08||Math.abs(projected.y)>1.08){b.hidden=true;return;}
   // Labels follow the screen-space lower limb, regardless of camera inclination.
   const radius=data[i].r/camera.position.distanceTo(p.group.position)*h/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));
   let x=(projected.x*.5+.5)*w,y=(-projected.y*.5+.5)*h+radius+25;
   const toward=p.group.position.clone().sub(camera.position).normalize();ray.set(camera.position,toward);
   const hit=ray.intersectObjects(planets.filter(v=>v.group.visible).map(v=>v.ball),false)[0];if(hit&&hit.object!==p.ball){b.hidden=true;return;}
   x=THREE.MathUtils.clamp(x,95,w-95);let box;
   for(let tries=0;tries<5;tries++){box={left:x-90,right:x+90,top:y-20,bottom:y+20};const overlaps=r=>box.left<r.right&&box.right>r.left&&box.top<r.bottom&&box.bottom>r.top;if(!used.some(overlaps)&&!(titleRect&&overlaps(titleRect)))break;y+=43;}
   if(y>h-100||y<105||used.some(r=>box.left<r.right&&box.right>r.left&&box.top<r.bottom&&box.bottom>r.top)){b.hidden=true;return;}
   used.push(box);b.style.left=x+'px';b.style.top=y+'px';
  });
 }
 refresh();return {toast,secret,showPlanet,home,inside,dismiss,updateLabels,refresh};
}
