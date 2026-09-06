import * as THREE from 'three';

export function createStadium(scene:THREE.Scene) {
  const root=new THREE.Group();root.name='Pool stadium';scene.add(root);
  const geometries:THREE.BufferGeometry[]=[],materials:THREE.Material[]=[],instances:THREE.InstancedMesh[]=[];
  const mat=(color:string)=>{const m=new THREE.MeshStandardMaterial({color,roughness:.75});materials.push(m);return m;};
  const concrete=mat('#5a7281'),steps=mat('#93a7ae'),navy=mat('#103348'),trim=mat('#d4e9e9');
  const seatMaterial=mat('#ffffff'),crowdMaterial=mat('#ffffff');
  const glow=new THREE.MeshBasicMaterial({color:'#d9f9ff'});materials.push(glow);
  const cube=new THREE.BoxGeometry(1,1,1),head=new THREE.SphereGeometry(.115,6,4);geometries.push(cube,head);
  const batches=new Map<THREE.Object3D,Map<THREE.Material,THREE.Mesh[]>>();
  function box(parent:THREE.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,material:THREE.Material){
    const mesh=new THREE.Mesh(cube,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);if(!batches.has(parent))batches.set(parent,new Map());const batch=batches.get(parent)!;if(!batch.has(material))batch.set(material,[]);batch.get(material)!.push(mesh);return mesh;
  }
  box(root,0,-2,0,54,.25,48,concrete);
  const stands:{group:THREE.Group;outward:THREE.Vector3}[]=[];
  const transform=new THREE.Object3D(),colour=new THREE.Color();
  const shirts=['#e7f0f2','#268ccc','#ef6153','#d8dd80','#35587c','#a7ccd2'];
  const skins=['#dba782','#b97c53','#795241'];
  for(const [index,x,z,rotation,length] of [[0,0,14.2,0,34],[1,0,-14.2,Math.PI,34],[2,16.7,0,Math.PI/2,26],[3,-16.7,0,-Math.PI/2,26]]){
    const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=rotation;root.add(group);
    stands.push({group,outward:new THREE.Vector3(Math.sin(rotation),0,Math.cos(rotation))});
    const rows=8,columns=Math.floor(length/.68),count=rows*columns;
    const seats=new THREE.InstancedMesh(cube,seatMaterial,count*2);
    const bodies=new THREE.InstancedMesh(cube,crowdMaterial,count);
    const heads=new THREE.InstancedMesh(head,crowdMaterial,count);
    group.add(seats,bodies,heads);instances.push(seats,bodies,heads);
    let seatIndex=0,person=0;
    const place=(mesh:THREE.InstancedMesh,id:number,px:number,py:number,pz:number,sx:number,sy:number,sz:number,tint:string)=>{
      transform.position.set(px,py,pz);transform.scale.set(sx,sy,sz);transform.updateMatrix();mesh.setMatrixAt(id,transform.matrix);mesh.setColorAt(id,colour.set(tint));
    };
    for(let row=0;row<rows;row++){
      const height=.45+row*.48,depth=row*.85;
      box(group,0,height/2,depth,length,height,.85,concrete);
      box(group,0,height+.025,depth-.38,length,.05,.09,trim);
      for(let col=0;col<columns;col++){
        const sx=(col-(columns-1)/2)*.68;
        // Leave regular stair aisles open between seating sections.
        if(col%12===0||col%12===1){box(group,sx,height+.03,depth,.68,.06,.85,steps);continue;}
        const tint=index%2===0?(row%3===0?'#d8f0f2':'#2180b2'):(row%3===0?'#ffd5c9':'#bb4d49');
        place(seats,seatIndex++,sx,height+.23,depth,.49,.1,.48,tint);
        place(seats,seatIndex++,sx,height+.47,depth+.22,.49,.48,.08,tint);
        const seed=row*columns+col+index*117;
        if(seed%5===0)continue;
        place(bodies,person,sx,height+.48,depth-.03,.3,.4,.23,shirts[seed%shirts.length]);
        place(heads,person,sx,height+.8,depth-.04,1,1,1,skins[seed%skins.length]);person++;
      }
    }
    seats.count=seatIndex;bodies.count=heads.count=person;
    for(const mesh of [seats,bodies,heads]){mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;mesh.computeBoundingSphere();}
    // Low poolside fascia, rear concourse and open roof over the upper seating.
    box(group,0,.35,-.8,length,.7,.16,navy);
    box(group,0,.69,-.8,length,.055,.2,trim);
    for(let section=-length/2+2;section<length/2;section+=4){box(group,section,.36,-.9,2.8,.16,.02,index%2===0?trim:steps);}
    box(group,0,2.25,7,length,4.5,.35,navy);
    box(group,0,5.25,5.5,length+1,.22,4.3,navy);
    box(group,0,5.1,3.4,length+1,.14,.12,glow);
    for(const side of [-1,1]){
      box(group,side*(length/2-.4),2.65,6.7,.18,5.3,.18,trim);
      box(group,side*(length/2-2),6.1,5,.13,2,.13,trim);
      const lamp=box(group,side*(length/2-2),7,4.8,2.4,.7,.16,navy);lamp.rotation.x=-.25;
      for(let bulb=0;bulb<6;bulb++)box(group,side*(length/2-2)+(bulb-2.5)*.35,7,4.68,.27,.45,.05,glow);
    }
  }
  // Batch the entire static structure as well as seats and spectators for mobile GPUs.
  for(const [parent,batch] of batches)for(const [material,parts] of batch){const mesh=new THREE.InstancedMesh(cube,material,parts.length);parts.forEach((part,i)=>{part.updateMatrix();mesh.setMatrixAt(i,part.matrix);});mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();parent.add(mesh);instances.push(mesh);}
  const fill=new THREE.DirectionalLight('#b6e6ff',.8);fill.position.set(18,16,-14);root.add(fill);
  return {
    update(camera:THREE.Camera,firstPerson:boolean){
      // Cut away camera-side stands in tactical views so they never cover the pool.
      for(const stand of stands)stand.group.visible=firstPerson||camera.position.dot(stand.outward)<=1;
    },
    dispose(){scene.remove(root);instances.forEach(mesh=>mesh.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());},
  };
}
