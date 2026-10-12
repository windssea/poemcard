import {useEffect,useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {Color,DoubleSide,Group,Mesh,MeshBasicMaterial,ShaderMaterial,Shape,ShapeGeometry} from 'three'
import type {EnvironmentState} from '../../domain/types'
const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`
const noise=`float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}float fbm(vec2 p){return n(p)*.55+n(p*2.07)*.27+n(p*4.13)*.12+n(p*8.3)*.06;}`
function Veil({type,position,dimensions,env,reduced,mobile}:{type:'cloud'|'haze'|'shadow';position:[number,number,number];dimensions:[number,number];env:EnvironmentState;reduced:boolean;mobile:boolean}){
 const mesh=useRef<Mesh>(null),time=useRef(0)
 const material=useMemo(()=>new ShaderMaterial({vertexShader:vertex,fragmentShader:`varying vec2 vUv;uniform float time;uniform float strength;uniform vec3 tint;${noise}void main(){vec2 p=vUv*vec2(5.,2.);p.x-=time*.014;p.y+=sin(time*.11)*.035;float f=fbm(p);float edge=smoothstep(0.,.12,vUv.x)*smoothstep(1.,.85,vUv.x)*smoothstep(0.,.16,vUv.y)*smoothstep(1.,.78,vUv.y);float shape=${type==='shadow'?'smoothstep(.4,.7,f)':'smoothstep(.35,.7,f)'};gl_FragColor=vec4(tint,shape*edge*strength);}`,uniforms:{time:{value:0},strength:{value:0},tint:{value:new Color(type==='shadow'?'#352512':'#f2eee4')}},transparent:true,depthWrite:false,toneMapped:false}),[type])
 useEffect(()=>()=>material.dispose(),[material])
 useFrame(({pointer},dt)=>{if(!reduced&&!document.hidden)time.current+=Math.min(dt,.05);material.uniforms.time.value=time.current*(.6+env.windStrength);const night=env.timeOfDay<6||env.timeOfDay>=19;const strength=type==='shadow'?(night?.025:env.weather==='clear'?.14:.05):type==='cloud'?(env.weather==='clear'?.29:.46):.19;material.uniforms.strength.value+=(strength-material.uniforms.strength.value)*Math.min(1,dt*2);material.uniforms.tint.value.lerp(new Color(type==='shadow'?'#352512':night?'#9fb2c5':'#f2eee4'),Math.min(1,dt*2));if(mesh.current){const depth=type==='haze'?.1:type==='cloud'?.018:.035;mesh.current.position.x=position[0]+(mobile?2.3:0)+(reduced?0:-pointer.x*depth)}})
 return <mesh ref={mesh} position={position} material={material} raycast={()=>null}><planeGeometry args={dimensions}/></mesh>
}
function Bird({offset,reduced}:{offset:number;reduced:boolean}){
 const bird=useRef<Group>(null),left=useRef<Mesh>(null),right=useRef<Mesh>(null),time=useRef(0)
 const material=useMemo(()=>new MeshBasicMaterial({color:'#4c534b',side:DoubleSide,transparent:true,depthWrite:false}),[])
 const wing=useMemo(()=>{const s=new Shape();s.moveTo(0,0);s.quadraticCurveTo(.06,.07,.19,.05);s.lineTo(.12,-.015);s.quadraticCurveTo(.06,.015,0,-.02);s.closePath();return new ShapeGeometry(s)},[])
 useEffect(()=>()=>wing.dispose(),[wing])
 useEffect(()=>()=>material.dispose(),[material])
 useFrame((_,dt)=>{if(!bird.current)return;if(!reduced&&!document.hidden)time.current+=Math.min(dt,.05);const phase=(time.current-offset+42)%42,p=(phase-6)/10;bird.current.visible=!reduced&&p>=0&&p<=1;if(!bird.current.visible)return;material.opacity=Math.min(1,p/.08,(1-p)/.15);bird.current.position.set(-8.1+p*8.5,2.55+Math.sin(p*Math.PI)*.6-offset*.07,.1);bird.current.scale.setScalar(.55+offset*.035);if(left.current)left.current.rotation.z=.15+Math.sin(time.current*9+offset)*.55;if(right.current)right.current.rotation.z=-.15-Math.sin(time.current*9+offset)*.55})
 return <group ref={bird} visible={false} raycast={()=>null}>
  <mesh scale={[.08,.024,.021]} material={material}><sphereGeometry args={[1,8,5]}/></mesh>
  <mesh ref={right} geometry={wing} material={material}/>
  <mesh ref={left} geometry={wing} scale={[-1,1,1]} material={material}/>
 </group>
}
function DriftingPetals({env,reduced,low}:{env:EnvironmentState;reduced:boolean;low:boolean}){
 const group=useRef<Group>(null),time=useRef(0),wet=env.weather==='rain'||env.weather==='snow',count=wet?(low?45:100):(low?14:30)
 const positions=useMemo(()=>Array.from({length:count},(_,i)=>[Math.sin(i*8.7)*8.5,Math.cos(i*13.2)*4.8,.6+(i%6)*.5] as [number,number,number]),[count])
 useFrame(({pointer},dt)=>{if(!group.current)return;if(reduced||document.hidden)return;const d=Math.min(dt,.05);time.current+=d;group.current.position.x+=(-pointer.x*.14-group.current.position.x)*d*2;group.current.children.forEach((p,i)=>{const gust=Math.sin(time.current*.28+i*.23)*env.windStrength;p.position.x+=d*(.14+gust*.35+i%3*.025);p.position.y-=d*(env.weather==='rain'?2.7:env.weather==='snow'?.2:.085+i%4*.02);p.position.z=positions[i][2]+Math.sin(time.current*.45+i)*.1;p.rotation.x=time.current*.6+i;p.rotation.z=Math.sin(time.current*.45+i)*1.1;if(p.position.y<-5){p.position.y=5;p.position.x=Math.sin(i*8.7)*8.5}if(p.position.x>9)p.position.x=-9})})
 return <group ref={group} key={`${env.weather}-${count}`} raycast={()=>null}>{positions.map((p,i)=><mesh key={i} position={p} scale={env.weather==='rain'?[.003,.09,.003]:env.weather==='snow'?[.018,.018,.018]:[.028+(i%5)*.009,.017+(i%3)*.006,.007]}>
  <sphereGeometry args={[1,8,5]}/><meshStandardMaterial color={wet?'#e7e8e2':env.season==='autumn'?'#c99851':env.season==='summer'?'#b9caa2':i%3?'#f4e2c9':'#f7d9cc'} roughness={1}/>
 </mesh>)}</group>
}
export function CourtyardAtmosphere({env,reduced,low,mobile}:{env:EnvironmentState;reduced:boolean;low:boolean;mobile:boolean}){return <>
 <Veil type="cloud" position={[-3.7,2.45,-.34]} dimensions={[9.2,2.4]} env={env} reduced={reduced} mobile={mobile}/>
 <Veil type="cloud" position={[-4.6,2,-.32]} dimensions={[7.6,1]} env={env} reduced={reduced} mobile={mobile}/>
 <Veil type="shadow" position={[-2.6,-1.95,-.29]} dimensions={[10.1,3.4]} env={env} reduced={reduced} mobile={mobile}/>
 {!low&&<Veil type="haze" position={[0,-3.95,1.1]} dimensions={[16.5,1.15]} env={env} reduced={reduced} mobile={mobile}/>}
 <Bird offset={0} reduced={reduced}/>{!low&&<Bird offset={1.1} reduced={reduced}/>}
 <DriftingPetals env={env} reduced={reduced} low={low}/>
 </>}
