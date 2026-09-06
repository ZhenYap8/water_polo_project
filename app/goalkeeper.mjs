export function goalkeeperIntent(p,ball,players,charge,dt,settings) {
  const state=p.goalkeeping??={reaction:0,cooldown:0,lunge:0,jump:0,lean:0,hands:0,target:310,direction:0};
  state.cooldown=Math.max(0,state.cooldown-dt);
  state.lunge=Math.max(0,state.lunge-dt);
  const incoming=ball.owner===null&&ball.shot&&ball.last!==p.team;
  const arrival=incoming&&Math.abs(ball.vx)>1?(p.x-ball.x)/ball.vx:-1;
  const threatened=arrival>0&&arrival<1.2;
  const carrier=players[ball.owner];
  const preparing=carrier&&carrier.team!==p.team&&Math.abs(carrier.x-p.x)<450;
  if(threatened){
    state.reaction+=dt;
    if(state.reaction>=settings.reaction){
      const target=ball.y+ball.vy*arrival;
      state.target=Math.max(263.5,Math.min(356.5,target));
      if(arrival<.48&&state.cooldown===0){
        state.direction=Math.abs(target-p.y)>9?Math.sign(target-p.y):0;
        const height=ball.height+ball.vz*arrival-4.9*arrival*arrival;
        state.high=height>.65;
        state.lunge=.6;state.cooldown=1.15;
      }
    }
  }else{
    state.reaction=0;
    if(state.lunge===0)state.target=Math.max(269.5,Math.min(350.5,ball.y));
  }
  const pulse=state.lunge>0?Math.sin(Math.PI*(1-state.lunge/.6)):0;
  state.jump=pulse*(state.high?.58:.3);
  state.lean=pulse>0?pulse*state.direction*.65:0;
  const hands=threatened||state.lunge>0?1:preparing?(charge>.15?1:.65):.15;
  state.hands+=(hands-state.hands)*(1-Math.exp(-dt*10));
  return {y:state.target,speed:settings.speed*(state.lunge>0?1.5:1)};
}
