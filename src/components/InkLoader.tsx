import {useEffect,useRef,useState} from 'react'
import './ink-loader.css'

/** Self-contained so the first paint never waits for an image, font or WebGL. */
export function InkLoader({active,backdrop=false,small=false}:{active:boolean;backdrop?:boolean;small?:boolean}){
 const [mounted,setMounted]=useState(active),canvas=useRef<HTMLCanvasElement>(null)
 useEffect(()=>{if(active){setMounted(true);return}const timer=setTimeout(()=>setMounted(false),150);return()=>clearTimeout(timer)},[active])
 useEffect(()=>{
  if(!mounted||!active)return
  const surface=canvas.current!,ctx=surface.getContext('2d');if(!ctx)return
  const size=192;surface.width=surface.height=size
  const pixels=ctx.createImageData(size,size),distance=new Float32Array(size*size),grain=new Float32Array(size*size)
  const hash=(x:number,y:number)=>{const v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v)}
  const noise=(x:number,y:number)=>{const ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy;const a=u*u*(3-2*u),b=v*v*(3-2*v);return (hash(ix,iy)*(1-a)+hash(ix+1,iy)*a)*(1-b)+(hash(ix,iy+1)*(1-a)+hash(ix+1,iy+1)*a)*b}
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const i=y*size+x,dx=(x-96)/83,dy=(y-96)/78,d=Math.hypot(dx,dy)
   const coarse=noise(x*.04,y*.04),fibre=noise(x*.38,y*.11),fine=noise(x*.8,y*.65)
   distance[i]=d+(coarse-.5)*.035+(fibre-.5)*.012
   grain[i]=.76+fibre*.16+fine*.08
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,start=performance.now()
  let frame=0,last=-Infinity
  const draw=(now:number)=>{
   if(now-last<80){frame=requestAnimationFrame(draw);return}last=now
   const elapsed=reduced?1.8:(now-start)/1000
   const ripples=Array.from({length:3},(_,j)=>{
    const progress=((elapsed+j*1.4)%4.2)/4.2
    return {radius:.12+progress*.86,strength:Math.pow(Math.sin(Math.PI*progress),2)*.21}
   })
   for(let i=0;i<distance.length;i++){
    const d=distance[i]
    let ink=Math.exp(-d*d*12)*.035
    for(const ripple of ripples){
     const offset=d-ripple.radius
     // Broad capillary wash behind a softly feathered front, never a hard circle.
     ink+=ripple.strength*(Math.exp(-Math.pow(offset/.045,2))*.42+Math.exp(-Math.pow((offset+.055)/.105,2))*.58)
    }
    pixels.data[i*4]=67;pixels.data[i*4+1]=77;pixels.data[i*4+2]=69
    pixels.data[i*4+3]=Math.min(255,ink*grain[i]*255)
   }
   ctx.putImageData(pixels,0,0)
   if(!reduced)frame=requestAnimationFrame(draw)
  }
  frame=requestAnimationFrame(draw)
  return()=>cancelAnimationFrame(frame)
 },[mounted,active])
 if(!mounted)return null
 return <div className={`ink-loader ${backdrop?'ink-loader-paper':''} ${small?'ink-loader-small':''} ${!active?'ink-loader-leaving':''}`} role="status" aria-label="加载中">
  <div className="ink-loader-mark" aria-hidden="true"><canvas ref={canvas}/></div>
 </div>
}
