import {lazy,Suspense,useCallback,useEffect,useRef,useState} from 'react'
import {createRoot} from 'react-dom/client'
import type {EnvironmentState,PoemSummary,Season,Weather} from '../domain/types'
import {getIndex,getPoem} from '../services/content'
import {filterPoems,paginate} from '../features/gallery/pagination'
import {bookmarkLayout} from '../features/gallery/bookmark-layout'
import {seasons} from '../scene/environment/presets'
import PoemViewer from '../features/poem-viewer/PoemViewer'
import './styles.css'
import './ink-ui.css'
import './courtyard-ui.css'
import {InkLoader} from '../components/InkLoader'
const Scene=lazy(()=>import('../scene/Courtyard'))
function App(){
 const [poems,setPoems]=useState<PoemSummary[]>([]),[error,setError]=useState(''),[selected,setSelected]=useState<string>(),[hover,setHover]=useState<PoemSummary|null>(null)
 const [loading,setLoading]=useState(true)
 const [sceneReady,setSceneReady]=useState(false)
 const onSceneReady=useCallback(()=>setSceneReady(true),[])
 const [env,setEnv]=useState<EnvironmentState>({season:'spring',timeOfDay:8,weather:'clear',windStrength:.35}),[enter,setEnter]=useState(true),[low,setLow]=useState(window.innerWidth<768),[reduced]=useState(matchMedia('(prefers-reduced-motion: reduce)').matches)
 const [viewport,setViewport]=useState({width:window.innerWidth,height:window.innerHeight}),[page,setPage]=useState(0),[query,setQuery]=useState(''),[search,setSearch]=useState(false),[settings,setSettings]=useState(false)
 const galleryLayout=bookmarkLayout(viewport.width,viewport.height),mobile=galleryLayout.mobile,pageSize=galleryLayout.capacity
 const touch=useRef<{x:number;y:number}|null>(null),searchInput=useRef<HTMLInputElement>(null),searchToggle=useRef<HTMLButtonElement>(null),settingsToggle=useRef<HTMLButtonElement>(null)
 const filtered=filterPoems(poems,query),segment=paginate(filtered,page,pageSize)
 useEffect(()=>{const c=new AbortController();getIndex(c.signal).then(setPoems).catch(e=>{if(e.name!=='AbortError')setError(e.message)}).finally(()=>{if(!c.signal.aborted)setLoading(false)});return()=>c.abort()},[])
 useEffect(()=>{const resize=()=>setViewport({width:window.innerWidth,height:window.innerHeight});window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize)},[])
 useEffect(()=>{setPage(0)},[pageSize])
 useEffect(()=>{if(!selected||!enter)return;const c=new AbortController();getPoem(selected,c.signal).then(p=>setEnv(p.sceneHint)).catch(()=>{});return()=>c.abort()},[selected,enter])
 useEffect(()=>{setHover(null)},[page,query,mobile])
 useEffect(()=>{if(search)searchInput.current?.focus()},[search])
 const close=useCallback(()=>setSelected(undefined),[])
 const closePanel=useCallback(()=>{const target=search?searchToggle.current:settingsToggle.current;setSearch(false);setSettings(false);target?.focus()},[search])
 const changePage=useCallback((delta:number)=>{setPage(p=>Math.max(0,Math.min(p+delta,segment.total-1)));setHover(null)},[segment.total])
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(selected)return;if(e.key==='Escape'&&(search||settings)){e.preventDefault();closePanel();return}if(search||settings||e.target instanceof HTMLInputElement)return;if(e.key==='ArrowLeft'){e.preventDefault();changePage(-1)}if(e.key==='ArrowRight'){e.preventDefault();changePage(1)}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[selected,search,settings,closePanel,changePage])
 return <main data-scene-light={env.timeOfDay<6||env.timeOfDay>=19?'night':'day'}><div className="scene" aria-hidden={!!selected} onTouchStart={e=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}} onTouchEnd={e=>{const t=touch.current;if(!t)return;const dx=e.changedTouches[0].clientX-t.x,dy=e.changedTouches[0].clientY-t.y;touch.current=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)changePage(dx<0?1:-1)}}>
 <Suspense fallback={null}>{poems.length>0&&<Scene active={!selected} env={env} poems={segment.items} page={segment.current} onReady={onSceneReady} onSelect={setSelected} onHover={setHover} low={low} reduced={reduced}/>}</Suspense><InkLoader active={!selected&&!sceneReady&&!error&&(loading||poems.length>0)} backdrop/></div>
 <header><div className="brand"><span className="seal">诗</span><div><h1>风过诗廊</h1><p>诗画庭院</p></div></div><nav aria-label="诗廊工具"><span className="scene-label">{seasons[env.season].name}日 · {env.timeOfDay<6||env.timeOfDay>=19?'夜':env.timeOfDay<11?'晨':env.timeOfDay<17?'昼':'暮'}</span><button ref={searchToggle} className="paper-tab" aria-expanded={search} aria-controls="search-panel" onClick={()=>{setSearch(!search);setSettings(false)}}>寻诗</button><button ref={settingsToggle} className="paper-tab" aria-expanded={settings} aria-controls="environment-panel" onClick={()=>{setSettings(!settings);setSearch(false)}}>境候</button></nav></header>
 {(search||settings)&&<div className="panel-dismiss" aria-hidden="true" onClick={closePanel}/>}
 {search&&<section id="search-panel" className="search-panel" aria-label="寻诗"><div className="panel-heading"><label htmlFor="poem-search">寻一首诗</label><button className="panel-close" aria-label="关闭寻诗" onClick={closePanel}>收起</button></div><input ref={searchInput} id="poem-search" placeholder="诗名、诗人或朝代" value={query} onChange={e=>{setQuery(e.target.value);setPage(0)}}/><p>{filtered.length} 首诗{filtered.length>segment.items.length?' · 左右切换浏览':''}</p><div className="search-results">{filtered.slice(0,50).map(p=><button key={p.id} onClick={()=>{const i=filtered.findIndex(item=>item.id===p.id);setPage(Math.floor(i/pageSize));setSearch(false);setSelected(p.id)}}><span className="result-title">{p.title}</span><span className="result-meta">{p.dynasty} · {p.poet}</span></button>)}</div>{!filtered.length&&<p className="search-empty" role="status">未找到诗词，可尝试诗名或诗人。</p>}{filtered.length>50&&<p>显示前 50 个结果，请继续输入缩小范围。</p>}{query&&<button className="clear-search" onClick={()=>{setQuery('');setPage(0)}}>清除筛选</button>}</section>}
 {settings&&<section id="environment-panel" className="controls" aria-label="诗廊环境"><div className="panel-heading"><h2>境候</h2><button className="panel-close" aria-label="关闭境候" onClick={closePanel}>收起</button></div><div className="control-row"><span>四季</span>{Object.entries(seasons).map(([key,value])=><button key={key} aria-pressed={env.season===key} onClick={()=>setEnv({...env,season:key as Season,weather:env.weather==='snow'&&key!=='winter'?'clear':env.weather})}>{value.name}</button>)}</div>
 <div className="control-row"><span>时辰</span>{[[8,'晨'],[13,'昼'],[18,'暮'],[22,'夜']].map(([hour,label])=><button key={hour} aria-pressed={env.timeOfDay===hour} onClick={()=>setEnv({...env,timeOfDay:Number(hour)})}>{label}</button>)}</div>
 <div className="control-row"><span>天气</span>{[['clear','晴'],['cloudy','阴'],['rain','雨'],['snow','雪']].map(([key,label])=><button key={key} disabled={key==='snow'&&env.season!=='winter'} aria-pressed={env.weather===key} onClick={()=>setEnv({...env,weather:key as Weather})}>{label}</button>)}</div>
 <label><input type="checkbox" checked={enter} onChange={e=>setEnter(e.target.checked)}/> 随诗入境</label><label><input type="checkbox" checked={low} onChange={e=>setLow(e.target.checked)}/> 轻量画质</label></section>}
 <section className="gallery-dock" aria-label="诗词浏览">{!loading&&!filtered.length&&<p role={error?'alert':'status'}>{error||'未找到诗词，请调整搜索内容。'}</p>}<section className="gallery-navigation" aria-label="诗廊分页"><button aria-label="上一段诗廊" disabled={segment.current===0} onClick={()=>changePage(-1)}>前卷</button><div aria-live="polite"><p>{hover?`${hover.title} · ${hover.poet}`:`第 ${segment.current+1} 段 / 共 ${segment.total} 段`}</p><span>{filtered.length} 首诗</span></div><button aria-label="下一段诗廊" disabled={segment.current===segment.total-1} onClick={()=>changePage(1)}>后卷</button></section></section>
 {selected&&<PoemViewer key={selected} id={selected} onClose={close}/>}</main>
}
const root=import.meta.hot?.data.root ?? createRoot(document.getElementById('root')!)
root.render(<App/> )
if(import.meta.hot)import.meta.hot.dispose(data=>{data.root=root})
