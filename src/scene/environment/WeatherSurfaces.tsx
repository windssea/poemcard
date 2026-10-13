import {Suspense,useEffect,useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {useTexture} from '@react-three/drei'
import {Color,Mesh,MeshBasicMaterial,SRGBColorSpace} from 'three'
import type {EnvironmentState} from '../../domain/types'
import {surfaceState} from './surface-state'
import {scenes} from './scenes'
import type {SceneKind} from './scenes'
import {TextureBoundary} from '../TextureBoundary'

// Registered photographic plates supply microdetail; the shader supplies motion and light.
type Props={kind:'winter'|'wet';sceneKind:SceneKind;env:EnvironmentState;reduced:boolean}
function WeatherSurfaceContent({kind,env,reduced,sceneKind}:Props){
 const definition=scenes[sceneKind],garden=sceneKind==='garden'
 const [texture,mask]=useTexture([`/scene/${definition[kind]}.webp`,`/scene/${definition.mid}.webp`]);texture.colorSpace=SRGBColorSpace
 const opacity=useRef(0),time=useRef(0),state=surfaceState(env),target=kind==='winter'?state.snow:state.wet*(state.snow?.28:1)
 const mesh=useRef<Mesh>(null)
 const tint=useMemo(()=>new Color(state.tint),[state.tint])
 const material=useMemo(()=>{
  const m=new MeshBasicMaterial({map:texture,transparent:true,opacity:0,depthWrite:false,toneMapped:false})
   m.onBeforeCompile=shader=>{
    shader.uniforms.rainTime={value:0};shader.uniforms.rainMotion={value:1}
    shader.uniforms.architectureMask={value:mask}
    shader.fragmentShader='uniform float rainTime;uniform float rainMotion;uniform sampler2D architectureMask;\n'+shader.fragmentShader
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
     vec2 uvRain=vMapUv;
     ${garden?'':'diffuseColor.a*=texture2D(architectureMask,uvRain).a;'}
     float ground=1.0-smoothstep(${garden?'.32,.41':'.072,.105'},uvRain.y);
     float glint=0.0;
     if(ground>.001&&rainMotion>.001){for(int i=0;i<7;i++){
      float seed=float(i);
      vec2 centre=vec2(fract(sin(seed*78.7+3.0)*437.2),.012+fract(sin(seed*31.7+8.0)*731.6)*${garden?'.31':'.07'});
      float age=fract(rainTime*.38+seed*.137);
      vec2 q=(uvRain-centre)*vec2(1.0,5.5);
      float radius=.005+age*.046;
      float ring=exp(-pow((length(q)-radius)/.0019,2.0));
      glint+=ring*(1.0-age)*smoothstep(0.0,.16,age);
     }}
     diffuseColor.rgb+=vec3(.13,.15,.14)*glint*ground*rainMotion;
    `);m.userData.shader=shader
   }
   m.customProgramCacheKey=()=> `scene-weather-${sceneKind}-${kind}`
  return m
 },[texture,mask,kind,garden,sceneKind])
 useEffect(()=>()=>material.dispose(),[material])
 useFrame((_,dt)=>{
  const d=Math.min(dt,.05);opacity.current+=(target-opacity.current)*(1-Math.exp(-d*(target>opacity.current?1.05:.42)))
  material.opacity=opacity.current;if(mesh.current)mesh.current.visible=opacity.current>.001;material.color.lerp(tint,1-Math.exp(-d*1.5))
  if(!reduced&&!document.hidden)time.current+=d
  const shader=material.userData.shader;if(shader){shader.uniforms.rainTime.value=time.current;shader.uniforms.rainMotion.value=reduced||kind!=='wet'?0:state.wet}
 })
 return <mesh ref={mesh} visible={false} position={[0,0,kind==='winter'?.022:.028]} material={material} raycast={()=>null}><planeGeometry args={[16.72,9.41]}/></mesh>
}
export function WeatherSurface(props:Props){const scene=scenes[props.sceneKind];return <TextureBoundary urls={[`/scene/${scene[props.kind]}.webp`,`/scene/${scene.mid}.webp`]}><Suspense fallback={null}><WeatherSurfaceContent {...props}/></Suspense></TextureBoundary>}
