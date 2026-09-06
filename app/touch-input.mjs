export function stickVector(dx,dy,radius=44){const distance=Math.hypot(dx,dy);if(distance<7)return {x:0,y:0};const strength=Math.min(1,(distance-7)/(radius-7));return {x:dx/distance*strength,y:dy/distance*strength};}
export function shotTarget(dy){return {x:1120,y:Math.max(276,Math.min(344,310+dy*.8))};}
