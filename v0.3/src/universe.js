import * as THREE from '../vendor/three.module.js';
import {createEnvironment} from './environment.js';
import {data} from './planets.js';
export function createUniverse(visits) {
const scene=new THREE.Scene(),planets=[],pickable=[],petals=[];
const noise=`float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);} float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);} float fbm(vec3 p){float v=0.;float a=.5;for(int i=0;i<5;i++){v+=noise(p)*a;p=p*2.03+3.7;a*=.5;}return v;}`;
const vertex=`varying vec3 vP;varying vec3 vN;varying vec3 vW;void main(){vP=position;vN=normalize(mat3(modelMatrix)*normal);vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
function surface(d){return new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uType:{value:d.type},uColor:{value:new THREE.Color(d.color)},uFade:{value:1}},vertexShader:vertex,fragmentShader:`precision highp float;varying vec3 vP;varying vec3 vN;varying vec3 vW;uniform float uTime;uniform int uType;uniform vec3 uColor;uniform float uFade;${noise}
void main(){vec3 p=normalize(vP);float n=fbm(p*5.);float fine=fbm(p*32.);vec3 c=uColor;
if(uType==0){float bands=sin(p.y*45.+n*16.);c=mix(vec3(.19,.13,.09),vec3(.79,.63,.38),smoothstep(-1.,1.,bands)*.5+n*.55);c+=fine*.14;}
if(uType==1){float waves=fbm(p*7.+vec3(uTime*.018,0,0));c=mix(vec3(.012,.055,.13),vec3(.13,.48,.52),smoothstep(.3,.72,waves));c+=vec3(.16,.24,.25)*pow(fine,4.)*3.;}
if(uType==2){float mist=fbm(p*4.+vec3(0,uTime*.009,0));c=mix(vec3(.14,.10,.25),vec3(.65,.52,.72),mist);c+=pow(fbm(p*11.),3.)*.25;}
if(uType==3){float cracks=abs(sin(n*35.));c=mix(vec3(.16,.23,.30),vec3(.72,.77,.80),smoothstep(.09,.3,cracks));c*=.55+fine*.65;}
if(uType==4){c=mix(vec3(.025,.15,.13),vec3(.32,.54,.36),n);c=mix(c,vec3(.68,.38,.48),smoothstep(.59,.72,fbm(p*9.)));c+=fine*.1;}
float light=max(dot(normalize(vN),normalize(vec3(-.65,.65,1.))),0.);vec3 view=normalize(cameraPosition-vW);float rim=pow(1.-max(dot(normalize(vN),view),0.),3.);vec3 col=c*(.055+light*.95)+uColor*rim*.23;float spec=pow(max(dot(reflect(-normalize(vec3(-.65,.65,1.)),normalize(vN)),view),0.),32.);if(uType==1||uType==3)col+=spec*.22;gl_FragColor=vec4(col*uFade,1.);}`} );}
const sphere=new THREE.SphereGeometry(1,64,48);
for(let i=0;i<data.length;i++){const d=data[i];const group=new THREE.Group();group.position.fromArray(d.pos);scene.add(group);const mat=surface(d);const ball=new THREE.Mesh(sphere,mat);ball.scale.setScalar(d.r);group.add(ball);ball.userData.index=i;pickable.push(ball);
const glow=new THREE.Mesh(new THREE.SphereGeometry(d.r*1.045,48,32),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:vertex,uniforms:{color:{value:new THREE.Color(d.color)}},fragmentShader:`varying vec3 vN;varying vec3 vW;uniform vec3 color;void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(cameraPosition-vW))),3.5);gl_FragColor=vec4(color,f*.16);}`}));group.add(glow);
planets.push({group,ball,mat,glow});if(i===5)group.visible=visits>1;}

// Fine, physically placed debris rings: gaps remain transparent, and the sphere occludes their far side.
const ringGroup=new THREE.Group();ringGroup.rotation.set(1.13,.25,-.32);planets[0].group.add(ringGroup);
for(let i=0;i<7;i++){const ring=new THREE.Mesh(new THREE.RingGeometry(2.65+i*.15,2.68+i*.15,180),new THREE.MeshBasicMaterial({color:i%2?0x8d795c:0xd0bc91,transparent:true,opacity:i%2?.12:.27,side:THREE.DoubleSide,depthWrite:false}));ringGroup.add(ring);}
let seed=892;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const environment=createEnvironment();scene.add(environment.far,environment.local);
const ra=[];for(let i=0;i<1800;i++){let a=rand()*Math.PI*2,r=2.5+rand()*1.25;ra.push(Math.cos(a)*r,Math.sin(a)*r,(rand()-.5)*.035);}const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(ra,3));ringGroup.add(new THREE.Points(rg,new THREE.PointsMaterial({color:0xdbc79b,size:.018,transparent:true,opacity:.6})));
for(let i=0;i<36;i++){const petal=new THREE.Mesh(new THREE.SphereGeometry(.035+rand()*.045,6,4),new THREE.MeshBasicMaterial({color:i%3?0xc6a3b0:0x91c1aa,transparent:true,opacity:.7}));petal.scale.set(1,2.8,.5);petal.userData={a:rand()*6.28,r:1.2+rand()*.65,y:(rand()-.5)*1.3};planets[4].group.add(petal);petals.push(petal);}
const anomaly=new THREE.Mesh(new THREE.OctahedronGeometry(.075),new THREE.MeshBasicMaterial({color:0xc7e3ee}));anomaly.position.set(1.1,.25,.35);planets[3].group.add(anomaly);anomaly.userData.secret=true;const anomalyHit=new THREE.Mesh(new THREE.SphereGeometry(.23,8,6),new THREE.MeshBasicMaterial({visible:false}));anomalyHit.position.copy(anomaly.position);planets[3].group.add(anomalyHit);pickable.push(anomalyHit);
const colliders=planets.filter(p=>p.group.visible).map(p=>({center:p.group.position,radius:data[p.ball.userData.index].r}));
function update(dt,time,focused,reduced,secrets,camera){
 environment.update(camera);
 planets.forEach((p,i)=>{p.ball.rotation.y+=reduced?0:dt*.025;p.mat.uniforms.uTime.value=time;const fade=focused<0||focused===i?1:.24;p.mat.uniforms.uFade.value=THREE.MathUtils.lerp(p.mat.uniforms.uFade.value,fade,.04);p.glow.visible=focused<0||focused===i;});
 ringGroup.rotation.z=-.32+Math.sin(time*.04)*.025;

 petals.forEach(p=>{const d=p.userData,a=d.a+time*.09;p.position.set(Math.cos(a)*d.r,d.y+Math.sin(a*2)*.18,Math.sin(a)*d.r);p.rotation.z=a;});
 anomaly.rotation.y=time*.2;anomaly.material.color.set(secrets.includes('mirror')?0xe9bad3:0xc7e3ee);anomaly.scale.setScalar(secrets.includes('mirror')?3:1);
}
return {scene,planets,pickable,colliders,anomalyHit,petals,update,environment,setQuality(low,pixelRatio){environment.setQuality(low,pixelRatio);}};
}
