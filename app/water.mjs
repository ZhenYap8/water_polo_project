// Metres in the rendered pool; short wind waves plus local swimmer wakes.
export function waterHeight(x,z,time,wakes=[]) {
  let height=.022*Math.sin(x*2.1+z*.8-time*2.4)+.014*Math.sin(z*3.4-x*.5-time*3.1)+.008*Math.sin(x*5+z*4+time*2);
  for(const wake of wakes){
    const dx=x-wake.x,dz=z-wake.z,d2=dx*dx+dz*dz;
    if(d2>9)continue;
    const d=Math.sqrt(d2),behind=dx*wake.dx+dz*wake.dz<0?1:.35;
    height+=wake.strength*behind*Math.sin(d*10-time*7+wake.phase)*Math.exp(-d*1.3);
  }
  return height;
}

export function advanceBallWater(ball,dt,time) {
  const surface=waterHeight((ball.x/1100-.5)*25,(ball.y/620-.5)*20,time);
  const wet=ball.height<surface+.14;
  // Buoyancy and damping settle the ball into the surface instead of floor-bouncing.
  ball.vz+=(wet?(surface+.09-ball.height)*100-ball.vz*9:-9.8)*dt;
  ball.height+=ball.vz*dt;
  if(wet){
    const speed=Math.hypot(ball.vx/44,ball.vy/31);
    const drag=Math.exp(-(1.1+.22*speed)*dt);
    ball.vx*=drag;ball.vy*=drag;
    if(ball.height<surface-.035){ball.height=surface-.035;ball.vz=Math.max(0,-ball.vz*.12);}
  }
}
