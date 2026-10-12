import {useEffect,useMemo,useRef} from 'react'
import {useFrame,useThree} from '@react-three/fiber'
import {CanvasTexture,Group,MeshBasicMaterial,MeshStandardMaterial,PointLight,SRGBColorSpace} from 'three'
import type {EnvironmentState} from '../../domain/types'

function atmosphericTexture(kind:'moon'|'cloud'|'glow'){
 const c=document.createElement('canvas');c.width=c.height=256
 const ctx=c.getContext('2d')!
 const rand=(i:number)=>{const v=Math.sin(i*127.1+47)*43758.5453;return v-Math.floor(v)}
 if(kind==='moon'){
  ctx.fillStyle='#e5dfbf';ctx.fillRect(0,0,256,256)
  for(let i=0;i<140;i++){
   const x=rand(i)*256,y=rand(i+500)*256,r=3+rand(i+200)*20
   const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(103,110,98,.19)');g.addColorStop(.75,'rgba(132,134,111,.07)');g.addColorStop(1,'rgba(140,140,118,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)
  }
 }else if(kind==='glow'){
  const g=ctx.createRadialGradient(128,128,0,128,128,128);g.addColorStop(0,'rgba(255,223,158,.48)');g.addColorStop(.22,'rgba(255,201,109,.22)');g.addColorStop(.6,'rgba(244,162,66,.05)');g.addColorStop(1,'rgba(240,155,65,0)');ctx.fillStyle=g;ctx.fillRect(0,0,256,256)
 }else{
  for(let i=0;i<28;i++){
   const x=35+rand(i)*186,y=103+rand(i+50)*45,r=12+rand(i+80)*42
   const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(245,243,233,.15)');g.addColorStop(.45,'rgba(234,238,230,.08)');g.addColorStop(1,'rgba(225,235,228,0)');ctx.fillStyle=g;ctx.save();ctx.translate(x,y);ctx.scale(1,.46);ctx.fillRect(-r,-r,r*2,r*2);ctx.restore()
  }
 }
 const texture=new CanvasTexture(c);texture.colorSpace=SRGBColorSpace;return texture
}

function Moon({night,mobile,reduced}:{night:boolean;mobile:boolean;reduced:boolean}){
 const map=useMemo(()=>atmosphericTexture('moon'),[]),halo=useMemo(()=>atmosphericTexture('glow'),[])
 const globe=useRef<MeshBasicMaterial>(null),glow=useRef<MeshBasicMaterial>(null),group=useRef<Group>(null)
 useEffect(()=>()=>{map.dispose();halo.dispose()},[map,halo])
 useFrame(({pointer},dt)=>{
  if(!globe.current||!glow.current||!group.current)return
  const a=night?1:0;globe.current.opacity+=(a-globe.current.opacity)*Math.min(1,dt*1.6)
  glow.current.opacity=globe.current.opacity*.4;group.current.visible=globe.current.opacity>.002
  group.current.position.x=(mobile?-.7:-3.8)+(reduced?0:-pointer.x*.018)
 })
 return <group ref={group} position={[mobile?-.7:-3.8,mobile?2.25:3.05,-.1]} raycast={()=>null}>
  <mesh position={[0,0,-.02]}><planeGeometry args={[1.45,1.45]}/><meshBasicMaterial ref={glow} map={halo} color="#c9d8e3" transparent opacity={0} depthWrite={false} toneMapped={false}/></mesh>
  <mesh><sphereGeometry args={[.26,32,24]}/><meshBasicMaterial ref={globe} map={map} color="#e4e9de" transparent opacity={0} toneMapped={false}/></mesh>
 </group>
}

function CloudLayers({night,mobile,reduced,low}:{night:boolean;mobile:boolean;reduced:boolean;low:boolean}){
 const map=useMemo(()=>atmosphericTexture('cloud'),[]),group=useRef<Group>(null),time=useRef(0)
 useEffect(()=>()=>map.dispose(),[map])
 useFrame(({pointer},dt)=>{
  if(!group.current)return
  if(!reduced&&!document.hidden)time.current+=Math.min(dt,.05)
  group.current.children.forEach((layer,i)=>{layer.position.x=(mobile?-.5:-3.5)+Math.sin(time.current*.025+i)*.45+(reduced?0:-pointer.x*(.025+i*.025))})
 })
 return <group ref={group} raycast={()=>null}>{Array.from({length:low?2:3},(_,i)=><mesh key={i} position={[mobile?-.5:-3.5,2.75+i*.35,.02+i*.12]} scale={[1,1,1]}>
  <planeGeometry args={[6.5+i*1.3,2.1]}/><meshBasicMaterial map={map} transparent opacity={night?.23:.55} color={night?'#9aafc5':'#fff8ea'} depthWrite={false} toneMapped={false}/>
 </mesh>)}</group>
}

