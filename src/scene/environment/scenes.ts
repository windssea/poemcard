export type SceneKind='courtyard'|'garden'
export const scenes:Record<SceneKind,{name:string;far:string;mid:string;preview:string;winter:string;wet:string}>={
 courtyard:{name:'红墙诗廊',far:'courtyard-far',mid:'courtyard-mid',preview:'courtyard-preview',winter:'courtyard-winter',wet:'courtyard-wet'},
 garden:{name:'江南景窗',far:'garden-v2-far',mid:'garden-v2-mid',preview:'garden-v2-preview',winter:'garden-v2-winter',wet:'garden-v2-wet'}
}
export function sceneView(kind:SceneKind,mobile:boolean,width=390,height=740){
 const portrait=mobile&&kind==='garden'
 // Keep the hanging height fixed; extend the plates horizontally on wide screens.
 // Overscan covers the small rotation and parallax of the depth rig.
 const wideScale=mobile?1:Math.max(1,width/Math.max(1,height)*8.85/(16.72*.94))
 return {cameraY:portrait?0:mobile?-1.25:.28,x:mobile&&!portrait?2.3:0,y:mobile&&kind==='courtyard'?-.12:0,scaleX:portrait?width/height*8.85/16.72:wideScale,scaleY:portrait?8.85/9.41:mobile?1.4:1}
}
export function sceneMedia(kind:SceneKind,mobile:boolean){return {mid:mobile&&kind==='garden'?'garden-mobile-mid':scenes[kind].mid,preview:mobile&&kind==='garden'?'garden-mobile-preview':scenes[kind].preview}}
