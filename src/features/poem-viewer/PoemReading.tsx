import {useLayoutEffect,useRef} from 'react'
import type {CSSProperties} from 'react'
import type {Poem} from '../../domain/types'
import {VerticalPoem} from './VerticalPoem'

export function PoemReading({poem,className,style}:{poem:Poem;className:string;style?:CSSProperties}){
 const host=useRef<HTMLElement>(null)
 useLayoutEffect(()=>{
  const el=host.current!
  const resize=()=>{
   const css=getComputedStyle(el)
   // Reserve the poem padding and the stanza's inset on both reading surfaces.
   el.style.setProperty('--reading-column-height',`${Math.max(24,el.clientHeight-parseFloat(css.paddingTop)-parseFloat(css.paddingBottom)-48)}px`)
  }
  resize()
  const observer=new ResizeObserver(resize);observer.observe(el)
  // Native wheel listeners must be non-passive to prevent a second vertical scroll.
  const wheel=(event:WheelEvent)=>{
   if(event.ctrlKey||el.scrollWidth<=el.clientWidth||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY)return
   event.preventDefault()
   const unit=event.deltaMode===1?32:event.deltaMode===2?el.clientWidth:1
   el.scrollLeft-=event.deltaY*unit
  }
  el.addEventListener('wheel',wheel,{passive:false})
  return()=>{observer.disconnect();el.removeEventListener('wheel',wheel)}
 },[])
 return <section ref={host} className={`poem-reading ${className}`} aria-label="竖排诗词" tabIndex={0} dir="rtl" style={style}><VerticalPoem poem={poem}/></section>
}
