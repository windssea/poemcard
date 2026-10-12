import {useEffect,useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {useTexture} from '@react-three/drei'
import {Color,Mesh,MeshBasicMaterial,SRGBColorSpace} from 'three'
import type {EnvironmentState} from '../../domain/types'
export function BlossomForeground({env,reduced,mobile}:{env:EnvironmentState;reduced:boolean;mobile:boolean}){
 const texture=useTexture('/scene/blossom-foreground.webp'),ref=useRef<Mesh>(null),time=useRef(0);texture.colorSpace=SRGBColorSpace
 const material=useMemo(()=>{
  const m=new MeshBasicMaterial({map:texture,transparent:true,alphaTest:.015,depthWrite:false,toneMapped:false})
  m.onBeforeCompile=shader=>{shader.uniforms.breezeTime={value:0};shader.uniforms.breezeStrength={value:0};shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float breezeTime;\nuniform float breezeStrength;').replace('#include <begin_vertex>',`#include <begin_vertex>
   float tip=(1.0-uv.y)*(1.0-abs(uv.x-.5)*2.0);
   transformed.x+=sin(breezeTime*.55+uv.y*3.0)*tip*breezeStrength*.18;
   transformed.y+=cos(breezeTime*.43+uv.x*4.0)*tip*breezeStrength*.10;
  `);m.userData.shader=shader};m.customProgramCacheKey=()=> 'blossom-foreground-v1';return m
 },[texture])
 useEffect(()=>()=>material.dispose(),[material])
 useFrame(({pointer},dt)=>{const d=Math.min(dt,.05);if(!reduced&&!document.hidden)time.current+=d;const shader=material.userData.shader;if(shader){shader.uniforms.breezeTime.value=time.current;shader.uniforms.breezeStrength.value=reduced?0:env.windStrength}const night=env.timeOfDay<6||env.timeOfDay>=19;material.color.lerp(new Color(night?'#748496':env.timeOfDay>=17?'#ffe0b5':'#ffffff'),d*2);if(ref.current){ref.current.position.x+=((mobile?2.3:0)+(reduced?0:-pointer.x*.16)-ref.current.position.x)*d*3;ref.current.position.y+=((reduced?0:-pointer.y*.07)-ref.current.position.y)*d*3}})
 return <mesh ref={ref} material={material} position={[mobile?2.3:0,0,1.6]} raycast={()=>null}><planeGeometry args={[16.72,9.41,32,16]}/></mesh>
}
