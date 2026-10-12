import {Suspense,useMemo,useRef,useLayoutEffect} from 'react'
import {Canvas,useFrame,useThree} from '@react-three/fiber'
import {Sky} from '@react-three/drei'
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js'
import {Group,Vector3,Color,BufferGeometry,Float32BufferAttribute,InstancedMesh,Object3D,DirectionalLight} from 'three'
import type {EnvironmentState,PoemSummary} from '../domain/types'
import {seasons} from './environment/presets'
import {Stream} from './water/Stream'
import {Bookmarks} from './bookmarks/Bookmarks'
import {woodMap,woodBump,stoneMap,stoneBump} from './materials/surfaces'
import {AtmosphericLight} from './lighting/AtmosphericLight'
function Box({p,s,color='#b89970',stone=false}:{p:[number,number,number];s:[number,number,number];color?:string;stone?:boolean}){return <mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={color} map={stone?stoneMap:woodMap} bumpMap={stone?stoneBump:woodBump} bumpScale={stone?.09:.018} roughness={stone?.94:.72}/></mesh>}
function Lantern({position,night}:{position:[number,number,number];night:boolean}){return <group position={position}>
 <mesh position={[0,.42,0]}><cylinderGeometry args={[.01,.01,.6,6]}/><meshStandardMaterial color="#615039"/></mesh>
 <mesh><sphereGeometry args={[.32,24,16]}/><meshStandardMaterial color="#edd0a0" emissive="#ffab4a" emissiveIntensity={night?2.4:.22} toneMapped={false} roughness={.85}/></mesh>
 {Array.from({length:12},(_,i)=><mesh key={i} rotation={[0,i*Math.PI/6,0]} scale={[1,1.25,1]}><torusGeometry args={[.29,.005,4,32]}/><meshStandardMaterial color="#a78555"/></mesh>)}
 {[-.31,.31].map(y=><mesh key={y} position={[0,y,0]}><cylinderGeometry args={[.13,.13,.06,12]}/><meshStandardMaterial color="#544132"/></mesh>)}
 <mesh position={[0,-.47,0]}><cylinderGeometry args={[.015,.03,.25,8]}/><meshStandardMaterial color="#a34832"/></mesh>
 {night&&<pointLight color="#ffbb71" intensity={8} distance={7}/>}
 </group>}
function Architecture({night}:{night:boolean}){return <group>
 <Box p={[0,-.1,-2.4]} s={[12,.5,7]} stone color="#666c61"/>
 {Array.from({length:19},(_,i)=><Box key={`floor${i}`} p={[0,.17,-5.85+i*.37]} s={[11.7,.07,.35]} color={i%3?'#b1a084':'#a59578'}/>)}
 {[-5.6,5.6].flatMap(x=>[-5.5,.7].map(z=><group key={`${x}${z}`}>
  <Box p={[x,.37,z]} s={[.66,.55,.66]} stone color="#888d7e"/>
  <mesh position={[x,2.65,z]} castShadow receiveShadow><cylinderGeometry args={[.19,.25,4.6,20]}/><meshStandardMaterial map={woodMap} bumpMap={woodBump} bumpScale={.04} color="#685036" roughness={.75}/></mesh>
  <Box p={[x,4.62,z]} s={[.85,.2,.75]}/><Box p={[x,4.8,z]} s={[.65,.22,.65]}/>
 </group>))}
 {[-5.5,-1.6,.7].map(z=><group key={z}><Box p={[0,4.65,z]} s={[12.5,.28,.25]}/><Box p={[0,4.93,z]} s={[12.8,.11,.48]} color="#4e4839"/></group>)}
 {Array.from({length:24},(_,i)=><Box key={`rafter${i}`} p={[-6+i*.52,5.03,-2.4]} s={[.09,.12,7.9]} color="#675039"/>)}
 {[-5.7,5.7].map(x=><group key={x}><Box p={[x,1.02,-2.5]} s={[.16,.16,6.5]}/><Box p={[x,.54,-2.5]} s={[.1,.1,6.5]}/>{Array.from({length:15},(_,i)=><Box key={i} p={[x,.74,-5.5+i*.43]} s={[.06,.52,.06]}/>)}</group>)}
 <Box p={[0,.55,-5.65]} s={[11.2,.12,.12]}/><Box p={[0,1.08,-5.65]} s={[11.2,.16,.16]}/>
 {Array.from({length:31},(_,i)=><Box key={`rail${i}`} p={[-5.45+i*.36,.78,-5.65]} s={[.045,.54,.045]}/>)}
 <Lantern position={[-5.1,3.55,-1.5]} night={night}/><Lantern position={[5.1,3.55,-1.5]} night={night}/>
 </group>}
