import type {PoemSummary} from '../../domain/types'
export function filterPoems(poems:PoemSummary[],query:string){const q=query.trim().toLocaleLowerCase();return poems.filter(p=>`${p.title} ${p.poet} ${p.dynasty}`.toLocaleLowerCase().includes(q))}
export function paginate<T>(items:T[],page:number,size:number){const total=Math.max(1,Math.ceil(items.length/size)),current=Math.max(0,Math.min(page,total-1));return {total,current,items:items.slice(current*size,(current+1)*size)}}
