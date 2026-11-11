import * as THREE from '../vendor/three.module.js';
// One deliberately small, separate world: an observation island in the Sea of Stillness.
export function createExploration(){
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x071620);scene.fog=new THREE.FogExp2(0x102b39,.027);
 scene.add(new THREE.HemisphereLight(0xa1ced8,0x13222b,2));
 const light=new THREE.DirectionalLight(0xe2cfb0,2);light.position.set(-8,12,5);scene.add(light);
 const water=new THREE.Mesh(new THREE.PlaneGeometry(160,160,64,64),new THREE.MeshStandardMaterial({color:0x194c5d,metalness:.55,roughness:.38,side:THREE.DoubleSide}));water.rotation.x=-Math.PI/2;water.position.y=-1.4;scene.add(water);
 const island=new THREE.Mesh(new THREE.CylinderGeometry(2.8,3.5,1.4,48),new THREE.MeshStandardMaterial({color:0x27353c,roughness:.9}));island.position.y=-1.4;scene.add(island);
 const archMaterial=new THREE.MeshStandardMaterial({color:0x8b9d9e,metalness:.25,roughness:.7});
 const arch=new THREE.Group();
 for(const x of [-1.2,1.2]){const pillar=new THREE.Mesh(new THREE.BoxGeometry(.22,2.8,.35),archMaterial);pillar.position.set(x,.6,0);arch.add(pillar);}
 const lintel=new THREE.Mesh(new THREE.BoxGeometry(2.62,.22,.35),archMaterial);lintel.position.y=2;arch.add(lintel);scene.add(arch);
 const moon=new THREE.Mesh(new THREE.SphereGeometry(2.8,40,24),new THREE.MeshBasicMaterial({color:0xa6b9c5}));moon.position.set(-12,13,-38);scene.add(moon);
 const motes=new THREE.Group();for(let i=0;i<32;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.025,6,4),new THREE.MeshBasicMaterial({color:0xb1d7da}));m.position.set(Math.sin(i*2.4)*7,1+(i%7)*.35,Math.cos(i*2.4)*7);motes.add(m);}scene.add(motes);
 const pos=water.geometry.attributes.position;
 return {scene,colliders:[{center:new THREE.Vector3(0,-1.4,0),radius:3.55}],position:new THREE.Vector3(9,5,13),target:new THREE.Vector3(0,.6,0),
 update(time){for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin(pos.getX(i)*.28+time*.35)*.12+Math.cos(pos.getY(i)*.35+time*.24)*.1);pos.needsUpdate=true;water.geometry.computeVertexNormals();motes.rotation.y=time*.025;}};
}
