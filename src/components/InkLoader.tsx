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
  const pixels=ctx.createImageData(size,size),arrival=new Float32Array(size*size),density=new Float32Array(size*size)
  const hash=(x:number,y:number)=>{const v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v)}
  const noise=(x:number,y:number)=>{const ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy;const a=u*u*(3-2*u),b=v*v*(3-2*v);return (hash(ix,iy)*(1-a)+hash(ix+1,iy)*a)*(1-b)+(hash(ix,iy+1)*(1-a)+hash(ix+1,iy+1)*a)*b}
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const i=y*size+x,dx=(x-96)/78,dy=(y-105)/67,d=Math.hypot(dx,dy)
   const coarse=noise(x*.065,y*.06),fibre=noise(x*.4,y*.095),fine=noise(x*.83,y*.5)
   arrival[i]=d+(coarse-.5)*.19+(fibre-.5)*.08
   density[i]=Math.exp(-d*d*2.5)*(.68+fibre*.23+fine*.09)
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,start=performance.now()
  let frame=0,last=-Infinity
  const draw=(now:number)=>{
   if(now-last<80){frame=requestAnimationFrame(draw);return}last=now
   const phase=reduced?1.7:((now-start)/1000)%3.8
   const wet=Math.max(0,Math.min(1,(phase-.45)/2.4)),front=.04+Math.sqrt(wet)*.83,fade=reduced?1:Math.min(1,Math.max(0,(3.8-phase)/.5))
   for(let i=0;i<arrival.length;i++){
    const t=Math.max(0,Math.min(1,(front-arrival[i])/.045)),edge=Math.exp(-Math.pow((arrival[i]-front+.025)/.026,2))
    pixels.data[i*4]=38;pixels.data[i*4+1]=43;pixels.data[i*4+2]=36
    pixels.data[i*4+3]=Math.min(255,(density[i]*t*.85+edge*t*.10)*255*fade)
   }
   ctx.putImageData(pixels,0,0)
   if(!reduced)frame=requestAnimationFrame(draw)
  }
  frame=requestAnimationFrame(draw)
  return()=>cancelAnimationFrame(frame)
 },[mounted,active])
 if(!mounted)return null
 return <div className={`ink-loader ${backdrop?'ink-loader-paper':''} ${small?'ink-loader-small':''} ${!active?'ink-loader-leaving':''}`} role="status" aria-label="加载中">
  <div className="ink-loader-mark" aria-hidden="true"><i className="ink-loader-drop"/><canvas ref={canvas}/></div>
 </div>
}
