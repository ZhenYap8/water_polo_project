export const W=1100,H=620,TEAM_SIZE=7,PERIOD_SECONDS=90,POSSESSION_SECONDS=28,REBOUND_SECONDS=18;
export const GOAL_MIN=H/2-H*1.5/20,GOAL_MAX=H/2+H*1.5/20;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function createGame(){const g={players:[],ball:ownedBall({x:550,y:310,team:0,id:1}),selected:1,score:[0,0],time:PERIOD_SECONDS,period:1,shotClock:POSSESSION_SECONDS,phase:'ready',message:'Take the pool',charge:0,cooldown:0,elapsed:0,resetIn:0,aim:null,restartType:null};resetFormation(g,0);return g;}
function ownedBall(p){return {x:p.x+(p.team===0?18:-18),y:p.y,vx:0,vy:0,height:.2,vz:0,owner:p.id,source:p.id,sourceX:p.x,lock:.2,shot:false,last:p.team,flight:0};}
export function resetFormation(g,team){g.players=[];const xs=[440,330,330,250,250,440],ys=[310,140,480,245,375,525];for(let t=0;t<2;t++)for(let i=0;i<TEAM_SIZE;i++){const x=i===0?48:xs[i-1];g.players.push({id:t*TEAM_SIZE+i,team:t,keeper:i===0,x:t?W-x:x,y:i===0?310:ys[i-1],vx:0,vy:0,held:0});}g.ball=ownedBall(g.players[team*TEAM_SIZE+1]);g.selected=1;g.shotClock=POSSESSION_SECONDS;g.charge=0;g.aim=null;}
export function switchPlayer(g){const candidates=g.players.filter(p=>p.team===0&&!p.keeper&&p.id!==g.selected);candidates.sort((a,b)=>distance(a,g.ball)-distance(b,g.ball));g.selected=candidates[0].id;g.charge=0;}
export function inGoalArea(p){return (p.team===0?p.x>W-W*2/25:p.x<W*2/25)&&Math.abs(p.y-H/2)<H*3.58/20;}
function possession(g,p){if(g.ball.last!==p.team)g.shotClock=POSSESSION_SECONDS;else if(g.ball.shot)g.shotClock=REBOUND_SECONDS;g.ball=ownedBall(p);p.held=0;g.charge=0;if(p.team===0&&!p.keeper)g.selected=p.id;}
function freeThrow(g,team,x,y,message,keeper=false){const candidates=g.players.filter(p=>p.team===team&&(keeper?p.keeper:!p.keeper)).sort((a,b)=>distance(a,{x,y})-distance(b,{x,y}));const p=candidates[0];if(!keeper){p.x=clamp(x,35,W-35);p.y=clamp(y,30,H-30);}g.ball.last=1-team;possession(g,p);g.message=message;g.resetIn=.8;g.restartType='free';}
export function release(g,kind,power=.5){const p=g.players[g.ball.owner];if(!p||g.phase!=='playing'||g.resetIn>0)return;let target;if(kind==='pass'){const mates=g.players.filter(q=>q.team===p.team&&q.id!==p.id&&!q.keeper&&!((p.team===0?q.x>p.x:q.x<p.x)&&inGoalArea(q)));if(!mates.length)return;const cost=q=>distance(p,q)+(g.aim&&p.team===0?distance(q,g.aim)*.85:((p.team===0?-q.x:q.x)*.4));target=mates.sort((a,b)=>cost(a)-cost(b))[0];}else target=p.team===0?(g.aim||{x:W+20,y:clamp(p.y,GOAL_MIN+8,GOAL_MAX-8)}):{x:-20,y:310+Math.sin(g.elapsed*2)*35};const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy)||1,speed=kind==='pass'?490:650+power*370,t=Math.max(.12,(d-24)/speed),height=.55,endHeight=kind==='pass'?.35:(target.height??.45);g.ball={x:p.x+dx/d*24,y:p.y+dy/d*24,vx:dx/d*speed,vy:dy/d*speed,height,vz:(endHeight-height)/t+4.9*t,owner:null,source:p.id,sourceX:p.x,lock:.11,shot:kind!=='pass',last:p.team,flight:0};g.charge=0;}
export function tackle(g){if(g.cooldown>0||g.phase!=='playing'||g.resetIn>0)return;g.cooldown=.65;const p=g.players[g.selected],owner=g.players[g.ball.owner];if(owner&&owner.team!==0&&distance(p,owner)<44){possession(g,p);g.message='Clean steal · Blue possession';}}
function move(p,x,y,speed,dt){const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy),factor=1-Math.exp(-dt*9),vx=d>3?dx/d*speed:0,vy=d>3?dy/d*speed:0;p.vx+=(vx-p.vx)*factor;p.vy+=(vy-p.vy)*factor;p.x=clamp(p.x+p.vx*dt,22,W-22);p.y=clamp(p.y+p.vy*dt,22,H-22);}
export function attackingPosition(p,carrier){const i=p.id%TEAM_SIZE-1,dir=p.team===0?1:-1;const angle=(-70+i*28)*Math.PI/180,anchor=p.team===0?W-110:110;const advance=clamp((p.team===0?carrier.x:W-carrier.x)/800,0,1);return {x:clamp((carrier.x+dir*45)*(1-advance)+(anchor-dir*Math.cos(angle)*210)*advance,110,W-110),y:H/2+Math.sin(angle)*230};}
export function step(g,dt,input={}){if(g.phase!=='playing')return;dt=Math.min(dt,.033);g.elapsed+=dt;g.cooldown=Math.max(0,g.cooldown-dt);g.ball.lock=Math.max(0,g.ball.lock-dt);
 if(g.resetIn>0){g.resetIn=Math.max(0,g.resetIn-dt);if(g.resetIn===0){if(g.restartType==='goal'||g.restartType==='period'){resetFormation(g,g.kickoff);g.message=g.kickoff?'Red possession':'Blue possession';}g.restartType=null;}return;}
 g.time=Math.max(0,g.time-dt);if(g.time<=0){if(g.period===4){g.phase='ended';g.message=g.score[0]===g.score[1]?'A hard-fought draw':g.score[0]>g.score[1]?'You win!':'CPU wins';return;}g.period++;g.time=PERIOD_SECONDS;g.kickoff=(g.period-1)%2;g.restartType='period';g.resetIn=2;g.message=`Quarter ${g.period} · ${g.kickoff?'Red':'Blue'} starts`;return;}
 if(!g.ball.shot||g.ball.owner!==null)g.shotClock-=dt;if(g.shotClock<=0){freeThrow(g,1-g.ball.last,g.ball.x,g.ball.y,'Shot clock · possession changed');return;}
 let owner=g.players[g.ball.owner];if(input.charge&&owner?.id===g.selected)g.charge=Math.min(1,g.charge+dt*.85);
 for(const p of g.players){const dir=p.team===0?1:-1,ours=owner?.team===p.team;
 if(p.keeper){const projected=g.ball.owner===null&&g.ball.shot?g.ball.y+g.ball.vy*.07:g.ball.y;move(p,p.team===0?40:W-40,clamp(projected,GOAL_MIN+6,GOAL_MAX-6),115,dt);if(owner===p){p.held+=dt;if(p.held>.65)release(g,'pass');}continue;}
 if(p.team===0&&p.id===g.selected){const dx=input.x||0,dy=input.y||0,n=Math.hypot(dx,dy)||1;move(p,p.x+dx/n*100,p.y+dy/n*100,(owner===p?118:147)*Math.min(1,Math.hypot(dx,dy)),dt);continue;}
 if(owner===p){p.held+=dt;move(p,p.team===0?W-180:180,310+Math.sin(g.elapsed*.8+p.id)*65,103,dt);if(p.team===1){if((p.x<300&&p.held>1.1)||p.held>5.5)release(g,'shot',.65);else if(p.held>1.5&&g.players.some(q=>q.team!==p.team&&distance(q,p)<62))release(g,'pass');}continue;}
 let tx,ty;if(!owner){const ordered=g.players.filter(q=>q.team===p.team&&!q.keeper).sort((a,b)=>distance(a,g.ball)-distance(b,g.ball));if(ordered.indexOf(p)<2){tx=g.ball.x+g.ball.vx*.08;ty=g.ball.y+g.ball.vy*.08;}else{const a=attackingPosition(p,g.ball);tx=a.x;ty=a.y;}}
 else if(ours){const a=attackingPosition(p,owner);tx=a.x;ty=a.y;}
 else{const defenders=g.players.filter(q=>q.team===p.team&&!q.keeper).sort((a,b)=>distance(a,owner)-distance(b,owner));if(defenders[0]===p){tx=owner.x;ty=owner.y;if(p.team===1&&distance(p,owner)<29&&owner.held>1.5){possession(g,p);owner=p;g.message='Red wins possession';}}else{const mark=g.players[(1-p.team)*TEAM_SIZE+(p.id%TEAM_SIZE)];tx=mark.x-dir*45;ty=mark.y;}}move(p,tx,ty,ours?110:115,dt);
 }
 owner=g.players[g.ball.owner];if(owner?.team===0)owner.held+=dt;
 for(let i=0;i<g.players.length;i++)for(let j=i+1;j<g.players.length;j++){const a=g.players[i],b=g.players[j],d=distance(a,b);if(d>0&&d<25){const dx=(a.x-b.x)/d,dy=(a.y-b.y)/d,push=(25-d)*.5;a.x+=dx*push;a.y+=dy*push;b.x-=dx*push;b.y-=dy*push;}}
 const b=g.ball,carrier=g.players[b.owner];if(carrier){b.x=carrier.x+(carrier.team===0?18:-18);b.y=carrier.y;return;}
 for(let n=0;n<6;n++){const sub=dt/6;b.x+=b.vx*sub;b.y+=b.vy*sub;b.height+=b.vz*sub;b.vz-=9.8*sub;b.flight+=sub;if(b.height<.13){b.height=.13;b.vz=Math.max(0,-b.vz*.2);b.vx*=Math.pow(.97,sub*60);b.vy*=Math.pow(.97,sub*60);}
 if(b.y<0||b.y>H){freeThrow(g,1-b.last,clamp(b.x,40,W-40),clamp(b.y,25,H-25),'Sideline throw · possession changed');return;}
 if(b.x<0||b.x>W){const scoring=b.x>W?0:1,defender=1-scoring;if(b.y>GOAL_MIN&&b.y<GOAL_MAX&&b.height<.9){g.score[scoring]++;g.message=scoring===0?'GOAL · Blue Tide!':'GOAL · Red Current';g.resetIn=2;g.restartType='goal';g.kickoff=defender;return;}
 // A post rebound stays live and allows an 18-second second attack.
 if(Math.min(Math.abs(b.y-GOAL_MIN),Math.abs(b.y-GOAL_MAX))<5&&b.height<1){b.x=clamp(b.x,4,W-4);b.vx*=-.65;b.rebounded=true;g.message='Off the post!';continue;}
 freeThrow(g,defender,defender===0?40:W-40,H/2,'Goal throw · goalkeeper possession',true);return;}
 for(const p of g.players){if(b.lock>0&&p.id===b.source)continue;const radius=p.keeper?19:15;if(distance(b,p)<radius&&b.height<(p.keeper?1.1:.7)){if(b.shot&&!b.rebounded&&!p.keeper&&p.team===b.last)continue;
 if(!p.keeper&&!b.rebounded&&p.team===b.last&&p.id!==b.source&&inGoalArea(p)&&(p.team===0?p.x>b.sourceX:p.x<b.sourceX)){freeThrow(g,1-p.team,p.x,p.y,'Goal-area infringement · free throw');return;}
 const rebound=p.team===b.last&&b.shot;possession(g,p);g.message=p.keeper?'Goalkeeper save':rebound?'Attacking rebound · 18 seconds':p.team===0?'Blue possession':'Red possession';return;}}
 }
}
