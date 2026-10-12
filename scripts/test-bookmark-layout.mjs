import assert from 'node:assert/strict'
import {bookmarkLayout,bookmarkPositions} from '../src/features/gallery/bookmark-layout.ts'
import {paginate} from '../src/features/gallery/pagination.ts'
const poems=Array.from({length:103},(_,id)=>id)
for(const width of [200,280,320,390,699,700,768,922,1024,1280,1440,2560]){
 for(const height of [390,640,844,886,1200]){
  const layout=bookmarkLayout(width,height),available=layout.right-layout.left
  assert.ok(layout.capacity>=1)
  // One more bookmark must exceed the safe region at the minimum paper-and-wind spacing.
  assert.ok(layout.footprint+layout.capacity*layout.pitch>available-1e-7)
  for(let count=1;count<=layout.capacity;count++){
   const xs=bookmarkPositions(layout,count)
   for(const x of xs){assert.ok(x-layout.footprint/2>=layout.left-1e-7);assert.ok(x+layout.footprint/2<=layout.right+1e-7)}
   for(let i=1;i<xs.length;i++)assert.ok(xs[i]-xs[i-1]>=layout.pitch-1e-7)
  }
  const seen=[]
  for(let page=0;page<Math.ceil(poems.length/layout.capacity);page++)seen.push(...paginate(poems,page,layout.capacity).items)
  assert.deepEqual(seen,poems)
 }
}
console.log('Bookmark layout: safe wind bounds, maximal capacity and complete paging passed across 60 viewport combinations')
