import * as THREE from '../vendor/three.module.js';
export function createCloseup(renderer) {
const target=new THREE.WebGLRenderTarget(1,1);target.depthTexture=new THREE.DepthTexture(1,1);
const postScene=new THREE.Scene(),postCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
const postMaterial=new THREE.ShaderMaterial({uniforms:{image:{value:target.texture},depth:{value:target.depthTexture},pixel:{value:new THREE.Vector2(1,1)},focal:{value:10},amount:{value:0}},vertexShader:'varying vec2 uvOut;void main(){uvOut=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`varying vec2 uvOut;uniform sampler2D image;uniform sampler2D depth;uniform vec2 pixel;uniform float focal;uniform float amount;float distanceAt(vec2 uv){float z=texture2D(depth,uv).r*2.-1.;return 36./(180.1-z*179.9);}void main(){float d=distanceAt(uvOut);float blur=clamp((d-focal-1.)*.35,0.,2.5)*amount;vec2 p=pixel*blur;vec4 c=texture2D(image,uvOut)*.28;c+=texture2D(image,uvOut+p)*.09;c+=texture2D(image,uvOut-p)*.09;c+=texture2D(image,uvOut+vec2(p.x,-p.y))*.09;c+=texture2D(image,uvOut+vec2(-p.x,p.y))*.09;c+=texture2D(image,uvOut+vec2(p.x*1.5,0.))*.09;c+=texture2D(image,uvOut-vec2(p.x*1.5,0.))*.09;c+=texture2D(image,uvOut+vec2(0.,p.y*1.5))*.09;c+=texture2D(image,uvOut-vec2(0.,p.y*1.5))*.09;gl_FragColor=c;}`});
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),postMaterial));

return {
 resize(){const size=renderer.getDrawingBufferSize(new THREE.Vector2());target.setSize(size.x,size.y);postMaterial.uniforms.pixel.value.set(1/size.x,1/size.y);},
 render(scene,camera,center,low){if(low){renderer.render(scene,camera);return;}postMaterial.uniforms.focal.value=camera.position.distanceTo(center);postMaterial.uniforms.amount.value=1;renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(postScene,postCamera);}
};
}
export function closeupView(planet, camera, target, mobile=false){
 const center=planet.group.position.clone();
 const direction=camera.position.clone().sub(target).normalize();
 return {target:center,position:center.clone().addScaledVector(direction,planet.ball.scale.x*(mobile?5.8:4.6))};
}
