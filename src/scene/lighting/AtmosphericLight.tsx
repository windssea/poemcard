import {useEffect,useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {AdditiveBlending,BufferAttribute,BufferGeometry,Color,DoubleSide,Group,ShaderMaterial} from 'three'
import {Bloom,EffectComposer,Vignette} from '@react-three/postprocessing'
import type {EnvironmentState} from '../../domain/types'
const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`
const fragment=`varying vec2 vUv;uniform float time;uniform float strength;uniform vec3 tint;
void main(){float edge=pow(max(0.0,1.0-abs(vUv.x-.5)*2.0),2.6);float ends=smoothstep(0.0,.17,vUv.y)*smoothstep(1.0,.65,vUv.y);float drift=.86+.14*sin(time*.25+vUv.y*8.0);gl_FragColor=vec4(tint,edge*ends*strength*drift);}`
function Shafts({env,reduced,low}:{env:EnvironmentState;reduced:boolean;low:boolean}){
 const night=env.timeOfDay<6||env.timeOfDay>=19
 const material=useMemo(()=>new ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:{time:{value:0},strength:{value:0},tint:{value:new Color('#ffe1a1')}},transparent:true,depthWrite:false,side:DoubleSide,blending:AdditiveBlending,toneMapped:false}),[])
 useEffect(()=>()=>material.dispose(),[material])
 useFrame((_,dt)=>{if(!reduced)material.uniforms.time.value+=Math.min(dt,.05);const target=night?.028:env.weather==='clear'?.15:.025;material.uniforms.strength.value+=(target-material.uniforms.strength.value)*Math.min(1,dt*2);material.uniforms.tint.value.lerp(new Color(night?'#9cbcd8':env.timeOfDay>=17?'#ffc47a':'#ffe7b4'),Math.min(1,dt*2))})
 // Soft geometry shafts approximate suspended haze; opaque scene depth masks them.
 return <group>{Array.from({length:low?3:6},(_,i)=><mesh key={i} position={[-4.5+i*1.55,2.6,-3.2+(i%2)*.6]} rotation={[0,0,.5]} material={material} renderOrder={2}><planeGeometry args={[.55+(i%3)*.15,5.4]}/></mesh>)}</group>
}
function Dust({env,reduced,low}:{env:EnvironmentState;reduced:boolean;low:boolean}){
 const group=useRef<Group>(null),night=env.timeOfDay<6||env.timeOfDay>=19
 const geometry=useMemo(()=>{const n=low?65:180,g=new BufferGeometry(),a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=Math.sin(i*12.73)*5.4;a[i*3+1]=.7+(i*.137)%3.8;a[i*3+2]=-2.8+Math.cos(i*8.23)*3}g.setAttribute('position',new BufferAttribute(a,3));return g},[low])
 const material=useMemo(()=>new ShaderMaterial({transparent:true,depthWrite:false,blending:AdditiveBlending,toneMapped:false,uniforms:{time:{value:0},tint:{value:new Color('#eed9ab')},strength:{value:1}},vertexShader:`uniform float time;varying float sparkle;void main(){vec3 p=position;p.x+=sin(time*.18+position.y*2.0)*.14;p.y+=sin(time*.22+position.x)*.11;vec4 mv=modelViewMatrix*vec4(p,1.0);sparkle=.35+.65*pow(.5+.5*sin(time*.6+position.x*8.0),3.0);gl_PointSize=clamp(22.0/-mv.z,1.0,3.5);gl_Position=projectionMatrix*mv;}`,fragmentShader:`uniform vec3 tint;uniform float strength;varying float sparkle;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.12,d);gl_FragColor=vec4(tint,a*sparkle*strength);}`}),[])
 useEffect(()=>()=>geometry.dispose(),[geometry]);useEffect(()=>()=>material.dispose(),[material])
 useFrame((_,dt)=>{if(!reduced)material.uniforms.time.value+=Math.min(dt,.05);material.uniforms.tint.value.lerp(new Color(night?'#d3e3a1':'#f8e6b9'),Math.min(1,dt*2));const target=env.weather==='rain'||env.weather==='snow'?.15:night?.75:.5;material.uniforms.strength.value+=(target-material.uniforms.strength.value)*Math.min(1,dt*2)})
 return <group ref={group}><points geometry={geometry} material={material}/></group>
}
export function AtmosphericLight({env,reduced,low}:{env:EnvironmentState;reduced:boolean;low:boolean}){return <><Shafts env={env} reduced={reduced} low={low}/><Dust env={env} reduced={reduced} low={low}/>{!low&&<EffectComposer multisampling={0}><Bloom mipmapBlur intensity={.35} luminanceThreshold={1.1} luminanceSmoothing={.3}/><Vignette eskil={false} offset={.25} darkness={.25}/></EffectComposer>}</>}
