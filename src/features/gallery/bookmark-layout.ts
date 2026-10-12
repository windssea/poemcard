// Orthographic courtyard height matches the camera; bounds reserve the branches at the right.
export function bookmarkLayout(width:number,height:number){
 const mobile=width<700,halfWidth=Math.max(1,width)/Math.max(1,height)*8.85/2
 const left=Math.max(-halfWidth+.15,mobile?-Infinity:-7.45)
 const right=Math.min(halfWidth-.15,mobile?Infinity:2.6)
 const available=Math.max(.01,right-left),cardHeight=mobile?2.1:2.65
 // Full-strength gusts: rigid paper swings around its fixed cord end, not its centre.
 const halfFootprint=(cardHeight/3+.11)/2+(cardHeight+.31)*Math.sin(.072)
 const scale=Math.min(1,available/(halfFootprint*2)),footprint=halfFootprint*2*scale
 const pitch=footprint+.20*scale
 const capacity=Math.max(1,Math.floor((available-footprint+1e-8)/pitch)+1)
 return {mobile,left,right,scale,footprint,pitch,capacity}
}
export function bookmarkPositions(layout:ReturnType<typeof bookmarkLayout>,count:number){
 const n=Math.min(count,layout.capacity),centre=(layout.left+layout.right)/2
 const spacing=n>1?Math.min(layout.pitch*1.1,(layout.right-layout.left-layout.footprint)/(n-1)):0
 return Array.from({length:n},(_,i)=>centre+(i-(n-1)/2)*spacing)
}