function Branch({start,end,radius}:{start:Vector3;end:Vector3;radius:number}){const middle=start.clone().add(end).multiplyScalar(.5),direction=end.clone().sub(start);const q=new Group().quaternion.setFromUnitVectors(new Vector3(0,1,0),direction.clone().normalize());return <mesh position={middle} quaternion={q} castShadow><cylinderGeometry args={[radius*.4,radius,direction.length(),8]}/><meshStandardMaterial color="#625341" map={woodMap} roughness={1}/></mesh>}
function Foliage({season,seed}:{season:EnvironmentState['season'];seed:number}){const mesh=useRef<InstancedMesh>(null);useLayoutEffect(()=>{if(!mesh.current)return;const dummy=new Object3D(),color=new Color(seasons[season].leaf);for(let i=0;i<720;i++){const branch=Math.floor(i/80),j=i%80,angle=branch*2.4+seed,phase=j*2.399,rad=Math.sqrt((j+.5)/80);dummy.position.set(Math.cos(angle)*(1.1+branch*.09)+Math.cos(phase)*rad*.9,2.7+branch*.23+Math.sin(j*1.7+seed)*.5,Math.sin(angle)*1.3+Math.sin(phase)*rad*.75);dummy.rotation.set(Math.sin(j)*.8,phase,Math.cos(j*.7)*.5);dummy.scale.set(.12+(j%3)*.025,.035,.07);dummy.updateMatrix();mesh.current.setMatrixAt(i,dummy.matrix);mesh.current.setColorAt(i,color.clone().multiplyScalar(.7+(j%5)*.09))}mesh.current.instanceMatrix.needsUpdate=true;if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true},[season,seed]);return <instancedMesh ref={mesh} args={[undefined,undefined,720]} castShadow><icosahedronGeometry args={[1,0]}/><meshStandardMaterial roughness={1}/></instancedMesh>}
function Tree({position,season,seed}:{position:[number,number,number];season:EnvironmentState['season'];seed:number}){return <group position={position}>
 <Branch start={new Vector3(0,0,0)} end={new Vector3(.25,3.7,0)} radius={.23}/>
 {Array.from({length:9},(_,i)=>{const angle=i*2.4+seed,end=new Vector3(Math.cos(angle)*(1.1+i*.09),2.7+i*.23,Math.sin(angle)*1.3);return <group key={i}><Branch start={new Vector3(.12,1.5+i*.15,0)} end={end} radius={.1}/>
 </group>})}<Foliage season={season} seed={seed}/>
 </group>}
function Mountain({x,z,seed}:{x:number;z:number;seed:number}){const geometry=useMemo(()=>{const g=new BufferGeometry(),positions:number[]=[];const n=28;function p(i:number,j:number){const px=(i/n-.5)*25,pz=(j/n-.5)*19,h=Math.exp(-(px*px/100+pz*pz/60))*(8+seed%5);return [px,h*(.85+Math.sin(px*.6+seed)*Math.cos(pz*.7)*.15)-1,pz]};for(let i=0;i<n;i++)for(let j=0;j<n;j++){positions.push(...p(i,j),...p(i,j+1),...p(i+1,j),...p(i+1,j),...p(i,j+1),...p(i+1,j+1))}g.setAttribute('position',new Float32BufferAttribute(positions,3));const smooth=mergeVertices(g);g.dispose();smooth.computeVertexNormals();return smooth},[seed]);return <mesh geometry={geometry} position={[x,0,z]}><meshStandardMaterial color="#6c9186" roughness={1}/></mesh>}
function Landscape({season,low}:{season:EnvironmentState['season'];low:boolean}){return <group>
 <Box p={[0,-.55,-17]} s={[90,.8,20]} stone color={seasons[season].ground}/>
 {[-1,1].map(side=><group key={side}><Box p={[side*16,-.4,-3]} s={[12,.4,24]} stone color={seasons[season].ground}/>{Array.from({length:low?3:5},(_,i)=><Tree key={i} position={[side*(9+i%2*3),0,-8-i*3]} seed={i+side*9} season={season}/>)}</group>)}
 {Array.from({length:30},(_,i)=><mesh key={i} position={[Math.sin(i*3.1)*15,-.05,-8.5+Math.cos(i*2)*.7]} rotation={[i*.3,i,0]} scale={[.9+i%3*.25,.45,.7]} castShadow receiveShadow><icosahedronGeometry args={[.8,2]}/><meshStandardMaterial map={stoneMap} bumpMap={stoneBump} bumpScale={.1} color="#81887a" roughness={.98}/></mesh>)}
 {[-24,-5,17,35].map((x,i)=><Mountain key={x} x={x} z={-34-i%2*8} seed={i*7}/>)}
 {Array.from({length:14},(_,i)=><mesh key={`reed${i}`} position={[-11+i*1.7,.24,-8]} rotation={[0,0,Math.sin(i)*.12]}><cylinderGeometry args={[.014,.027,.7+i%3*.17,5]}/><meshStandardMaterial color="#8e9466"/></mesh>)}
 </group>}
