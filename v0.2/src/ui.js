import * as THREE from '../vendor/three.module.js';
import {data} from './planets.js';
export const $=id=>document.getElementById(id);
export function createUI(persistence,callbacks,reduced){
 const {state,save}=persistence;let focused=-1,sequence=[],timer;
 const labels=data.map((d,i)=>{const b=document.createElement('button');b.className='planet-label';b.hidden=true;b.innerHTML=`${d.name}<small>${d.tag}</small>`;b.onclick=()=>callbacks.focus(i);$('labels').append(b);return b;});
 function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>$('toast').classList.remove('visible'),5200);}
 function secret(id,text){if(!state.secrets.includes(id)){state.secrets.push(id);save();toast(text);}}
 function progress(){$('progress').textContent=`已拾起 ${state.seen.filter(i=>i<5).length} / 5 段星光`;}
 function dismiss(){$('intro').classList.add('dismissed');setTimeout(()=>$('intro').hidden=true,1550);}
 function showPlanet(i,record=true){
  focused=i;labels.forEach(b=>b.hidden=true);dismiss();document.body.classList.add('focused','exploring');document.body.classList.remove('inside');$('story').hidden=false;$('world-panel').hidden=true;
  const d=data[i];$('story-index').textContent=d.tag;$('story-title').textContent=d.name;$('story-en').textContent=d.en;$('story-text').textContent=d.story;$('action').textContent=d.action+' ↗';$('response').textContent='';
  $('enter').disabled=i!==1;$('enter').textContent=i===1?'进入星球 · 安静海 ↗':'星球内部 · 待开发';
  if(record){if(!state.seen.includes(i))state.seen.push(i);if(sequence.at(-1)!==i)sequence.push(i);sequence=sequence.slice(-3);if(sequence.join(',')==='0,1,2')secret('letter','星光连成了一句话。新的留言已收进星光手记。');if(i===5)secret('return','你找到了归来的光。宇宙记得你的第二次抵达。');save();progress();}
 }
 function home(){focused=-1;document.body.classList.remove('focused','inside','exploring');$('story').hidden=true;$('world-panel').hidden=true;}
 function inside(){document.body.classList.add('inside');$('story').hidden=true;$('world-panel').hidden=false;labels.forEach(b=>b.hidden=true);}
 $('back').onclick=callbacks.home;$('overview').onclick=callbacks.home;$('world-back').onclick=callbacks.leave;
 $('enter').onclick=callbacks.enter;$('action').onclick=()=>{$('response').textContent=data[focused].response;callbacks.action(focused);};
 $('wander').onclick=()=>{dismiss();document.body.classList.add('exploring');};$('help').onclick=()=>$('instructions').showModal();$('skip').onclick=dismiss;
 if(state.visits>1||reduced)$('intro').hidden=true;else setTimeout(dismiss,5200);
 const secretText={letter:'时间 → 海 → 信｜「不论时间把我们带向哪里，你都是我愿意返回的坐标。」',return:'归来的光｜原来，被记得也是一种发光。',mirror:'镜外之星｜那一点光忽然展开，成为另一片花园。原来两个世界，共用同一个春天。'};
 $('journal').onclick=()=>{$('entries').replaceChildren();for(const i of state.seen){if(!data[i])continue;const e=document.createElement('div');e.className='entry';e.textContent=data[i].name;const s=document.createElement('span');s.textContent=data[i].en;e.append(s);$('entries').append(e);}for(const key of state.secrets){const e=document.createElement('div');e.className='entry';e.textContent=secretText[key]||'';$('entries').append(e);}if(!state.seen.length)$('entries').textContent='手记还空着。去靠近一颗星球吧。';$('storage-note').textContent=persistence.available?'探索记录只保存在这台设备的浏览器中。':'本地存储不可用，本次探索可继续，但关闭后不会保存。';$('notebook').showModal();};
 document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
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
   x=THREE.MathUtils.clamp(x,75,w-75);let box;
   for(let tries=0;tries<5;tries++){box={left:x-70,right:x+70,top:y-20,bottom:y+20};const overlaps=r=>box.left<r.right&&box.right>r.left&&box.top<r.bottom&&box.bottom>r.top;if(!used.some(overlaps)&&!(titleRect&&overlaps(titleRect)))break;y+=43;}
   if(y>h-100||y<105||used.some(r=>box.left<r.right&&box.right>r.left&&box.top<r.bottom&&box.bottom>r.top)){b.hidden=true;return;}
   used.push(box);b.style.left=x+'px';b.style.top=y+'px';
  });
 }
 progress();return {toast,secret,showPlanet,home,inside,dismiss,updateLabels};
}
