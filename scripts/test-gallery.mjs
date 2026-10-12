import assert from 'node:assert/strict'
import {filterPoems,paginate} from '../src/features/gallery/pagination.ts'
const poems=Array.from({length:19},(_,i)=>({id:`p${i}`,title:`春诗${i}`,poet:i%2?'白居易':'李白',dynasty:'唐',thumbnail:''}))
for(const size of [3,6]){
 const ids=[];const pages=Math.ceil(poems.length/size)
 for(let page=0;page<pages;page++){const result=paginate(poems,page,size);assert.equal(result.total,pages);assert.ok(result.items.length<=size);ids.push(...result.items.map(p=>p.id))}
 assert.deepEqual(ids,poems.map(p=>p.id));assert.equal(new Set(ids).size,19)
 assert.equal(paginate(poems,100,size).current,pages-1)
}
assert.equal(filterPoems(poems,' 白居易 ').length,9)
assert.equal(filterPoems(poems,'不存在').length,0)
assert.equal(paginate([],8,6).current,0)
console.log('Gallery: desktop/mobile boundaries, no omissions/duplicates, search and empty state passed')
