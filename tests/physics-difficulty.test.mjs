import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,setDifficulty,step,release,resetFormation,GOAL_MIN,GOAL_MAX} from '../app/engine.mjs';
import {waterHeight,advanceBallWater} from '../app/water.mjs';
import {goalkeeperIntent} from '../app/goalkeeper.mjs';
const run=(g,seconds)=>{for(let i=0;i<seconds*120;i++)step(g,1/120);};

test('difficulty defaults safely, changes without resetting the match, and survives restarts',()=>{
 const g=createGame();assert.equal(g.difficulty,'easy');g.score=[2,1];g.time=42;
 setDifficulty(g,'hard');assert.equal(g.difficulty,'hard');assert.deepEqual(g.score,[2,1]);assert.equal(g.time,42);
 resetFormation(g,1);assert.equal(g.difficulty,'hard');assert.equal(createGame(g.difficulty).difficulty,'hard');
 setDifficulty(g,'invalid');assert.equal(g.difficulty,'easy');
});
test('CPU carrier speed increases across difficulty levels while player speed stays the same',()=>{
 const distances=[],playerDistances=[];
 for(const difficulty of ['easy','normal','hard']){
  const g=createGame(difficulty);g.phase='playing';resetFormation(g,1);const x=g.players[8].x;run(g,.5);distances.push(x-g.players[8].x);
  const own=createGame(difficulty);own.phase='playing';const start=own.players[1].x;for(let i=0;i<60;i++)step(own,1/120,{x:1});playerDistances.push(own.players[1].x-start);
 }
 assert.ok(distances[0]<distances[1]&&distances[1]<distances[2]);
 assert.ok(Math.max(...playerDistances)-Math.min(...playerDistances)<.001);
});
test('hard CPU steals sooner but side and rear possession remain protected at every level',()=>{
 const times=[];
 for(const difficulty of ['easy','normal','hard']){
  for(const [dx,dy] of [[30,0],[0,30],[-30,0]]){
   const g=createGame(difficulty);g.phase='playing';g.players[1].held=3;
   for(const p of g.players.filter(p=>p.team===1&&!p.keeper)){p.x=950;p.y=100;}
   Object.assign(g.players[8],{x:g.players[1].x+dx,y:g.players[1].y+dy});
   let time=0;while(time<.95&&g.ball.last===0){step(g,1/120);time+=1/120;}
   if(dx===30){assert.equal(g.ball.last,1);times.push(time);}else assert.equal(g.ball.last,0);
  }
 }
 assert.ok(times[0]>times[1]&&times[1]>times[2]);
});
test('CPU shot spread produces more misses on easy than hard',()=>{
 const misses=[];
 for(const difficulty of ['easy','normal','hard']){
  let count=0;
  for(let i=0;i<60;i++){
   const g=createGame(difficulty);g.phase='playing';g.ball.owner=8;g.elapsed=i*.2;
   Object.assign(g.players[8],{x:220,y:310});release(g,'shot',.5);
   const y=g.ball.y+g.ball.vy*((-20-g.ball.x)/g.ball.vx);
   if(y<GOAL_MIN||y>GOAL_MAX)count++;
  }
  misses.push(count);
 }
 assert.ok(misses[0]>misses[1]&&misses[1]>misses[2]);
});
test('water adds local wakes without disturbing the distant pool',()=>{
 const wake={x:0,z:0,dx:1,dz:0,strength:.06,phase:1};
 assert.notEqual(waterHeight(.4,.1,1,[wake]),waterHeight(.4,.1,1));
 assert.equal(waterHeight(8,8,1,[wake]),waterHeight(8,8,1));
});
test('ball settles buoyantly and water drag slows it without reversing it',()=>{
 const ball={x:550,y:310,height:1,vz:0,vx:100,vy:30};
 for(let i=0;i<2400;i++)advanceBallWater(ball,1/240,i/240);
 const surface=waterHeight(0,0,10);
 assert.ok(Math.abs(ball.height-surface-.09)<.03);assert.ok(ball.vx>=0&&ball.vx<1);assert.ok(Number.isFinite(ball.vz));
 const air={x:550,y:310,height:5,vz:0,vx:100,vy:0};advanceBallWater(air,.01,0);assert.equal(air.vx,100);
});
test('goalkeeper raises hands, lunges both ways, jumps for high shots, and recovers',()=>{
 for(const target of [278,310,342]){
  const p={team:0,x:40,y:310},ball={owner:null,shot:true,last:1,x:240,y:target,vx:-700,vy:0,height:.9,vz:1};
  let peak=0,lean=0;
  for(let i=0;i<50;i++){goalkeeperIntent(p,ball,[],0,.01,{reaction:.07,speed:115});peak=Math.max(peak,p.goalkeeping.jump);if(Math.abs(p.goalkeeping.lean)>Math.abs(lean))lean=p.goalkeeping.lean;}
  assert.ok(peak>.5);assert.ok(p.goalkeeping.hands>.9);
  assert.equal(Math.sign(lean),Math.sign(target-310));
  for(let i=0;i<150;i++)goalkeeperIntent(p,{...ball,shot:false},[],0,.01,{reaction:.07,speed:115});
  assert.equal(p.goalkeeping.jump,0);assert.equal(p.goalkeeping.lean,0);assert.ok(p.goalkeeping.hands<.2);
 }
});
test('goalkeepers respect their reaction delay before moving toward a shot prediction',()=>{
 const ball={owner:null,shot:true,last:0,x:850,y:280,vx:700,vy:0,height:.5,vz:0};
 const easy={team:1,x:1060,y:310},hard={team:1,x:1060,y:310};
 for(let i=0;i<10;i++){goalkeeperIntent(easy,ball,[],0,.01,{reaction:.22,speed:85});goalkeeperIntent(hard,ball,[],0,.01,{reaction:.07,speed:125});}
 assert.equal(easy.goalkeeping.lunge,0);assert.ok(hard.goalkeeping.lunge>0);
});
