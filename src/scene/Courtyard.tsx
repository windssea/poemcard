import {Suspense,useEffect,useLayoutEffect,useMemo,useRef} from 'react'
import {Canvas,useFrame,useThree} from '@react-three/fiber'
import {useTexture} from '@react-three/drei'
import {Color,Group,MeshBasicMaterial,OrthographicCamera,SRGBColorSpace} from 'three'
import type {EnvironmentState,PoemSummary} from '../domain/types'
import {CourtyardBookmarks} from './bookmarks/CourtyardBookmarks'
import {CourtyardAtmosphere} from './atmosphere/CourtyardAtmosphere'
import {BlossomForeground} from './atmosphere/BlossomForeground'
type Props={env:EnvironmentState;poems:PoemSummary[];onSelect:(id:string)=>void;onHover:(p:PoemSummary|null)=>void;low:boolean;reduced:boolean;page:number;active?:boolean}
function Layout(){const {camera,size,invalidate}=useThree();useLayoutEffect(()=>{const c=camera as OrthographicCamera;c.zoom=size.height/8.85;c.position.set(0,.28,15);c.lookAt(0,.28,0);c.updateProjectionMatrix();invalidate()},[camera,size.height,invalidate]);return null}
function Set({env,poems,onSelect,onHover,low,reduced,page}:Props){
 const {size}=useThree(),mobile=size.width<700,texture=useTexture('/scene/courtyard-clean.webp'),bg=useRef<Group>(null);texture.colorSpace=SRGBColorSpace
 const night=env.timeOfDay<6||env.timeOfDay>=19,target=useMemo(()=>new Color(night?'#677c94':env.timeOfDay>=17?'#ffe0b5':env.weather==='rain'?'#bcc5c6':'#ffffff'),[night,env.timeOfDay,env.weather]);const tint=useRef(new Color('#fff'))
 const material=useRef<MeshBasicMaterial>(null)
 useFrame((_,dt)=>{tint.current.lerp(target,Math.min(1,dt*1.5));if(material.current)material.current.color.copy(tint.current)})
 return <><color attach="background" args={['#ded7c8']}/><ambientLight intensity={night?.7:1.3}/><directionalLight position={[-6,8,9]} color={night?'#aac2dc':'#ffeed0'} intensity={night?1:2.5} castShadow shadow-mapSize={[low?1024:2048,low?1024:2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-camera-far={30} shadow-normalBias={.01} shadow-bias={-.0002}/>
 <group ref={bg} position={[mobile?2.3:0,0,-.4]}><mesh><planeGeometry args={[16.72,9.41]}/><meshBasicMaterial ref={material} map={texture} toneMapped={false}/></mesh><mesh position={[0,0,.015]} receiveShadow><planeGeometry args={[16.72,9.41]}/><shadowMaterial opacity={night?.08:.14} transparent depthWrite={false}/></mesh></group>
 <CourtyardBookmarks poems={poems} mobile={mobile} onSelect={onSelect} onHover={onHover} wind={env.windStrength} reduced={reduced} page={page}/>
 <CourtyardAtmosphere env={env} reduced={reduced} low={low} mobile={mobile}/><BlossomForeground env={env} reduced={reduced} mobile={mobile}/><Layout/>
 </>
}
export default function Courtyard(props:Props){return <Canvas orthographic shadows frameloop={props.active===false?'never':'always'} dpr={props.low?1:[1,1.5]} camera={{position:[0,0,15],zoom:100,near:.1,far:40}} gl={{antialias:true}} fallback={<div className="fallback">设备暂无法显示 3D，可从下方诗名阅读。</div>}><Suspense fallback={null}><Set {...props}/></Suspense></Canvas>}
