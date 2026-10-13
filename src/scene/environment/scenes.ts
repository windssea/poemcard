export type SceneKind='courtyard'|'garden'
export const scenes:Record<SceneKind,{name:string;far:string;mid:string;preview:string;winter:string;wet:string}>={
 courtyard:{name:'红墙诗廊',far:'courtyard-far',mid:'courtyard-mid',preview:'courtyard-preview',winter:'courtyard-winter',wet:'courtyard-wet'},
 garden:{name:'江南景窗',far:'garden-v2-far',mid:'garden-v2-mid',preview:'garden-v2-preview',winter:'garden-v2-winter',wet:'garden-v2-wet'}
}
export function sceneView(kind:SceneKind,mobile:boolean){return {cameraY:mobile?(kind==='garden'?.28:-1.25):.28,x:mobile?2.3:0,y:mobile&&kind==='courtyard'?-.12:0,scaleY:mobile&&kind==='courtyard'?1.4:1}}
