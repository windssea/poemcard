import {Suspense,useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react'
import {Canvas,useFrame,useThree} from '@react-three/fiber'
import {useTexture} from '@react-three/drei'
import {AmbientLight,Color,DirectionalLight,Group,MeshBasicMaterial,OrthographicCamera,ShadowMaterial,SRGBColorSpace} from 'three'
import type {EnvironmentState,PoemSummary} from '../domain/types'
import {CourtyardBookmarks} from './bookmarks/CourtyardBookmarks'
import {CourtyardAtmosphere} from './atmosphere/CourtyardAtmosphere'
import {BlossomForeground} from './atmosphere/BlossomForeground'
import {CourtyardDetails} from './atmosphere/CourtyardDetails'
import {WeatherSurface} from './environment/WeatherSurfaces'
import {surfaceState} from './environment/surface-state'
import {scenes,sceneView,sceneMedia} from './environment/scenes'
import type {SceneKind} from './environment/scenes'
import {TextureBoundary} from './TextureBoundary'
type Props={env:EnvironmentState;sceneKind:SceneKind;poems:PoemSummary[];onSelect:(id:string)=>void;onHover:(p:PoemSummary|null)=>void;low:boolean;reduced:boolean;page:number;active?:boolean;onReady?:()=>void;onFallback?:()=>void}
function Layout({kind}:{kind:SceneKind}){const {camera,size,invalidate}=useThree();useLayoutEffect(()=>{const c=camera as OrthographicCamera;const y=sceneView(kind,size.width<700,size.width,size.height).cameraY;c.zoom=size.height/8.85;c.position.set(0,y,15);c.lookAt(0,y,0);c.updateProjectionMatrix();invalidate()},[camera,size.width,size.height,invalidate,kind]);return null}
function Background({env,mobile,reduced,onReady,sceneKind}:{env:EnvironmentState;sceneKind:SceneKind;mobile:boolean;reduced:boolean;onReady?:()=>void;onFallback?:()=>void}){
 const announced=useRef(false)
 useFrame(()=>{if(!announced.current){announced.current=true;onReady?.()}})
 const {size}=useThree(),definition=scenes[sceneKind],view=sceneView(sceneKind,mobile,size.width,size.height),mid=sceneMedia(sceneKind,mobile).mid
 const [texture,farTexture]=useTexture([`/scene/${mid}.webp`,`/scene/${definition.far}.webp`]),bg=useRef<Group>(null),far=useRef<Group>(null);texture.colorSpace=farTexture.colorSpace=SRGBColorSpace
 const state=surfaceState(env),target=useMemo(()=>new Color(state.tint),[state.tint]);const tint=useRef(new Color('#fff'))
 const [winterSeen,setWinterSeen]=useState(false),[wetSeen,setWetSeen]=useState(false)
 useEffect(()=>{if(state.snow)setWinterSeen(true);if(state.wet)setWetSeen(true)},[state.snow,state.wet])
 const material=useMemo(()=>{
  const m=new MeshBasicMaterial({map:texture,transparent:true,alphaTest:.01,toneMapped:false})
  m.onBeforeCompile=shader=>{
   shader.uniforms.seasonColour={value:new Color('#fff')};shader.uniforms.duskLight={value:0}
   shader.fragmentShader='uniform vec3 seasonColour;uniform float duskLight;\n'+shader.fragmentShader
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    float foliageZone=smoothstep(.63,.72,vMapUv.y)*(1.0-smoothstep(.50,.59,vMapUv.x));
    float foliage=foliageZone*smoothstep(.02,.15,diffuseColor.g-diffuseColor.b)*.75;
    diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*seasonColour,foliage);
    diffuseColor.rgb*=1.0+duskLight*vec3(.06,.02,-.02)*(1.0-vMapUv.x);
   `);m.userData.shader=shader
  };m.customProgramCacheKey=()=> 'courtyard-season-light-v1';return m
 },[texture])
 const farMaterial=useMemo(()=>new MeshBasicMaterial({map:farTexture,toneMapped:false}),[farTexture])
 const shadow=useMemo(()=>{
  const m=new ShadowMaterial({transparent:true,depthWrite:false,opacity:.14})
  m.onBeforeCompile=shader=>{shader.uniforms.architectureMask={value:texture};shader.vertexShader='varying vec2 receivingUv;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nreceivingUv=uv;');shader.fragmentShader='uniform sampler2D architectureMask;varying vec2 receivingUv;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <fog_fragment>','gl_FragColor.a*=texture2D(architectureMask,receivingUv).a;\n#include <fog_fragment>')};m.customProgramCacheKey=()=> 'architecture-shadow-mask-v1';return m
 },[texture])
 useEffect(()=>()=>{material.dispose();farMaterial.dispose();shadow.dispose()},[material,farMaterial,shadow])
 const leaf=useMemo(()=>new Color(state.leaf),[state.leaf])
 useFrame(({pointer},dt)=>{const d=Math.min(dt,.05);tint.current.lerp(target,1-Math.exp(-d*1.5));material.color.copy(tint.current);farMaterial.color.copy(tint.current);shadow.opacity=state.night?.08:env.weather==='clear'?.14:.07;const shader=material.userData.shader;if(shader){shader.uniforms.seasonColour.value.lerp(leaf,1-Math.exp(-d));shader.uniforms.duskLight.value+=(state.dusk-shader.uniforms.duskLight.value)*d}if(far.current){far.current.position.x+=((reduced?0:-pointer.x*.055)-far.current.position.x)*d*2;far.current.position.y+=((reduced?0:-pointer.y*.022)-far.current.position.y)*d*2}})
 return <><color attach="background" args={['#ded7c8']}/>
 <group ref={bg} position={[view.x,view.y,-.4]} scale={[1,sceneKind==='courtyard'?view.scaleY:1,1]}>
 <group ref={far} position={[0,0,-1.4]} scale={1.02}><mesh material={farMaterial} raycast={()=>null}><planeGeometry args={[16.72,9.41]}/></mesh>
 {sceneKind==='garden'&&winterSeen&&<Suspense fallback={null}><WeatherSurface sceneKind={sceneKind} kind="winter" env={env} reduced={reduced}/></Suspense>}
 {sceneKind==='garden'&&wetSeen&&<Suspense fallback={null}><WeatherSurface sceneKind={sceneKind} kind="wet" env={env} reduced={reduced}/></Suspense>}
 </group>
 <mesh material={material} scale={[view.scaleX,sceneKind==='garden'?view.scaleY:1,1]} raycast={()=>null}><planeGeometry args={[16.72,9.41]}/></mesh>
 {sceneKind==='courtyard'&&winterSeen&&<Suspense fallback={null}><WeatherSurface sceneKind={sceneKind} kind="winter" env={env} reduced={reduced}/></Suspense>}
 {sceneKind==='courtyard'&&wetSeen&&<Suspense fallback={null}><WeatherSurface sceneKind={sceneKind} kind="wet" env={env} reduced={reduced}/></Suspense>}
 <mesh position={[0,0,.04]} scale={[view.scaleX,sceneKind==='garden'?view.scaleY:1,1]} material={shadow} receiveShadow raycast={()=>null}><planeGeometry args={[16.72,9.41]}/></mesh></group>
 </>
}
function CourtyardLight({env,low}:{env:EnvironmentState;low:boolean}){
 const ambient=useRef<AmbientLight>(null),sun=useRef<DirectionalLight>(null),state=surfaceState(env)
 const colour=useMemo(()=>new Color(state.night?'#a9c4e5':state.dusk>0?'#ffd3a0':'#fff1db'),[state.night,state.dusk])
 useFrame((_,dt)=>{const a=1-Math.exp(-Math.min(dt,.05)*1.6);if(ambient.current)ambient.current.intensity+=(state.ambient-ambient.current.intensity)*a;if(sun.current){sun.current.intensity+=(state.sun-sun.current.intensity)*a;sun.current.color.lerp(colour,a);sun.current.position.x+=(state.sunX-sun.current.position.x)*a}})
 return <><ambientLight ref={ambient} intensity={1.3}/><directionalLight ref={sun} position={[-6,8,9]} color="#fff1db" intensity={2.3} castShadow shadow-mapSize={[low?1024:2048,low?1024:2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-camera-far={30} shadow-normalBias={.01} shadow-bias={-.0002} shadow-radius={3}/></>
}
function Set({env,sceneKind,poems,onSelect,onHover,low,reduced,page,onReady,onFallback}:Props){
 const {size}=useThree(),mobile=size.width<700
 return <><CourtyardLight env={env} low={low}/>
 <TextureBoundary onFailure={onFallback} urls={[`/scene/${sceneMedia(sceneKind,mobile).mid}.webp`,`/scene/${scenes[sceneKind].far}.webp`]}><Suspense fallback={null}><Background key={sceneKind} sceneKind={sceneKind} env={env} mobile={mobile} reduced={reduced} onReady={onReady}/></Suspense></TextureBoundary>
 <Suspense fallback={null}><CourtyardBookmarks sceneKind={sceneKind} poems={poems} mobile={mobile} onSelect={onSelect} onHover={onHover} wind={env.windStrength} reduced={reduced} page={page}/></Suspense>
 <CourtyardAtmosphere sceneKind={sceneKind} env={env} reduced={reduced} low={low} mobile={mobile}/><CourtyardDetails sceneKind={sceneKind} env={env} reduced={reduced} low={low} mobile={mobile}/><TextureBoundary urls={['/scene/blossom-foreground.webp','/scene/blossom-summer.webp','/scene/blossom-winter.webp','/scene/garden-near.webp']}><Suspense fallback={null}><BlossomForeground sceneKind={sceneKind} env={env} reduced={reduced} mobile={mobile}/></Suspense></TextureBoundary><Layout kind={sceneKind}/>
 </>
}
export default function Courtyard(props:Props){return <Canvas orthographic shadows frameloop={props.active===false?'never':'always'} dpr={props.low?[1,2]:[1,2.5]} camera={{position:[0,0,15],zoom:100,near:.1,far:40}} gl={{antialias:true}} fallback={<div className="fallback">设备暂无法显示 3D，可通过寻诗阅读。</div>}><Suspense fallback={null}><Set {...props}/></Suspense></Canvas>}
