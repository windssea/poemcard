// Orthographic courtyard height matches the camera; bounds reserve the branches at the right.
export function bookmarkLayout(width:number,height:number,sceneKind:'courtyard'|'garden'='courtyard'){
 const mobile=width<700,halfWidth=Math.max(1,width)/Math.max(1,height)*8.85/2
 const gardenMobile=mobile&&sceneKind==='garden',inset=gardenMobile?halfWidth*.40:.15
 const left=Math.max(-halfWidth+inset,mobile?-Infinity:sceneKind==='garden'?-5.25:-7.45)
 const right=Math.min(halfWidth-inset,mobile?Infinity:sceneKind==='garden'?5.25:2.6)
 const available=Math.max(.01,right-left),cardHeight=mobile?2.1:2.65
 if(mobile){
  const cardHeight=gardenMobile?3.8:4.6,cord=gardenMobile?.55:.18,tassel=.47,cameraY=gardenMobile?0:-1.25,anchor=gardenMobile?3.35:1
  const capacity=gardenMobile?Math.max(1,Math.min(4,Math.floor(width*.60/94))):4
  const bottom=cameraY-8.85/2+.85,verticalSpace=anchor-bottom
  // Quiet mobile swing keeps four adjacent paper strips clear without wasting their width.
  const rawFootprint=cardHeight*(gardenMobile?.68:1/3)+.11+2*(cardHeight+cord)*Math.sin(.024)
  const gap=.075,scale=Math.min(1,(available-gap*(capacity-1))/capacity/rawFootprint,(gardenMobile?verticalSpace*.52:verticalSpace)/(cardHeight+cord+tassel))
  const safeScale=Math.max(.01,scale),footprint=rawFootprint*safeScale,pitch=footprint+gap
  return {mobile,left,right,scale:safeScale,footprint,pitch,capacity,cardHeight,cord,anchor,rowStep:0,bottom,cameraY}
 }
 // Full-strength gusts: rigid paper swings around its fixed cord end, not its centre.
 const halfFootprint=(cardHeight/3+.11)/2+(cardHeight+.31)*Math.sin(.085)
 const scale=Math.min(1,available/(halfFootprint*2)),footprint=halfFootprint*2*scale
 const pitch=footprint+.20*scale
 const capacity=Math.max(1,Math.floor((available-footprint+1e-8)/pitch)+1)
 return {mobile,left,right,scale,footprint,pitch,capacity,cardHeight,cord:.31,anchor:sceneKind==='garden'?3.65:.8,rowStep:0,bottom:-Infinity,cameraY:.28}
}
export function bookmarkSlots(layout:ReturnType<typeof bookmarkLayout>,count:number){
 const n=Math.min(count,layout.capacity),centre=(layout.left+layout.right)/2
 if(layout.mobile){
  const step=(layout.right-layout.left)/n
  return Array.from({length:n},(_,i)=>({x:centre+(i-(n-1)/2)*step,y:layout.anchor}))
 }
 const spacing=n>1?Math.min(layout.pitch*1.1,(layout.right-layout.left-layout.footprint)/(n-1)):0
 return Array.from({length:n},(_,i)=>({x:centre+(i-(n-1)/2)*spacing,y:layout.anchor}))
}
export function bookmarkPositions(layout:ReturnType<typeof bookmarkLayout>,count:number){return bookmarkSlots(layout,count).map(slot=>slot.x)}
