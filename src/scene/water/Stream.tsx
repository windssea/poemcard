import {useEffect,useMemo} from 'react'
import {useFrame} from '@react-three/fiber'
import {Color,DataTexture,PlaneGeometry,RepeatWrapping,RGBAFormat,Vector3} from 'three'
import {Water} from 'three/addons/objects/Water.js'
export function Stream({color,night,low,rain=false}:{color:string;night:boolean;low:boolean;rain?:boolean}){
 const water=useMemo(()=>{
  const n=256,data=new Uint8Array(n*n*4)
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4,u=x/n*Math.PI*2,v=y/n*Math.PI*2;data[i]=128+Math.round(27*Math.cos(u*5+v*3)+12*Math.cos(u*13-v*7));data[i+1]=128+Math.round(23*Math.sin(v*7+u*2)+14*Math.sin(v*11-u*5));data[i+2]=245;data[i+3]=255}
  const normals=new DataTexture(data,n,n,RGBAFormat);normals.wrapS=normals.wrapT=RepeatWrapping;normals.needsUpdate=true
  const w=new Water(new PlaneGeometry(100,120),{textureWidth:low?256:768,textureHeight:low?256:768,waterNormals:normals,sunDirection:new Vector3(-12,17,7).normalize(),sunColor:0xffe9c4,waterColor:color,distortionScale:.65,fog:true});w.rotation.x=-Math.PI/2;w.position.y=-.32
  w.material.uniforms.rainStrength={value:0}
  w.material.fragmentShader=w.material.fragmentShader.replace('uniform float time;','uniform float time;\n uniform float rainStrength;').replace(/vec4 getNoise\( vec2 uv \) \{[\s\S]*?\n\s*\}/,`vec4 getNoise(vec2 uv) {
   vec2 drift=vec2(time*.022,time*.003);
   vec4 a=texture2D(normalSampler,uv*.036-drift);
   vec4 b=texture2D(normalSampler,uv*.072-drift*.63+vec2(.31));
   vec4 c=texture2D(normalSampler,uv*.16+vec2(-time*.011,time*.007));
   vec4 noise=(a+b+c)*(.6666667)-1.0;
   vec2 cell=fract(uv*.8)-.5;
   float radius=length(cell);
   float ripple=sin(radius*65.0-time*7.0)*exp(-radius*7.0)*rainStrength*.08;
   noise.xy+=normalize(cell+vec2(.0001))*ripple;
   noise.xy*=.45;
   return noise;
  }`)
  return w
 },[low])
 useFrame((_,dt)=>{water.material.uniforms.time.value+=Math.min(dt,.05);water.material.uniforms.waterColor.value.lerp(new Color(color),.03);water.material.uniforms.sunColor.value.set(night?'#728ca4':'#ffe9c4');water.material.uniforms.rainStrength.value+=(Number(rain)-water.material.uniforms.rainStrength.value)*.03})
 useEffect(()=>()=>{water.geometry.dispose();water.material.uniforms.normalSampler.value.dispose();water.material.dispose()},[water])
 return <primitive object={water}/>
}