function Atmosphere({env,reduced}:{env:EnvironmentState;reduced:boolean}){const ref=useRef<Group>(null);const coords=useMemo(()=>Array.from({length:140},(_,i)=>[Math.sin(i*17.7)*18,(i*.73)%9,-5-Math.abs(Math.cos(i*13.1))*16] as const),[]);const wet=env.weather==='rain'||env.weather==='snow';useFrame((_,dt)=>{if(!ref.current||reduced)return;ref.current.children.forEach((obj,i)=>{obj.position.y-=Math.min(dt,.05)*(env.weather==='rain'?8:.6);obj.position.x+=Math.sin(i)*dt*.15;if(obj.position.y<0)obj.position.y=9})});if(!wet&&env.season==='summer')return null;return <group ref={ref}>{coords.slice(0,wet?140:30).map((p,i)=><mesh key={i} position={[...p]} scale={env.weather==='rain'?[1,12,1]:[1,1,1]}><sphereGeometry args={[env.weather==='rain'?.006:.022,5,3]}/><meshBasicMaterial color={env.weather==='rain'?'#c6dbe1':env.weather==='snow'?'#ffffff':seasons[env.season].leaf}/></mesh>)}</group>}
function CameraRig({page,reduced}:{page:number;reduced:boolean}){const {camera,size}=useThree();const progress=useRef(page);useFrame((_,dt)=>{progress.current+= (page-progress.current)*Math.min(1,dt*6);const travel=reduced?0:Math.sin((page-progress.current)*Math.PI)*.7;camera.position.set(travel,3.35,size.width<700?14.8:13);camera.lookAt(travel*.15,2.2,-2)});return null}
export type SceneProps={env:EnvironmentState;poems:PoemSummary[];onSelect:(id:string)=>void;onHover:(poem:PoemSummary|null)=>void;low:boolean;reduced:boolean;page:number}
function World({env,poems,onSelect,onHover,low,reduced,page}:SceneProps){
 const light=useRef<DirectionalLight>(null),lightTime=useRef(0)
 const night=env.timeOfDay<6||env.timeOfDay>=19,cfg=seasons[env.season],bg=night?'#172f3c':env.weather==='clear'?'#bfd0c1':'#8faaa5'
 const sun=useMemo(()=>[-12,night?7:env.timeOfDay>=17?5:17,7] as [number,number,number],[env.timeOfDay,night])
 useFrame((_,dt)=>{if(reduced||!light.current)return;lightTime.current+=Math.min(dt,.05);light.current.position.x=sun[0]+Math.sin(lightTime.current*.08)*.35;light.current.intensity=(night?.9:env.weather==='clear'?3.2:1.3)*(1+Math.sin(lightTime.current*.17)*.025)})
 return <><color attach="background" args={[bg]}/><fog attach="fog" args={[bg,22,65]}/><hemisphereLight args={[night?'#839faf':'#e5e9d9','#514835',night?.65:1.1]}/>
 <directionalLight ref={light} position={sun} color={night?'#9ab9d9':env.timeOfDay>=17?'#ffb76d':'#fff0ce'} intensity={night?.9:env.weather==='clear'?3.2:1.3} castShadow shadow-mapSize={[low?1024:2048,low?1024:2048]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={18} shadow-camera-bottom={-18} shadow-camera-far={70} shadow-normalBias={.04} shadow-bias={-.0001}/>
 {!night&&<Sky sunPosition={sun} turbidity={env.weather==='clear'?3:10} rayleigh={1.2}/>}
 <Stream color={cfg.water} night={night} low={low} rain={env.weather==='rain'}/><Architecture night={night}/><Landscape season={env.season} low={low}/><Atmosphere env={env} reduced={reduced}/>
 <Suspense fallback={null}><Bookmarks poems={poems} onSelect={onSelect} onHover={onHover} wind={env.windStrength} reduced={reduced}/></Suspense><CameraRig page={page} reduced={reduced}/>
 <AtmosphericLight env={env} reduced={reduced} low={low}/>
 </>
}
export default function Scene(props:SceneProps){return <Canvas shadows dpr={props.low?1:[1,1.5]} camera={{position:[0,3.35,13],fov:43}} gl={{antialias:true}} fallback={<div className="fallback">设备无法开启 3D，可从寻诗入口阅读。</div>}><World {...props}/></Canvas>}
