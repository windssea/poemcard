import {lazy,Suspense,useCallback,useEffect,useRef,useState} from 'react'
import type {Poem} from '../../domain/types'
import {getPoem,mediaUrl} from '../../services/content'
import './immersive.css'
import './desktop-reading.css'
import {scrollLayout} from './scroll-layout'
import {VerticalPoem} from './VerticalPoem'
const ScrollBackdrop=lazy(()=>import('./ScrollBackdrop'))
export default function PoemViewer({id,onClose}:{id:string;onClose:()=>void}){
 const [poem,setPoem]=useState<Poem>(),[error,setError]=useState(''),[playing,setPlaying]=useState(false),[ready,setReady]=useState(false),[imageReady,setImageReady]=useState(false),[reading,setReading]=useState(false)
 const video=useRef<HTMLVideoElement>(null),close=useRef<HTMLButtonElement>(null),mode=useRef(false)
 const [opened,setOpened]=useState(false)
 const onOpened=useCallback(()=>setOpened(true),[])
 const [viewport,setViewport]=useState({width:window.innerWidth,height:window.innerHeight}),[ratio,setRatio]=useState(720/1264)
 useEffect(()=>{const resize=()=>setViewport({width:window.innerWidth,height:window.innerHeight});window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize)},[])
 const layout=scrollLayout(viewport.width,viewport.height,ratio)
 const isReading=!layout.desktop&&reading
 mode.current=isReading
 const play=useCallback(()=>{const el=video.current;if(!el||mode.current||document.hidden)return;void el.play().catch(()=>setError('轻点播放，继续进入诗画'))},[])
 useEffect(()=>{
  const c=new AbortController();getPoem(id,c.signal).then(setPoem).catch(e=>{if(e.name!=='AbortError')setError(e.message)})
  const previous=document.activeElement as HTMLElement;close.current?.focus()
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const nodes=Array.from(document.querySelectorAll<HTMLElement>('.viewer button')).filter(n=>n.getClientRects().length>0);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}}
  document.addEventListener('keydown',key);return()=>{c.abort();document.removeEventListener('keydown',key);previous?.focus()}
 },[id,onClose])
 useEffect(()=>{if(!poem)return;const el=video.current!;const visibility=()=>{if(document.hidden)el.pause();else if(el.dataset.started&&!mode.current)play()};document.addEventListener('visibilitychange',visibility);return()=>{document.removeEventListener('visibilitychange',visibility);el.pause();el.removeAttribute('src');el.load()}},[poem,play])
 useEffect(()=>{if(!opened||!imageReady||!poem)return;const timer=setTimeout(()=>setReady(true),500);return()=>clearTimeout(timer)},[opened,imageReady,poem])
 useEffect(()=>{if(!ready)return;const el=video.current;if(!el)return;if(isReading){el.pause()}else{el.dataset.started='yes';play()}},[ready,isReading,play])
 return <div className={`viewer immersive-viewer ${isReading?'is-reading':''} ${layout.desktop?'desktop-poem-viewer':'mobile-poem-viewer'}`} role="dialog" aria-modal="true" aria-label={poem?.title||'诗词详情'}>
  <Suspense fallback={<div className="scroll-backdrop paper-fallback"/>}><ScrollBackdrop layout={layout} start={imageReady} onOpened={onOpened}/></Suspense>
  <div className="scroll-content">
  {poem&&<div className={`immersive-stage ${imageReady?'expanded':''}`} aria-hidden={isReading} style={{left:layout.media.left,top:layout.media.top,width:layout.media.width,height:layout.media.height}}>
   <img src={mediaUrl(poem.media.artwork)} alt={`${poem.title}主题画`} onLoad={()=>setImageReady(true)} onError={()=>setError('主图加载失败，请稍后重试')}/>
   <video ref={video} src={mediaUrl(poem.media.video.sources[0].src)} poster={mediaUrl(poem.media.video.poster)} muted playsInline loop autoPlay={ready&&!isReading} controls={false} disablePictureInPicture disableRemotePlayback controlsList="nodownload nofullscreen noremoteplayback" {...{'webkit-playsinline':'true','x5-playsinline':'true','x5-video-player-type':'h5-page','x5-video-player-fullscreen':'false'}} preload="auto" className={playing?'visible':''} onLoadedMetadata={e=>{const v=e.currentTarget;if(v.videoWidth&&v.videoHeight)setRatio(v.videoWidth/v.videoHeight)}} onPlaying={()=>{setPlaying(true);setError('')}} onError={()=>setError('视频暂时未能加载，请重试')}/>
  </div>}
  <div className="viewer-toolbar" style={{top:layout.sheet.top+4,left:layout.sheet.left+layout.side,right:viewport.width-layout.sheet.left-layout.sheet.width+layout.side,padding:0}}>
   {poem&&!layout.desktop&&<button className="mode-toggle" onClick={()=>setReading(!reading)} aria-label={isReading?'返回全屏诗画':'切换到读诗页面'}>{isReading?'观画':'读诗'}</button>}
   <button className="close" ref={close} onClick={onClose}>关闭 ×</button>
  </div>
  {poem&&layout.desktop&&layout.reading&&<section className="desktop-reading" aria-label="竖排诗词" tabIndex={0} style={{left:layout.reading.left,top:layout.reading.top,width:layout.reading.width,height:layout.reading.height}}><VerticalPoem poem={poem}/></section>}
  {isReading&&poem&&<section className="reading-page mobile-vertical-reading" aria-label="诗词阅读" tabIndex={0}><VerticalPoem poem={poem}/></section>}
  {!isReading&&error&&<div className="playback-message" role="alert"><p>{error}</p>{poem&&<button onClick={()=>{setReady(true);const el=video.current;if(el){el.load();play()}}}>播放 / 重试</button>}</div>}
  {!poem&&!error&&<p className="immersive-loading" role="status">正在展开诗画…</p>}
  </div>
 </div>
}
