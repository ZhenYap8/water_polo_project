import test from 'node:test';
import assert from 'node:assert/strict';
import {createDesktopLook} from '../app/desktop-input.mjs';

function setup(request = 'success') {
  const doc = new EventTarget(), canvas = new EventTarget();
  canvas.ownerDocument = doc;
  let active = true, requests = 0, unlocks = 0, state;
  const looks = [];
  const emit = (target, type, props = {}) => {
    const event = new Event(type);
    for (const [key, value] of Object.entries(props)) Object.defineProperty(event, key, {value});
    target.dispatchEvent(event);
  };
  doc.exitPointerLock = () => { doc.pointerLockElement = null; emit(doc, 'pointerlockchange'); };
  if (request !== 'unsupported') canvas.requestPointerLock = () => {
    requests++;
    if (request === 'reject') return Promise.reject(new Error('Denied'));
    doc.pointerLockElement = canvas;
    emit(doc, 'pointerlockchange');
  };
  const input = createDesktopLook(canvas, {
    enabled: () => active, look: (x,y) => looks.push([x,y]),
    onState: value => { state = value; }, onUnlock: () => { unlocks++; active = false; },
  });
  return {doc,canvas,input,looks,emit,setActive: value => {active=value;},
    click: pointerType => emit(canvas,'pointerdown',{pointerType,button:0}),
    move: (x,y) => emit(doc,'mousemove',{target:canvas,clientX:x,clientY:y,movementX:x,movementY:y}),
    get requests(){return requests;},get unlocks(){return unlocks;},get state(){return state;}};
}

test('mouse moves the view without holding a button, then capture uses unbounded deltas', () => {
  const f=setup();f.move(10,10);f.move(15,7);assert.deepEqual(f.looks,[[5,-3]]);
  f.click('mouse');assert.equal(f.state.locked,true);
  f.move(1500,-20);f.move(1500,-20);
  assert.deepEqual(f.looks.slice(1),[[1500,-20],[1500,-20]]);
  f.input.dispose();
});
test('touch gestures never request desktop mouse capture', () => {
  const f=setup();f.click('touch');f.click('pen');assert.equal(f.requests,0);f.input.dispose();
});
test('Escape unlock pauses once and mouse movement stops until resumed', () => {
  const f=setup();f.click('mouse');f.doc.exitPointerLock();f.move(30,20);
  assert.equal(f.unlocks,1);assert.deepEqual(f.looks,[]);
  f.setActive(true);f.click('mouse');assert.equal(f.requests,2);assert.equal(f.state.locked,true);f.input.dispose();
});
test('pausing or changing camera releases the mouse without an extra pause callback', () => {
  const f=setup();f.click('mouse');f.setActive(false);f.input.sync();
  assert.equal(f.doc.pointerLockElement,null);assert.equal(f.unlocks,0);
  f.click('mouse');f.move(20,10);assert.equal(f.requests,1);assert.deepEqual(f.looks,[]);f.input.dispose();
});
test('unsupported and denied capture keep free mouse-look usable', async () => {
  for(const request of ['unsupported','reject']){
    const f=setup(request);f.click('mouse');await Promise.resolve();
    assert.equal(f.state.unavailable,true);f.move(4,6);f.move(9,8);
    assert.deepEqual(f.looks,[[5,2]]);f.input.dispose();
  }
});
test('leaving the canvas resets the hover origin and disposal removes input', () => {
  const f=setup();f.move(10,10);f.emit(f.canvas,'mouseleave');f.move(900,800);
  assert.deepEqual(f.looks,[]);f.click('mouse');f.input.dispose();f.move(20,10);f.click('mouse');
  assert.deepEqual(f.looks,[]);assert.equal(f.requests,1);assert.equal(f.doc.pointerLockElement,null);
});
