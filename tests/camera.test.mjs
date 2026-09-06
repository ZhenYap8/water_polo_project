import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera,Vector3} from 'three';
import {fitCamera} from '../app/camera.mjs';
for(const mode of ['overhead','broadcast','endline'])test(`${mode} frames both goals at mobile and desktop sizes`,()=>{for(const aspect of [.35,390/844,1.2,1100/620,2.1,3.2]){const camera=new PerspectiveCamera(43,aspect,.1,160);fitCamera(camera,mode,aspect);camera.updateMatrixWorld();for(const x of [-14.2,14.2])for(const z of [-11.3,11.3]){const p=new Vector3(x,1,z).project(camera);assert.ok(Math.abs(p.x)<.97);assert.ok(Math.abs(p.y)<.95);assert.ok(p.z<1)}}});
