import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,step,release,switchPlayer,tackle,canSteal} from '../app/engine.mjs';
const run=(g,seconds,input={})=>{for(let i=0;i<seconds*120;i++)step(g,1/120,input)};
test('starts with two teams, possession, and a stopped clock',()=>{const g=createGame();run(g,1);assert.equal(g.players.length,14);assert.equal(g.time,90);assert.equal(g.ball.owner,1)});
test('movement, switching and pause',()=>{const g=createGame();g.phase='playing';const x=g.players[1].x;run(g,.3,{x:1});assert.ok(g.players[1].x>x);switchPlayer(g);assert.notEqual(g.selected,1);g.phase='paused';const time=g.time;run(g,2);assert.equal(g.time,time)});
test('passing reaches teammate and transfers selection',()=>{const g=createGame();g.phase='playing';g.aim={...g.players[2]};release(g,'pass');assert.equal(g.ball.owner,null);run(g,1);assert.equal(g.ball.owner,2);assert.equal(g.selected,2)});
test('shot scores, then restarts with opponent',()=>{const g=createGame();g.phase='playing';g.players[1].x=1000;g.players[1].y=276;g.players[7].y=345;g.aim={x:1200,y:276};release(g,'shot',1);run(g,.2);assert.equal(g.score[0],1);run(g,2.1);assert.equal(g.ball.last,1);assert.equal(g.score[0],1)});
test('keeper intercepts shot',()=>{const g=createGame();g.phase='playing';g.players[1].x=950;g.players[1].y=310;g.aim={x:1200,y:310};release(g,'shot',1);run(g,.13);assert.equal(g.ball.owner,7);assert.equal(g.score[0],0)});
test('close tackle wins possession and shot clock turnover works',()=>{const g=createGame();g.phase='playing';g.ball.owner=8;g.ball.last=1;Object.assign(g.players[8],{x:450,y:310});tackle(g);assert.equal(g.ball.owner,1);g.shotClock=.01;run(g,.03);assert.equal(g.ball.last,1)});
test('CPU attacks and complete match terminates without invalid positions',()=>{const g=createGame();g.phase='playing';run(g,460);assert.equal(g.phase,'ended');assert.equal(g.time,0);assert.ok(g.score[1]>0);assert.ok(g.players.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)))});
test('analog input supports slow precise swimming',()=>{const slow=createGame(),fast=createGame();slow.phase=fast.phase='playing';run(slow,.5,{x:.25});run(fast,.5,{x:1});assert.ok(fast.players[1].x-slow.players[1].x>10)});
test('quarters advance and restart without consuming game time',()=>{const g=createGame();g.phase='playing';g.time=.005;step(g,.01);assert.equal(g.period,2);assert.equal(g.time,90);run(g,1);assert.equal(g.time,90);run(g,1.1);assert.equal(g.ball.last,1)});
test('shots rise and cannot be caught by a swimmer below the ball',()=>{const g=createGame();g.phase='playing';g.aim={x:1120,y:310};release(g,'shot',.5);run(g,.2);assert.ok(g.ball.height>.7);assert.equal(g.ball.owner,null)});
test('out-of-bounds produces a free throw, not a wall bounce',()=>{const g=createGame();g.phase='playing';Object.assign(g.ball,{owner:null,x:600,y:1,vx:0,vy:-100,height:.2,vz:0,shot:false,last:0,lock:1});run(g,.03);assert.equal(g.ball.last,1);assert.equal(g.restartType,'free')});
test('attacking rebound resets the clock to 18',()=>{const g=createGame();g.phase='playing';g.shotClock=3;Object.assign(g.ball,{owner:null,x:g.players[1].x,y:g.players[1].y,vx:0,vy:0,height:.2,vz:0,shot:true,rebounded:true,last:0,lock:0,source:4});run(g,.01);assert.equal(g.ball.owner,1);assert.ok(g.shotClock>17.98&&g.shotClock<=18)});
test('goal-area offside is confined to the rectangle',async()=>{const {inGoalArea}=await import('../app/engine.mjs');assert.equal(inGoalArea({team:0,x:1080,y:310}),true);assert.equal(inGoalArea({team:0,x:1080,y:100}),false);assert.equal(inGoalArea({team:0,x:800,y:310}),false)});
test('receiving ahead of the ball in the goal area awards the opponent a free throw',()=>{const g=createGame();g.phase='playing';Object.assign(g.players[2],{x:1055,y:320});g.players[7].y=270;Object.assign(g.ball,{owner:null,x:1055,y:320,vx:0,vy:0,height:.2,vz:0,shot:false,last:0,lock:0,source:1,sourceX:800});step(g,.001);assert.equal(g.ball.last,1);assert.match(g.message,/Goal-area infringement/)});
test('steals require the front of the carrier, including when the carrier turns',()=>{
 for(const facing of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]){
  const carrier={team:1,x:500,y:300,facingX:facing.x,facingY:facing.y};
  for(const [forward,side,expected] of [[30,0,true],[-30,0,false],[0,30,false],[0,-30,false],[20,25,false],[45,0,false],[0,0,false]]){
   const defender={team:0,x:500+facing.x*forward-facing.y*side,y:300+facing.y*forward+facing.x*side};
   assert.equal(canSteal(defender,carrier),expected);
  }
 }
});
test('manual tackles from the side or rear leave possession unchanged',()=>{
 for(const [x,y] of [[500,330],[530,300]]){
  const g=createGame();g.phase='playing';g.ball.owner=8;g.ball.last=1;
  Object.assign(g.players[8],{x:500,y:300});Object.assign(g.players[1],{x,y});
  tackle(g);assert.equal(g.ball.owner,8);
 }
});
test('CPU needs sustained frontal pressure and cannot steal from the side or back',()=>{
 for(const [dx,dy,expected] of [[30,0,1],[0,30,0],[-30,0,0]]){
  const g=createGame();g.phase='playing';const owner=g.players[1];owner.held=3;
  for(const p of g.players.filter(p=>p.team===1&&!p.keeper)){p.x=900;p.y=100;}
  Object.assign(g.players[8],{x:owner.x+dx,y:owner.y+dy});
  run(g,.2);assert.equal(g.ball.last,0,'CPU cannot steal instantly');
  run(g,.7);assert.equal(g.ball.last,expected);
 }
});
test('first-person facing determines which side is protected while stationary',()=>{
 const g=createGame();g.phase='playing';step(g,.01,{facing:{x:0,y:1}});
 assert.equal(g.players[1].facingX,0);assert.equal(g.players[1].facingY,1);
 const p=g.players[1];assert.equal(canSteal({team:1,x:p.x+30,y:p.y},p),false);
 assert.equal(canSteal({team:1,x:p.x,y:p.y+30},p),true);
});
