import * as THREE from '../vendor/three.module.js';

// Distant light is camera-relative; dust and debris remain in world space.
// Every layer is decorative and deliberately absent from the picking list.
export function createEnvironment(){
 const far=new THREE.Group(),local=new THREE.Group();far.name='distant-sky';local.name='interstellar-matter';
 let seed=30617;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const normal=new THREE.Vector3(.5,.85,.12).normalize(),axis=new THREE.Vector3(0,0,-1).projectOnPlane(normal).normalize(),cross=new THREE.Vector3().crossVectors(normal,axis);
 function hash(x,y,z){let h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(z,1274126177);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295;}
 function noise(x,y,z){const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z);let a=x-ix,b=y-iy,c=z-iz;a=a*a*(3-2*a);b=b*b*(3-2*b);c=c*c*(3-2*c);let sum=0;for(let i=0;i<2;i++)for(let j=0;j<2;j++)for(let k=0;k<2;k++)sum+=hash(ix+i,iy+j,iz+k)*(i?a:1-a)*(j?b:1-b)*(k?c:1-c);return sum;}
 const width=768,height=384,pixels=new Uint8Array(width*height*4),d=new THREE.Vector3();
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const theta=y/(height-1)*Math.PI,phi=x/(width-1)*Math.PI*2;
  d.set(-Math.cos(phi)*Math.sin(theta),Math.cos(theta),Math.sin(phi)*Math.sin(theta));
  const lat=d.dot(normal),longitude=Math.atan2(d.dot(cross),d.dot(axis));
  const coarse=noise(d.x*5+11,d.y*5,d.z*5),fine=noise(d.x*24,d.y*24+7,d.z*24);
  const bend=.025*Math.sin(longitude*4)+.025*(coarse-.5),spread=.065+.06*coarse;
  const band=Math.exp(-Math.pow((lat-bend)/spread,2))*(.25+.75*coarse);
  const halo=Math.exp(-Math.pow(lat/.25,2))*.16;
  const lane=Math.exp(-Math.pow((lat-bend+.018+.025*Math.sin(longitude*9))/.027,2));
  const dust=1-.88*lane*(.45+.55*fine),cloud=(band+halo)*dust*(.35+.9*fine);
  const warm=Math.pow(Math.max(0,d.dot(axis)),12);
  const i=(y*width+x)*4;
  pixels[i]=3+cloud*(48+warm*17);pixels[i+1]=5+cloud*(53+warm*12);pixels[i+2]=11+cloud*76;pixels[i+3]=255;
 }
 const texture=new THREE.DataTexture(pixels,width,height);texture.needsUpdate=true;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearFilter;
 const sky=new THREE.Mesh(new THREE.SphereGeometry(150,48,24),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,uniforms:{map:{value:texture}},vertexShader:'varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform sampler2D map;varying vec3 direction;void main(){vec3 d=normalize(direction);float u=atan(d.z,-d.x)/6.2831853;if(u<0.)u+=1.;gl_FragColor=texture2D(map,vec2(u,acos(clamp(d.y,-1.,1.))/3.14159265));}'}));sky.renderOrder=-100;far.add(sky);
 function points(positions,colors,sizes,world=false){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('size',new THREE.Float32BufferAttribute(sizes,1));const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:world,blending:THREE.AdditiveBlending,uniforms:{pixelRatio:{value:1}},vertexShader:`attribute float size;attribute vec3 color;varying vec3 tint;uniform float pixelRatio;void main(){tint=color;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(size*pixelRatio${world?'*100./max(3.,-p.z)':''},1.,48.);}`,fragmentShader:'varying vec3 tint;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float a=exp(-r*r*5.)*(1.-smoothstep(.65,1.,r));gl_FragColor=vec4(tint,a);}'});return new THREE.Points(g,m);}
 const positions=[],colors=[],sizes=[];
 for(let i=0;i<7200;i++){
  if(random()<.58){const a=random()*Math.PI*2,b=(random()+random()+random()-1.5)*.16;d.copy(axis).multiplyScalar(Math.cos(a)).addScaledVector(cross,Math.sin(a)).addScaledVector(normal,b).normalize();}
  else {const y=random()*2-1,a=random()*Math.PI*2;d.set(Math.sqrt(1-y*y)*Math.cos(a),y,Math.sqrt(1-y*y)*Math.sin(a));}
  positions.push(...d.clone().multiplyScalar(145).toArray());const brightness=.20+Math.pow(random(),5)*.75,warm=random()<.13;colors.push(brightness*(warm?1:.78),brightness*.85,brightness*(warm?.68:1));sizes.push(1.15+Math.pow(random(),6)*2.5);
 }
 const stars=points(positions,colors,sizes);stars.material.depthTest=true;stars.renderOrder=-99;far.add(stars);
 const dp=[],dc=[],ds=[];
 // Broken, broad clouds at distinct depths; soft points instead of transparent billboards.
 const clouds=[[-19,8,-27],[22,-10,-36],[-16,-6,5]];
 for(let i=0;i<1100;i++){const c=clouds[i%3],x=(random()+random()-1)*19,y=(random()+random()-1)*5,z=(random()+random()-1)*11;dp.push(c[0]+x,c[1]+y,c[2]+z);dc.push(.013,.019,.032);ds.push(3+random()*6);}
 const mist=points(dp,dc,ds,true);local.add(mist);
 const np=[],nc=[],ns=[];
 for(let i=0;i<380;i++){const a=random()*Math.PI*2,y=random()*2-1,r=12+random()*55;np.push(Math.cos(a)*Math.sqrt(1-y*y)*r,y*r,Math.sin(a)*Math.sqrt(1-y*y)*r);nc.push(.11,.13,.16);ns.push(.08+random()*.15);}
 const dust=points(np,nc,ns,true);local.add(dust);
 const material=new THREE.MeshStandardMaterial({color:0x647078,roughness:1,metalness:.05});
 local.add(new THREE.AmbientLight(0x7386a8,.35));const sun=new THREE.DirectionalLight(0xd8d3bf,1.3);sun.position.set(-10,10,16);local.add(sun);
 const rocks=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),material,140),dummy=new THREE.Object3D();
 for(let i=0;i<140;i++){const a=-.8+random()*1.7;dummy.position.set(-12+Math.cos(a)*7+(random()-.5)*2,-4+Math.sin(a)*3+(random()-.5),-14+Math.sin(a)*9);dummy.rotation.set(random()*6,random()*6,random()*6);const r=.025+Math.pow(random(),3)*.16;dummy.scale.set(r,r*.7,r*1.3);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);}local.add(rocks);
 const moons=[];for(const [x,y,z,r] of [[6.9,1.9,3.8,.22],[9.3,-1.9,-4.8,.13]]){const moon=new THREE.Mesh(new THREE.IcosahedronGeometry(r,2),material);moon.position.set(x,y,z);local.add(moon);moons.push(moon);}
 return {far,local,stars,mist,dust,rocks,moons,update(camera){if(camera)far.position.copy(camera.position);},setQuality(low,pixelRatio=1){stars.geometry.setDrawRange(0,low?2400:7200);mist.geometry.setDrawRange(0,low?300:1100);dust.geometry.setDrawRange(0,low?100:380);rocks.count=low?45:140;for(const p of [stars,mist,dust])p.material.uniforms.pixelRatio.value=pixelRatio;}};
}
