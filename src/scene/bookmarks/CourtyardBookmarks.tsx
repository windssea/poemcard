import {useEffect,useRef,useState} from 'react'
import {useFrame,useThree} from '@react-three/fiber'
import {useTexture} from '@react-three/drei'
import {Group,SRGBColorSpace} from 'three'
import type {PoemSummary} from '../../domain/types'
import {mediaUrl} from '../../services/content'
import {breeze} from '../animation/wind'
import {bookmarkLayout,bookmarkSlots} from '../../features/gallery/bookmark-layout'
function Cord({height,y}:{height:number;y:number}){return <mesh position={[0,y,0]}><cylinderGeometry args={[.009,.009,height,8]}/><meshStandardMaterial color="#b59256" roughness={.9}/></mesh>}
function Bookmark({poem,index,x,y,scale,h,cord,mobile,onSelect,onHover,wind,reduced}:{poem:PoemSummary;index:number;x:number;y:number;scale:number;h:number;cord:number;mobile:boolean;onSelect:(id:string)=>void;onHover:(p:PoemSummary|null)=>void;wind:number;reduced:boolean}){
 const group=useRef<Group>(null),tassel=useRef<Group>(null),time=useRef(0),[hover,setHover]=useState(false),map=useTexture(mediaUrl(poem.bookmark||poem.thumbnail)),{gl}=useThree();map.colorSpace=SRGBColorSpace
 useEffect(()=>{map.anisotropy=Math.min(8,gl.capabilities.getMaxAnisotropy());map.needsUpdate=true},[map,gl])
 const w=h/3
 useEffect(()=>()=>{document.body.style.cursor='auto'},[])
 useFrame((_,dt)=>{if(!group.current)return;const d=Math.min(dt,.05);if(!reduced&&!document.hidden)time.current+=d;const t=time.current,w=breeze(t,wind);group.current.rotation.z=reduced?0:Math.sin(t*.65+index)*(mobile?.004+w*.014:.012+w*.06);group.current.rotation.y=reduced?0:Math.sin(t*.4+index)*(.012+w*.055);if(tassel.current)tassel.current.rotation.z=reduced?0:Math.sin(t*.9+index+.6)*w*.18})
 const events={onClick:(e:any)=>{e.stopPropagation();onSelect(poem.id)},onPointerOver:()=>{setHover(true);onHover(poem);document.body.style.cursor='pointer'},onPointerOut:()=>{setHover(false);onHover(null);document.body.style.cursor='auto'}}
 return <group position={[x,y,.35+index%2*.06]} scale={scale}>
  <mesh position={[0,.03,0]}><torusGeometry args={[.045,.009,8,24]}/><meshStandardMaterial color="#987643" metalness={.4} roughness={.6}/></mesh>
  <group ref={group}>
  <Cord height={cord} y={-cord/2}/>
  <group position={[0,-cord,0]}>
   <mesh position={[0,-h/2,-.019]} castShadow {...events}><boxGeometry args={[w+.075,h+.045,.038]}/><meshStandardMaterial color="#eee0bd" roughness={1}/></mesh>
   <mesh position={[0,-h/2,.003]} castShadow {...events}><planeGeometry args={[w,h]}/><meshStandardMaterial map={map} roughness={.94} metalness={0} emissive="#fff3db" emissiveIntensity={hover?.13:.025}/></mesh>
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
export function CourtyardBookmarks({poems,mobile,onSelect,onHover,wind,reduced,page}:{poems:PoemSummary[];mobile:boolean;onSelect:(id:string)=>void;onHover:(p:PoemSummary|null)=>void;wind:number;reduced:boolean;page:number}){const {size}=useThree(),layout=bookmarkLayout(size.width,size.height),slots=bookmarkSlots(layout,poems.length);return <group key={page}>
 {poems.slice(0,layout.capacity).map((p,i)=><Bookmark key={p.id} poem={p} index={i} x={slots[i].x} y={slots[i].y} scale={layout.scale} h={layout.cardHeight} cord={layout.cord} mobile={mobile} onSelect={onSelect} onHover={onHover} wind={wind} reduced={reduced}/>)}</group>}
