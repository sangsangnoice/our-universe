import * as THREE from '../vendor/three.module.js';
const UP=new THREE.Vector3(0,1,0),EPS=.18;
// Collision is checked along the entire camera movement segment, not only its endpoint.
export function constrainMovement(from,to,colliders){
 const result=to.clone(),delta=to.clone().sub(from);const length=delta.length();
 if(length>1e-8){const ray=new THREE.Ray(from,delta.clone().normalize());let limit=length;
  for(const c of colliders){const sphere=new THREE.Sphere(c.center,c.radius+EPS);if(sphere.containsPoint(from))continue;const hit=ray.intersectSphere(sphere,new THREE.Vector3());if(hit)limit=Math.min(limit,Math.max(0,from.distanceTo(hit)-.005));}
  result.copy(from).addScaledVector(ray.direction,limit);
 }
 for(const c of colliders){const offset=result.clone().sub(c.center),r=c.radius+EPS;if(offset.length()<r){if(offset.lengthSq()<1e-9)offset.set(0,0,1);result.copy(c.center).addScaledVector(offset.normalize(),r+.005);}}
 return result;
}
export class UniverseCamera {
 constructor(camera){this.camera=camera;this.target=new THREE.Vector3();this.goalTarget=new THREE.Vector3();this.spherical=new THREE.Spherical(24,Math.PI/2,0);this.goal=this.spherical.clone();this.colliders=[];this.min=1;this.max=65;this.minHeight=-Infinity;this.polarMax=Math.PI-.08;this.raycaster=new THREE.Raycaster();camera.up.copy(UP);}
 setColliders(colliders){this.colliders=colliders;}
 setView(position,target,instant=false){
  this.goalTarget.copy(target);this.goal.setFromVector3(position.clone().sub(target));this.goal.phi=THREE.MathUtils.clamp(this.goal.phi,.08,Math.PI-.08);
  // Take the shortest angular route on transitions across the longitude seam.
  this.goal.theta=this.spherical.theta+Math.atan2(Math.sin(this.goal.theta-this.spherical.theta),Math.cos(this.goal.theta-this.spherical.theta));
  
  if(instant){this.target.copy(target);this.spherical.copy(this.goal);this.camera.position.copy(position);this.camera.lookAt(target);this.camera.updateMatrixWorld();}
 }
 orbit(dx,dy){this.goal.theta-=dx*.005;this.goal.phi=THREE.MathUtils.clamp(this.goal.phi-dy*.005,.08,this.polarMax);}
 // Homothety about the hit point moves both camera and orbit target. The hit
 // remains on the same screen ray; target radius is independently bounded.
 zoomAt(ndc,delta,objects=[]){
  this.camera.updateMatrixWorld();this.raycaster.setFromCamera(ndc,this.camera);
  const hit=this.raycaster.intersectObjects(objects,false).find(h=>h.object.parent?.visible!==false);
  const normal=this.camera.getWorldDirection(new THREE.Vector3());
  const plane=new THREE.Plane().setFromNormalAndCoplanarPoint(normal,this.target);
  const anchor=hit?.point.clone()||this.raycaster.ray.intersectPlane(plane,new THREE.Vector3())||this.target.clone();
  const factor=THREE.MathUtils.clamp(Math.exp(THREE.MathUtils.clamp(delta,-200,200)*.0015),.74,1.35);
  const nextRadius=THREE.MathUtils.clamp(this.goal.radius*factor,this.min,this.max);
  const actual=nextRadius/this.goal.radius;
  this.goalTarget.sub(anchor).multiplyScalar(actual).add(anchor);
  // Keep exploration inside the sky volume, including empty-space zooming.
  this.goalTarget.clampLength(0,48);this.goal.radius=nextRadius;
  return anchor;
 }
 update(dt){
  const a=1-Math.exp(-Math.min(dt,.05)*6);
  this.target.lerp(this.goalTarget,a);this.spherical.radius=THREE.MathUtils.lerp(this.spherical.radius,this.goal.radius,a);
  this.spherical.theta=THREE.MathUtils.lerp(this.spherical.theta,this.goal.theta,a);this.spherical.phi=THREE.MathUtils.lerp(this.spherical.phi,this.goal.phi,a);
  const desired=new THREE.Vector3().setFromSpherical(this.spherical).add(this.target);desired.y=Math.max(this.minHeight,desired.y);
  // Sweep every frame segment to avoid tunnelling, including during camera flights.
  const safe=constrainMovement(this.camera.position,desired,this.colliders);
  if(safe.distanceToSquared(desired)>1e-8){
   // Slide along the contact tangent so a flight can route around an intervening body.
   for(const c of this.colliders){const n=safe.clone().sub(c.center);if(n.length()<c.radius+EPS+.03){n.normalize();const rest=desired.clone().sub(safe);rest.addScaledVector(n,-Math.min(0,rest.dot(n)));safe.copy(constrainMovement(safe,safe.clone().add(rest),this.colliders));}}
  }
  this.camera.position.copy(safe);this.camera.up.copy(UP);
  if(safe.distanceToSquared(this.target)>.0001)this.camera.lookAt(this.target);
  this.camera.updateMatrixWorld();
 }
 snapshot(){return {position:this.camera.position.clone(),target:this.target.clone()};}
}
