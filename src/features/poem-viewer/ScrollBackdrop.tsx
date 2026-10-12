import {useEffect,useMemo,useRef} from 'react'
import {Canvas,useFrame,useThree} from '@react-three/fiber'
import {CanvasTexture,Group,RepeatWrapping,SRGBColorSpace} from 'three'
import type {scrollLayout} from './scroll-layout'
import {scrollMaterial} from './scroll-material'
type Layout=ReturnType<typeof scrollLayout>
function texture(kind:'paper'|'wood'|'silk'){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=768
 const ctx=canvas.getContext('2d')!,pixels=ctx.createImageData(768,768)
 const rand=(i:number)=>{const r=Math.sin(i*127.1+31.7)*43758.5453;return r-Math.floor(r)}
 for(let y=0;y<768;y++)for(let x=0;x<768;x++){const i=y*768+x,n=(rand(i)-.5)*(kind==='paper'?8:12),grain=Math.sin(y*.35+Math.sin(x*.012)*4)*12;const base=kind==='paper'?[235,227,209]:kind==='silk'?[185,172,143]:[117,83,51];const weave=kind==='silk'?(Math.sin(x*Math.PI)*2+Math.cos(y*Math.PI)*3):0;for(let c=0;c<3;c++)pixels.data[i*4+c]=base[c]+n+(kind==='wood'?grain:weave);pixels.data[i*4+3]=255}
 ctx.putImageData(pixels,0,0)
 if(kind==='paper'){
  for(let i=0;i<9000;i++){const x=rand(i+7)*768,y=rand(i+29)*768;ctx.strokeStyle=`rgba(126,109,75,${.025+rand(i+12)*.055})`;ctx.lineWidth=.3+rand(i+15)*.5;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+2,y-1,x+4,y+1,x+5+rand(i+16)*9,y+rand(i+23)*3);ctx.stroke()}
  for(const [x,y,r,a] of [[70,110,190,.13],[680,600,170,.1],[550,130,110,.045],[100,710,230,.09]]){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(151,112,56,${a})`);g.addColorStop(.55,`rgba(163,125,65,${a*.55})`);g.addColorStop(1,'rgba(170,130,70,0)');ctx.fillStyle=g;ctx.fillRect(0,0,768,768)}
  // Diffusion follows irregular fibres instead of clean circular gradient outlines.
  const aged=ctx.getImageData(0,0,768,768)
  const stains:[number,number,number,number,number[]][]=[
   [-20,95,240,.19,[146,107,53]],[690,805,270,.16,[149,112,62]],
   [805,195,195,.12,[125,113,89]],[-30,645,190,.12,[86,88,78]],
   [650,50,115,.055,[98,103,95]],[145,755,130,.065,[70,78,74]],
   [750,775,195,.055,[74,89,80]],
   [745,-45,240,.045,[81,97,88]],[-35,325,180,.04,[105,113,99]]
  ]
  for(let y=0;y<768;y++)for(let x=0;x<768;x++){
   const i=(y*768+x)*4,fibre=Math.sin(x*.31+y*.11)*Math.sin(y*.47-x*.07)
   for(const [cx,cy,r,opacity,color] of stains){
    const dx=(x-cx)/r,dy=(y-cy)/r,angle=Math.atan2(dy,dx)
    const boundary=1+.1*Math.sin(angle*5+cx)+.055*Math.sin(angle*11+cy)+.025*Math.sin(angle*19+cx*.13+cy*.07)
    const distance=Math.sqrt(dx*dx+dy*dy)/boundary
    if(distance>1.35)continue
    const wash=Math.exp(-distance*distance*2.9)
    const tide=Math.exp(-Math.pow((distance-.78)/.075,2))*.2
    const a=Math.min(.24,opacity*(wash+tide)*(.86+fibre*.14))
    for(let c=0;c<3;c++)aged.data[i+c]=aged.data[i+c]*(1-a)+color[c]*a
   }
   // Sparse, faint foxing stays near the edges rather than obscuring the poem.
   const edge=Math.max(0,1-Math.min(x,767-x,y,767-y)/110)
   if(edge>0&&rand(y*768+x+18000)>.998){for(let c=0;c<3;c++)aged.data[i+c]-=edge*12}
  }
  ctx.putImageData(aged,0,0)
 }
 const result=new CanvasTexture(canvas);result.colorSpace=SRGBColorSpace;result.wrapS=result.wrapT=RepeatWrapping;return result
}
function Scroll({layout,start,onStart,onOpened,host}:{layout:Layout;start:boolean;onStart:()=>void;onOpened:()=>void;host:React.RefObject<HTMLDivElement|null>}){
 const opening=useRef<Group>(null),elapsed=useRef(0),notified=useRef(false),begun=useRef(false)
 const progress=useMemo(()=>({value:0}),[]),soak=useMemo(()=>({value:0}),[])
 const reduced=useMemo(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches,[])
 const {viewport,size,invalidate}=useThree(),paper=useMemo(()=>texture('paper'),[]),wood=useMemo(()=>texture('wood'),[]),silk=useMemo(()=>texture('silk'),[])
 useFrame((_,delta)=>{
  if(!opening.current)return
  if(!start)return
  if(!begun.current){begun.current=true;onStart()}
  elapsed.current+=Math.min(delta,.05)
  const t=reduced?1:Math.min(1,elapsed.current/1.25)
  const width=.04+.96*(t*t*(3-2*t))
  progress.value=width;soak.value=reduced?1:Math.min(1,Math.max(0,(elapsed.current-1.25)/3.6))
  for(const child of opening.current.children)if(child.userData.roller){child.position.x=child.userData.sign*layout.sheet.width*unit/2*width;child.rotation.y=child.userData.sign*(1-width)*layout.sheet.width*unit/(2*r)}
  host.current?.parentElement?.style.setProperty('--scroll-open-width',`${layout.sheet.width*width}px`)
  host.current?.parentElement?.style.setProperty('--scroll-text-opacity',`${Math.max(0,(t-.75)/.25)}`)
  if(t===1&&!notified.current){notified.current=true;onOpened()}
  if(!reduced&&elapsed.current<4.85)invalidate()
 })
 useEffect(()=>{invalidate()},[layout,start,invalidate])
 useEffect(()=>()=>{paper.dispose();wood.dispose();silk.dispose()},[paper,wood,silk])
 const {sheet,rail,side,head,foot}=layout,unit=viewport.height/size.height
 const y=(px:number)=>(size.height/2-px)*unit
 const cy=y(sheet.top+sheet.height/2),r=rail/2*unit,h=sheet.height*unit
 const paperMaterial=useMemo(()=>scrollMaterial(paper,(sheet.width-2*side)*unit/2,true,progress,soak,side*unit),[paper,sheet.width,side,unit,progress,soak])
 const silkMaterial=useMemo(()=>scrollMaterial(silk,sheet.width*unit/2,false,progress,soak),[silk,sheet.width,unit,progress,soak])
 useEffect(()=>()=>{paperMaterial.dispose();silkMaterial.dispose()},[paperMaterial,silkMaterial])
 return <><color attach="background" args={['#ded8cb']}/><ambientLight intensity={1.15}/><directionalLight position={[-3,5,9]} intensity={1.8} color="#fff4de" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} shadow-normalBias={.01}/>
 <mesh position={[0,0,-.6]} receiveShadow><planeGeometry args={[viewport.width,viewport.height]}/><meshStandardMaterial color="#ddd7cc" roughness={1}/></mesh>
 {/* Continuous mounting: backing cloth touches both rollers; paper is pasted onto it. */}
 <group ref={opening}>
 <mesh position={[0,cy,-.25]} receiveShadow material={silkMaterial}><planeGeometry args={[sheet.width*unit,h,128,16]}/></mesh>
 <mesh position={[0,y(sheet.top+head+(sheet.height-head-foot)/2),-.236]} receiveShadow material={paperMaterial}><planeGeometry args={[(sheet.width-2*side)*unit,(sheet.height-head-foot)*unit,128,24]}/></mesh>
 {[-1,1].map(sign=><group key={sign} userData={{roller:true,sign}} position={[sign*sheet.width/2*unit*.04,cy,-.18]}>
  <mesh castShadow receiveShadow><cylinderGeometry args={[r,r,h+.18,32]}/><meshStandardMaterial map={wood} bumpMap={wood} bumpScale={.01} color="#b29c7b" roughness={.9}/></mesh>
  {/* The sheet wraps over the front half of the roller, meeting the flat backing. */}
  <mesh castShadow receiveShadow><cylinderGeometry args={[r+.008,r+.008,h,32,1,true,-Math.PI/2,Math.PI]}/><meshStandardMaterial map={silk} color="#eadfc7" roughness={1} metalness={0}/></mesh>
  {[-1,1].map(end=><group key={end} position={[0,end*(h/2+.085),0]}><mesh castShadow><cylinderGeometry args={[r*1.28,r*1.28,.065,32]}/><meshStandardMaterial map={wood} color="#997a55" roughness={.9}/></mesh><mesh position={[0,end*.045,0]} scale={[1,.65,1]} castShadow><sphereGeometry args={[r*.78,20,12]}/><meshStandardMaterial color="#735137" roughness={.92}/></mesh></group>)}
 </group>)}
 </group>
 </>
}
export default function ScrollBackdrop({layout,start,onStart,onOpened}:{layout:Layout;start:boolean;onStart:()=>void;onOpened:()=>void}){const host=useRef<HTMLDivElement>(null);return <div ref={host} className="scroll-backdrop" aria-hidden="true"><Canvas orthographic shadows frameloop="demand" dpr={[1,1.5]} camera={{position:[0,0,10],zoom:100,near:.1,far:30}} gl={{antialias:true,alpha:false}} fallback={<div className="paper-fallback"/>}><Scroll layout={layout} start={start} onStart={onStart} onOpened={onOpened} host={host}/></Canvas></div>}
