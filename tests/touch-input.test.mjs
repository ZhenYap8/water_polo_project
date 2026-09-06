import test from 'node:test';
import assert from 'node:assert/strict';
import {stickVector,shotTarget} from '../app/touch-input.mjs';
test('joystick deadzone and bounded diagonal speed',()=>{assert.deepEqual(stickVector(3,4),{x:0,y:0});const v=stickVector(100,100);assert.ok(Math.abs(Math.hypot(v.x,v.y)-1)<1e-10);assert.equal(v.x,v.y);assert.ok(stickVector(20,0).x<1)});
test('shot aiming stays within the goal corners',()=>{assert.deepEqual(shotTarget(0),{x:1120,y:310});assert.equal(shotTarget(-500).y,276);assert.equal(shotTarget(500).y,344)});
