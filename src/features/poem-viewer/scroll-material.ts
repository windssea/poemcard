import {MeshStandardMaterial} from 'three'
import type {Texture} from 'three'

export function scrollMaterial(map:Texture,halfWidth:number,paper:boolean,progress:{value:number},soak:{value:number},inset=0){
 const material=new MeshStandardMaterial({map,bumpMap:map,bumpScale:paper?.007:.006,color:paper?'#f7f0e2':'#f0e5cf',roughness:1,metalness:0})
 material.onBeforeCompile=shader=>{
  shader.uniforms.unroll=progress;shader.uniforms.soak=soak
  shader.vertexShader='uniform float unroll;varying vec2 inkUv;\n'+shader.vertexShader
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   inkUv=uv;
   float edge=max(0.0,${(halfWidth+inset).toFixed(6)}*unroll-${inset.toFixed(6)});
   transformed.x=clamp(position.x,-edge,edge);
   float curl=1.0-smoothstep(0.0,0.13,edge-abs(transformed.x));
   transformed.z+=curl*0.045*(1.0-unroll);
  `)
  if(paper){
   shader.fragmentShader=`uniform float soak;varying vec2 inkUv;
    float hashInk(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float inkNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hashInk(i),hashInk(i+vec2(1,0)),f.x),mix(hashInk(i+vec2(0,1)),hashInk(i+vec2(1)),f.x),f.y);}
    float inkField(vec2 p){return inkNoise(p)*.57+inkNoise(p*2.03)*.28+inkNoise(p*4.11)*.15;}
   `+shader.fragmentShader
   shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`
    vec2 q=inkUv;
    float coarse=inkField(q*vec2(19.0,12.0));
    float fibre=inkField(q*vec2(210.0,48.0));
    float fine=inkNoise(q*vec2(480.0,135.0));
    float d=min(length((q-vec2(-.08,.76))*vec2(1.9,.85)),min(length((q-vec2(.99,1.07))*vec2(1.3,2.0)),length((q-vec2(.94,-.13))*vec2(1.5,1.9))));
    float arrival=d+coarse*.17+fibre*.055;
    float front=mix(-.05,.49,sqrt(clamp(soak,0.0,1.0)));
    float wetted=1.0-smoothstep(front-.024,front+.022,arrival);
    float pigment=wetted*exp(-d*4.8)*(.17+fibre*.23+fine*.07);
    float tide=exp(-pow((arrival-front+.022)/.016,2.0))*.055*wetted;
    float clearCentre=smoothstep(.12,.28,abs(q.x-.5))+smoothstep(.20,.38,abs(q.y-.5));
    float density=(pigment+tide)*clamp(clearCentre,0.0,1.0);
    gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(.22,.27,.24),density);
    #include <dithering_fragment>
   `)
  }
 }
 material.customProgramCacheKey=()=>`poem-unroll-${paper}-${halfWidth}`
 return material
}
