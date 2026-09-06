import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Shared low-poly anatomy; each player has a small joint hierarchy for animation.
export function createSwimmerFactory(){
 const sphere=new THREE.SphereGeometry(1,12,8),limb=new THREE.CylinderGeometry(1,.82,1,8),capGeo=new THREE.SphereGeometry(1,12,8,0,Math.PI*2,0,Math.PI*.56);
 const eyeWhite=new THREE.MeshStandardMaterial({color:'#f4eee6',roughness:.45}),features=new THREE.MeshStandardMaterial({color:'#302a2a',roughness:.7});
 const geometries:THREE.BufferGeometry[]=[sphere,limb,capGeo];
 function shape(parent:THREE.Object3D,geometry:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number){const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh;}
 function create(skin:THREE.Material,capMaterial:THREE.Material,suit:THREE.Material,white:THREE.Material,id:number){
  const root=new THREE.Group(),body=new THREE.Group(),posture=new THREE.Group();root.add(body);body.add(posture);
  const build=1+(id%3-1)*.06;posture.scale.set(build,1+(id%4-1.5)*.02,1);
  shape(posture,sphere,skin,0,.35,0,.235,.27,.13); // rib cage and shoulders
  shape(posture,sphere,skin,0,.13,.015,.165,.22,.115);
  shape(posture,sphere,suit,0,-.025,.01,.18,.12,.125);
  shape(posture,limb,skin,0,.61,0,.062,.13,.062);
  const neck=new THREE.Group();neck.position.set(0,.67,0);posture.add(neck);
  shape(neck,sphere,skin,0,.1,0,.125,.165,.12);
  shape(neck,sphere,skin,0,.025,-.025,.098,.08,.102); // jaw
  shape(neck,capGeo,capMaterial,0,.115,.009,.13,.16,.125);
  shape(neck,sphere,skin,0,.085,-.118,.027,.035,.043);
  shape(neck,sphere,features,0,.018,-.117,.034,.006,.005);
  for(const side of [-1,1]){
   shape(neck,sphere,eyeWhite,side*.048,.12,-.108,.029,.014,.009);
   shape(neck,sphere,features,side*.048,.12,-.116,.009,.011,.005);
   shape(neck,sphere,features,side*.048,.147,-.11,.031,.006,.006);
   shape(neck,sphere,skin,side*.125,.07,0,.022,.042,.027);
   shape(neck,sphere,white,side*.14,.09,.005,.018,.048,.04);
   for(let hole=0;hole<3;hole++)shape(neck,sphere,features,side*.156,.072+hole*.016,.004,.003,.004,.009);
  }
  const arms:{shoulder:THREE.Group;elbow:THREE.Group;hand:THREE.Group}[]=[],legs:{hip:THREE.Group;knee:THREE.Group}[]=[];
  for(const side of [-1,1]){
   const shoulder=new THREE.Group();shoulder.position.set(side*.23,.48,0);posture.add(shoulder);
   shape(shoulder,sphere,skin,0,-.015,0,.087,.1,.086);
   shape(shoulder,limb,skin,0,-.15,0,.066,.3,.066);
   const elbow=new THREE.Group();elbow.position.y=-.3;shoulder.add(elbow);
   shape(elbow,sphere,skin,0,0,0,.055,.055,.055);
   shape(elbow,limb,skin,0,-.135,0,.05,.27,.049);
   const hand=new THREE.Group();hand.position.y=-.29;elbow.add(hand);
   shape(hand,sphere,skin,0,-.045,0,.044,.07,.022);
   shape(hand,sphere,skin,-side*.043,-.025,-.008,.017,.039,.016);
   arms.push({shoulder,elbow,hand});
   const hip=new THREE.Group();hip.position.set(side*.09,-.09,.01);posture.add(hip);
   shape(hip,limb,skin,0,-.19,0,.088,.38,.087);
   const knee=new THREE.Group();knee.position.y=-.38;hip.add(knee);
   shape(knee,sphere,skin,0,0,0,.061,.068,.061);
   shape(knee,limb,skin,0,-.18,0,.056,.36,.054);
   shape(knee,sphere,skin,0,-.38,-.05,.052,.045,.12);
   legs.push({hip,knee});
  }
  // Combine rigid detail within each joint to keep faces inexpensive on mobile.
  const joints:THREE.Object3D[]=[];root.traverse(object=>{if(object instanceof THREE.Group)joints.push(object);});
  for(const joint of joints){const batches=new Map<THREE.Material,THREE.Mesh[]>();for(const child of joint.children){if(child instanceof THREE.Mesh&&!Array.isArray(child.material)){if(!batches.has(child.material))batches.set(child.material,[]);batches.get(child.material)!.push(child);}}for(const [material,parts] of batches){if(parts.length<2)continue;const pieces=parts.map(part=>{part.updateMatrix();return part.geometry.clone().applyMatrix4(part.matrix);});const geometry=mergeGeometries(pieces);pieces.forEach(piece=>piece.dispose());if(geometry){geometries.push(geometry);parts.forEach(part=>joint.remove(part));joint.add(new THREE.Mesh(geometry,material));}}}
  return {root,body,posture,neck,arms,legs,
   hand:arms[1].hand,
   animate(time:number,speed:number,keeper:boolean,held:boolean,charge:number,save?:{hands:number;lean:number}){
    const swimming=keeper?0:THREE.MathUtils.clamp(speed/85,0,1);
    posture.rotation.x=-swimming*1.24;
    posture.position.y=-.4+swimming*.35;
    neck.rotation.x=swimming*.9;
    body.rotation.x=keeper?(save?.lean||0):0;
    posture.rotation.z=Math.sin(time*5+id)*.035*swimming;
    arms.forEach(({shoulder,elbow,hand},k)=>{
     const side=k===0?-1:1,phase=time*(swimming>0.2?5.5:3)+id+k*Math.PI;
     shoulder.rotation.set(swimming>0.2?phase%(Math.PI*2):Math.sin(phase)*.25,0,side*(.7-swimming*.45));
     elbow.rotation.x=swimming>0.2?-.35-Math.max(0,Math.sin(phase))*.9:-.8;
     hand.rotation.x=-.15;
     if(keeper){shoulder.rotation.x=-.2;shoulder.rotation.z=side*(.9+(save?.hands||0)*1.4);elbow.rotation.x=-.45;}
     if(held&&k===1&&charge>.05){shoulder.rotation.set(-2.1-charge*.35,0,.35);elbow.rotation.x=-1.1;hand.rotation.x=.35;}
    });
    legs.forEach(({hip,knee},k)=>{const phase=time*(swimming>.2?8:6)+id+k*Math.PI;hip.rotation.set(Math.sin(phase)*(swimming>.2?.28:.5),0,swimming>.2?0:Math.cos(phase)*.26);knee.rotation.x=.18+Math.max(0,Math.cos(phase))*(swimming>.2?.35:.8);});
   },
  };
 }
 return {create,dispose(){geometries.forEach(g=>g.dispose());eyeWhite.dispose();features.dispose();}};
}
