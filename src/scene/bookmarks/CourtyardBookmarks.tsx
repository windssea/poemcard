import {Suspense,useEffect,useMemo,useRef,useState} from 'react'
import {useFrame,useThree} from '@react-three/fiber'
import {useTexture} from '@react-three/drei'
import {CanvasTexture,Group,SRGBColorSpace} from 'three'
import type {PoemSummary} from '../../domain/types'
import {mediaUrl} from '../../services/content'
import {breeze} from '../animation/wind'
import {bookmarkLayout,bookmarkSlots} from '../../features/gallery/bookmark-layout'
import {TextureBoundary} from '../TextureBoundary'
function Cord({height,y}:{height:number;y:number}){return <mesh position={[0,y,0]}><cylinderGeometry args={[.009,.009,height,8]}/><meshStandardMaterial color="#b59256" roughness={.9}/></mesh>}
function SignCaption({poem,w,h,events}:{poem:PoemSummary;w:number;h:number;events:Record<string,any>}){
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=512;c.height=240;const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;return t},[])
 useEffect(()=>{let live=true;const draw=()=>{if(!live)return;const c=texture.image as HTMLCanvasElement,ctx=c.getContext('2d')!;ctx.fillStyle='#e7dcc2';ctx.fillRect(0,0,512,320);ctx.fillStyle='#353c32';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='86px poem-brush';const lines=poem.title.length>5?[poem.title.slice(0,4),poem.title.slice(4)]:[poem.title];lines.forEach((line,i)=>ctx.fillText(line,256,lines.length===1?96:58+i*83,464));ctx.fillStyle='#78694f';ctx.font='44px poem-brush';ctx.fillText(`${poem.dynasty} · ${poem.poet}`,256,213,440);texture.needsUpdate=true};draw();void document.fonts.load('86px poem-brush',poem.title+poem.poet).then(draw);return()=>{live=false}},[texture,poem])
 useEffect(()=>()=>texture.dispose(),[texture])
 return <mesh position={[0,-h*.84,.012]} {...events}><planeGeometry args={[w,h*.32]}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh>
}
function HangingRail({left,right,y}:{left:number;right:number;y:number}){
 const centre=(left+right)/2,width=right-left+.16
 return <group position={[centre,y,.25]}>
  <mesh rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.045,.045,width,24]}/><meshStandardMaterial color="#755235" roughness={.92}/></mesh>
  {[-1,1].map(sign=><group key={sign} position={[sign*(width/2-.08),0,-.12]}><mesh position={[0,.16,0]} castShadow><boxGeometry args={[.045,.32,.07]}/><meshStandardMaterial color="#7d6240" roughness={.75} metalness={.35}/></mesh><mesh position={[0,.32,-.13]}><boxGeometry args={[.15,.05,.32]}/><meshStandardMaterial color="#755235" roughness={.92}/></mesh></group>)}
 </group>
}
function Bookmark({poem,index,x,y,scale,h,cord,mobile,short=false,onSelect,onHover,wind,reduced}:{poem:PoemSummary;index:number;x:number;y:number;scale:number;h:number;cord:number;mobile:boolean;short?:boolean;onSelect:(id:string)=>void;onHover:(p:PoemSummary|null)=>void;wind:number;reduced:boolean}){
 const group=useRef<Group>(null),tassel=useRef<Group>(null),time=useRef(0),[hover,setHover]=useState(false),map=useTexture(mediaUrl((mobile&&poem.bookmarkMobile)||poem.bookmark||poem.thumbnail)),{gl}=useThree();map.colorSpace=SRGBColorSpace
 useEffect(()=>{map.anisotropy=Math.min(8,gl.capabilities.getMaxAnisotropy());map.needsUpdate=true},[map,gl])
 const w=h*(short?.68:1/3)
 const picture=useMemo(()=>{const t=map.clone();if(short){t.repeat.y=1/3;t.offset.y=.02}t.needsUpdate=true;return t},[map,short])
 useEffect(()=>()=>picture.dispose(),[picture])
 useEffect(()=>()=>{document.body.style.cursor='auto'},[])
 useFrame((_,dt)=>{if(!group.current)return;const d=Math.min(dt,.05);if(!reduced&&!document.hidden)time.current+=d;const t=time.current,w=breeze(t,wind);group.current.rotation.z=reduced?0:(Math.sin(t*.57+index)*.86+Math.sin(t*1.03+index+.7)*.14)*(mobile?.006+w*.018:.016+w*.069);group.current.rotation.y=reduced?0:Math.sin(t*.37+index)*(.015+w*.065);if(tassel.current)tassel.current.rotation.z=reduced?0:Math.sin(t*.83+index+.6)*w*.23})
 const events={onClick:(e:any)=>{e.stopPropagation();onSelect(poem.id)},onPointerOver:()=>{setHover(true);onHover(poem);document.body.style.cursor='pointer'},onPointerOut:()=>{setHover(false);onHover(null);document.body.style.cursor='auto'}}
 return <group position={[x,y,.35+index%2*.06]} scale={scale}>
  <mesh position={[0,.03,0]}><torusGeometry args={[.045,.009,8,24]}/><meshStandardMaterial color="#987643" metalness={.4} roughness={.6}/></mesh>
  <group ref={group}>
  <Cord height={cord} y={-cord/2}/>
  <group position={[0,-cord,0]}>
   <mesh position={[0,-h/2,-.019]} castShadow {...events}><boxGeometry args={[w+.075,h+.045,.038]}/><meshStandardMaterial color="#eee0bd" roughness={1}/></mesh>
   <mesh position={[0,short?-h*.34:-h/2,.003]} castShadow {...events}><planeGeometry args={[w,short?h*.68:h]}/><meshStandardMaterial map={picture} roughness={.94} metalness={0} emissive="#fff3db" emissiveIntensity={hover?.13:.025}/></mesh>
   {short&&<><SignCaption poem={poem} w={w} h={h} events={events}/>{[-1,1].map(sign=><mesh key={sign} position={[sign*(w/2+.022),-h/2,.008]} castShadow><boxGeometry args={[.045,h+.045,.045]}/><meshStandardMaterial color="#826144" roughness={.96}/></mesh>)}</>}
   {[-.009,-h].map(y=><mesh key={y} position={[0,y,.009]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.023,.023,w+.11,16]}/><meshStandardMaterial color="#9c7742" roughness={.8}/></mesh>)}
   <group position={[0,-h-.05,0]} ref={tassel} scale={mobile?.45:1}>
    <Cord height={.16} y={-.08}/><mesh position={[0,-.22,0]}><torusGeometry args={[.063,.021,12,32]}/><meshStandardMaterial color="#8fa99b" roughness={.48} metalness={0}/></mesh><Cord height={.15} y={-.34}/>
    <mesh position={[0,-.44,0]}><sphereGeometry args={[.035,12,8]}/><meshStandardMaterial color="#aa8650" roughness={.6} metalness={.35}/></mesh>
    {Array.from({length:12},(_,i)=><mesh key={i} position={[(i-5.5)*.008,-.69,Math.sin(i)*.007]} rotation={[0,0,(i-5.5)*.004]}><cylinderGeometry args={[.003,.004,.45,5]}/><meshStandardMaterial color={index%2?'#b29d72':'#6d2920'} roughness={1}/></mesh>)}
   </group>
  </group>
  </group>
 </group>
}
function GradualBookmark(props:Parameters<typeof Bookmark>[0]){
 const [enabled,setEnabled]=useState(false)
 useEffect(()=>{const timer=setTimeout(()=>setEnabled(true),props.index*180);return()=>clearTimeout(timer)},[props.index])
 const url=mediaUrl((props.mobile&&props.poem.bookmarkMobile)||props.poem.bookmark||props.poem.thumbnail)
 return enabled?<TextureBoundary urls={[url]}><Suspense fallback={null}><Bookmark {...props}/></Suspense></TextureBoundary>:null
}
export function CourtyardBookmarks({sceneKind,poems,mobile,onSelect,onHover,wind,reduced,page}:{poems:PoemSummary[];mobile:boolean;onSelect:(id:string)=>void;onHover:(p:PoemSummary|null)=>void;wind:number;reduced:boolean;page:number;sceneKind:'courtyard'|'garden'}){const {size}=useThree(),layout=bookmarkLayout(size.width,size.height,sceneKind),slots=bookmarkSlots(layout,poems.length);return <group key={`${sceneKind}-${page}`}>
 {mobile&&sceneKind==='garden'&&<HangingRail left={layout.left} right={layout.right} y={layout.anchor}/>}
 {poems.slice(0,layout.capacity).map((p,i)=><GradualBookmark key={p.id} poem={p} index={i} x={slots[i].x} y={slots[i].y} scale={layout.scale} h={layout.cardHeight} cord={layout.cord} mobile={mobile} short={mobile&&sceneKind==='garden'} onSelect={onSelect} onHover={onHover} wind={wind} reduced={reduced}/>)}</group>}
