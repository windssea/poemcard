import {useRef,useState,useEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import {useTexture} from '@react-three/drei'
import {Group,SRGBColorSpace} from 'three'
import type {PoemSummary} from '../../domain/types'
import {mediaUrl} from '../../services/content'
function Bookmark({poem,index,count,onSelect,onHover,wind,reduced}:{poem:PoemSummary;index:number;count:number;onSelect:(id:string)=>void;onHover:(poem:PoemSummary|null)=>void;wind:number;reduced:boolean}){
 const ref=useRef<Group>(null);const [hover,setHover]=useState(false);const texture=useTexture(mediaUrl(poem.thumbnail));texture.colorSpace=SRGBColorSpace
 const x=(index-(count-1)/2)*1.5
 useEffect(()=>()=>{document.body.style.cursor='auto'},[])
 useFrame(({clock})=>{if(ref.current){const t=clock.elapsedTime;ref.current.rotation.z=reduced?0:Math.sin(t*.8+index*.7)*(.02+wind*.07);ref.current.rotation.y=reduced?0:Math.sin(t*.55+index)*wind*.05;ref.current.scale.setScalar(hover?1.05:1)}})
 return <group position={[x,4.55,-1.6]} ref={ref}>
  <mesh position={[0,-.4,0]}><cylinderGeometry args={[.009,.009,.8,8]}/><meshStandardMaterial color="#d2ba8e"/></mesh>
  <mesh position={[0,-1.94,-.025]} castShadow><boxGeometry args={[.87,2.56,.045]}/><meshStandardMaterial color="#bd9561" roughness={.78}/></mesh>
  <mesh position={[0,-1.94,.003]} castShadow receiveShadow onClick={e=>{e.stopPropagation();onSelect(poem.id)}} onPointerOver={()=>{setHover(true);onHover(poem);document.body.style.cursor='pointer'}} onPointerOut={()=>{setHover(false);onHover(null);document.body.style.cursor='auto'}}>
   <planeGeometry args={[.82,2.46]}/><meshStandardMaterial map={texture} roughness={.9} emissive="#ead3a4" emissiveIntensity={hover?.16:.04}/>
  </mesh>
  <mesh position={[0,-.72,.025]}><torusGeometry args={[.035,.008,8,16]}/><meshStandardMaterial color="#a77a39" metalness={.5} roughness={.35}/></mesh>
 </group>
}
export function Bookmarks({poems,...props}:{poems:PoemSummary[];onSelect:(id:string)=>void;onHover:(poem:PoemSummary|null)=>void;wind:number;reduced:boolean}){return <>{poems.map((p,i)=><Bookmark key={p.id} poem={p} index={i} count={poems.length} {...props}/>)}</>}