function PalaceLantern({x,anchor,night,reduced,wind}:{x:number;anchor:number;night:boolean;reduced:boolean;wind:number}){
 const swing=useRef<Group>(null),paper=useRef<MeshStandardMaterial>(null),light=useRef<PointLight>(null),glow=useRef<MeshBasicMaterial>(null),time=useRef(0)
 const halo=useMemo(()=>atmosphericTexture('glow'),[])
 useEffect(()=>()=>halo.dispose(),[halo])
 useFrame((_,dt)=>{
  if(!reduced&&!document.hidden)time.current+=Math.min(dt,.05)
  if(swing.current)swing.current.rotation.z=reduced?0:Math.sin(time.current*.75+x)*(.012+wind*.04)
  const target=night?1:0
  if(paper.current)paper.current.emissiveIntensity+=(target*.85-paper.current.emissiveIntensity)*Math.min(1,dt*2)
  if(light.current)light.current.intensity+=(target*(1.5+Math.sin(time.current*2.1)*.045)-light.current.intensity)*Math.min(1,dt*2)
  if(glow.current)glow.current.opacity+=(target*.7-glow.current.opacity)*Math.min(1,dt*2)
 })
 return <group position={[x,anchor,1.05]}>
  {/* Bronze bracket anchors the light to the eave rather than floating in the sky. */}
  <mesh position={[.19,-.47,-.05]} castShadow><boxGeometry args={[.045,1.04,.065]}/><meshStandardMaterial color="#594735" roughness={.76} metalness={.35}/></mesh>
  <mesh position={[.07,.02,-.05]} castShadow><boxGeometry args={[.29,.045,.065]}/><meshStandardMaterial color="#594735" roughness={.76} metalness={.35}/></mesh>
  <group ref={swing}>
   <mesh position={[0,-.1,0]}><cylinderGeometry args={[.008,.008,.2,8]}/><meshStandardMaterial color="#80623a" roughness={.8}/></mesh>
   <group position={[0,-.45,0]}>
    <mesh castShadow><cylinderGeometry args={[.17,.15,.45,6]}/><meshStandardMaterial ref={paper} color="#d1aa72" roughness={1} metalness={0} emissive="#ffb85c" emissiveIntensity={0}/></mesh>
    {[-1,1].map(sign=><mesh key={sign} position={[0,sign*.25,0]} castShadow><cylinderGeometry args={[sign===1?.1:.19,sign===1?.22:.17,.065,6]}/><meshStandardMaterial color="#683e29" roughness={.8} metalness={.2}/></mesh>)}
    {Array.from({length:6},(_,i)=>{const a=i*Math.PI/3;return <mesh key={i} position={[Math.cos(a)*.165,0,Math.sin(a)*.165]} castShadow><boxGeometry args={[.018,.46,.018]}/><meshStandardMaterial color="#78452c" roughness={.88}/></mesh>})}
    <pointLight ref={light} position={[0,0,.28]} color="#ffc078" intensity={0} distance={3.5} decay={2}/>
    <mesh position={[0,0,-.65]} raycast={()=>null}><planeGeometry args={[2.2,2.2]}/><meshBasicMaterial ref={glow} map={halo} transparent opacity={0} depthWrite={false} toneMapped={false}/></mesh>
    <mesh position={[0,-.4,0]}><cylinderGeometry args={[.01,.018,.27,8]}/><meshStandardMaterial color="#97632f" roughness={1}/></mesh>
    {Array.from({length:8},(_,i)=><mesh key={i} position={[(i-3.5)*.007,-.61,0]}><cylinderGeometry args={[.002,.003,.22,5]}/><meshStandardMaterial color="#773326" roughness={1}/></mesh>)}
   </group>
  </group>
 </group>
}

export function CourtyardDetails({env,mobile,reduced,low}:{env:EnvironmentState;mobile:boolean;reduced:boolean;low:boolean}){
 const {size}=useThree(),halfWidth=size.width/size.height*8.85/2,night=env.timeOfDay<6||env.timeOfDay>=19
 return <><Moon night={night} mobile={mobile} reduced={reduced}/><CloudLayers night={night} mobile={mobile} reduced={reduced} low={low}/>
  <PalaceLantern x={mobile?halfWidth-.45:Math.min(halfWidth-.55,6.2)} anchor={mobile?2.0:2.35} night={night} reduced={reduced} wind={env.windStrength}/>
  {!mobile&&!low&&<PalaceLantern x={Math.min(halfWidth-1.55,4.95)} anchor={1.95} night={night} reduced={reduced} wind={env.windStrength}/>}
 </>
}
