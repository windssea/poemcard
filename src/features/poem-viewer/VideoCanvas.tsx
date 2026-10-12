import {forwardRef,useEffect,useImperativeHandle,useMemo,useRef} from 'react'

type Props={src:string;className:string;onAspect:(ratio:number)=>void;onFrame:()=>void;onError:()=>void}
// The decoder is deliberately detached: only a canvas is exposed to browser video overlays.
export const VideoCanvas=forwardRef<HTMLVideoElement,Props>(function VideoCanvas({src,className,onAspect,onFrame,onError},ref){
 const canvas=useRef<HTMLCanvasElement>(null),callbacks=useRef({onAspect,onFrame,onError})
 callbacks.current={onAspect,onFrame,onError}
 const player=useMemo(()=>{
  const el=document.createElement('video');el.muted=true;el.defaultMuted=true;el.loop=true;el.playsInline=true;el.controls=false;el.preload='auto'
  el.disablePictureInPicture=true;el.disableRemotePlayback=true
  for(const [key,value] of Object.entries({'muted':'','playsinline':'','webkit-playsinline':'','x5-playsinline':'true','x5-video-player-type':'h5-page','x5-video-player-fullscreen':'false','controlslist':'nodownload nofullscreen noremoteplayback'}))el.setAttribute(key,value)
  return el
 },[])
 useImperativeHandle(ref,()=>player,[player])
 useEffect(()=>{
  const surface=canvas.current!,ctx=surface.getContext('2d',{alpha:false})
  if(!ctx){callbacks.current.onError();return}
  let frame=0,raf=0,disposed=false,painted=false
  const stop=()=>{if(frame)player.cancelVideoFrameCallback(frame);if(raf)cancelAnimationFrame(raf);frame=raf=0;surface.dataset.playback='paused'}
  const draw=()=>{
   if(disposed||player.paused||document.hidden)return
   if(player.readyState>=2&&player.videoWidth&&player.videoHeight){
    if(surface.width!==player.videoWidth||surface.height!==player.videoHeight){surface.width=player.videoWidth;surface.height=player.videoHeight}
    // Canvas and stage match the decoded frame ratio: no black letterboxing or cropping.
    ctx.drawImage(player,0,0,surface.width,surface.height)
    surface.dataset.playback='playing';surface.dataset.frames=String(Number(surface.dataset.frames||0)+1)
    if(!painted){painted=true;callbacks.current.onFrame()}
   }
   if(typeof player.requestVideoFrameCallback==='function')frame=player.requestVideoFrameCallback(draw)
   else raf=requestAnimationFrame(draw)
  }
  const metadata=()=>{if(player.videoWidth&&player.videoHeight)callbacks.current.onAspect(player.videoWidth/player.videoHeight)}
  const begin=()=>{stop();painted=false;draw()}
  const failed=()=>{stop();callbacks.current.onError()}
  player.addEventListener('loadedmetadata',metadata);player.addEventListener('playing',begin);player.addEventListener('pause',stop);player.addEventListener('error',failed)
  player.src=src;player.load()
  return()=>{disposed=true;stop();player.removeEventListener('loadedmetadata',metadata);player.removeEventListener('playing',begin);player.removeEventListener('pause',stop);player.removeEventListener('error',failed);player.pause();player.removeAttribute('src');player.load()}
 },[player,src])
 return <canvas ref={canvas} className={`video-canvas ${className}`} aria-hidden="true"/>
})
