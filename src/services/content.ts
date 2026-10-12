import type { Poem, PoemSummary } from '../domain/types'
const base = (import.meta as unknown as {env:Record<string,string>}).env.VITE_MEDIA_BASE_URL || '/media/'
export const mediaUrl = (key:string) => `${base.replace(/\/$/, '')}/${key}`
export async function getIndex(signal:AbortSignal):Promise<PoemSummary[]> {const r=await fetch('/content/index.json',{signal});if(!r.ok)throw Error('诗词索引加载失败');return r.json()}
export async function getPoem(id:string,signal:AbortSignal):Promise<Poem>{const r=await fetch(`/content/poems/${id}.json`,{signal});if(!r.ok)throw Error('诗词详情加载失败');return r.json()}
