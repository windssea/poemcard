import {Suspense,useEffect,useMemo,useRef,useState} from 'react'
import {useFrame,useThree} from '@react-three/fiber'
import {useTexture} from '@react-three/drei'
import {Color,Mesh,MeshBasicMaterial,SRGBColorSpace} from 'three'
import type {EnvironmentState} from '../../domain/types'
import {surfaceState} from '../environment/surface-state'
import {sceneView} from '../environment/scenes'
import type {SceneKind} from '../environment/scenes'
type Props={env:EnvironmentState;reduced:boolean;mobile:boolean;sceneKind:SceneKind}
function BranchLayer({env,reduced,mobile,variant}:{variant:'foreground'|'summer'|'winter'|'garden'}&Props){
 const {size}=useThree(),view=sceneView(variant==='garden'?'garden':'courtyard',mobile,size.width,size.height)
 const texture=useTexture(variant==='garden'?'/scene/garden-near.webp':`/scene/blossom-${variant}.webp`),ref=useRef<Mesh>(null),time=useRef(0);texture.colorSpace=SRGBColorSpace
 const state=surfaceState(env),target=variant==='garden'?1:variant==='foreground'?(env.season==='spring'?1:0):variant==='summer'?(env.season==='summer'||env.season==='autumn'?1:0):(env.season==='winter'?1:0)
 const tint=useMemo(()=>new Color(state.tint),[state.tint])
 const material=useMemo(()=>{
  const m=new MeshBasicMaterial({map:texture,transparent:true,opacity:variant==='foreground'||variant==='garden'?1:0,alphaTest:.015,depthWrite:false,toneMapped:false})
  m.onBeforeCompile=shader=>{shader.uniforms.breezeTime={value:0};shader.uniforms.breezeStrength={value:0};shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float breezeTime;\nuniform float breezeStrength;').replace('#include <begin_vertex>',`#include <begin_vertex>
   float tip=(1.0-uv.y)*(1.0-abs(uv.x-.5)*2.0);
   transformed.x+=sin(breezeTime*.55+uv.y*3.0)*tip*breezeStrength*.18;
   transformed.y+=cos(breezeTime*.43+uv.x*4.0)*tip*breezeStrength*.10;
  `);
   shader.uniforms.autumnLeaves={value:0};shader.fragmentShader='uniform float autumnLeaves;\n'+shader.fragmentShader
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    float leafMask=smoothstep(.025,.13,diffuseColor.g-diffuseColor.b);
    float luminance=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
    vec3 autumn=vec3(1.12,.58,.19)*luminance;
    diffuseColor.rgb=mix(diffuseColor.rgb,autumn,leafMask*autumnLeaves);
   `);m.userData.shader=shader};m.customProgramCacheKey=()=> 'blossom-season-v2';return m
 },[texture,variant])
 useEffect(()=>()=>material.dispose(),[material])
 useFrame(({pointer},dt)=>{const d=Math.min(dt,.05);if(!reduced&&!document.hidden)time.current+=d;const shader=material.userData.shader;if(shader){shader.uniforms.breezeTime.value=time.current;shader.uniforms.breezeStrength.value=reduced?0:env.windStrength;shader.uniforms.autumnLeaves.value+=((env.season==='autumn'?1:0)-shader.uniforms.autumnLeaves.value)*(1-Math.exp(-d*1.2))}material.opacity+=(target-material.opacity)*(1-Math.exp(-d*1.8));material.color.lerp(tint,1-Math.exp(-d*1.5));if(ref.current){ref.current.position.x+=(view.x+(reduced?0:-pointer.x*.16)-ref.current.position.x)*d*3;ref.current.position.y+=((reduced?0:-pointer.y*.07)-ref.current.position.y)*d*3}})
 return <mesh ref={ref} material={material} position={[view.x,0,variant==='garden'?.2:1.6]} scale={[view.scaleX,variant==='garden'?view.scaleY:1,1]} raycast={()=>null}><planeGeometry args={[16.72,9.41,32,16]}/></mesh>
}
export function BlossomForeground(props:Props){
 const [summerSeen,setSummerSeen]=useState(false),[winterSeen,setWinterSeen]=useState(false)
 useEffect(()=>{if(props.env.season==='summer'||props.env.season==='autumn')setSummerSeen(true);if(props.env.season==='winter')setWinterSeen(true)},[props.env.season])
 if(props.sceneKind==='garden')return <BranchLayer {...props} variant="garden"/>
 return <><BranchLayer {...props} variant="foreground"/>{summerSeen&&<Suspense fallback={null}><BranchLayer {...props} variant="summer"/></Suspense>}{winterSeen&&<Suspense fallback={null}><BranchLayer {...props} variant="winter"/></Suspense>}</>
}
