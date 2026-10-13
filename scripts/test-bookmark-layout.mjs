import assert from 'node:assert/strict'
import {bookmarkLayout,bookmarkSlots} from '../src/features/gallery/bookmark-layout.ts'
import {paginate} from '../src/features/gallery/pagination.ts'
const poems=Array.from({length:103},(_,id)=>id)
for(const sceneKind of ['courtyard','garden'])for(const width of [200,280,320,390,699,700,768,922,1024,1280,1440,2560]){
 for(const height of [390,640,844,886,1200]){
  const layout=bookmarkLayout(width,height,sceneKind),available=layout.right-layout.left
  assert.ok(layout.capacity>=1)
  // One more bookmark must exceed the safe region at the minimum paper-and-wind spacing.
  if(layout.mobile)assert.ok(layout.capacity<=4)
  else assert.ok(layout.footprint+layout.capacity*layout.pitch>available-1e-7)
  if(layout.mobile&&sceneKind==='garden'){
   assert.ok(available<=width/height*8.85*.60+1e-7,'Keep both stained-glass panels clear')
   assert.ok((layout.cardHeight+layout.cord+.47)*layout.scale<=(layout.anchor-layout.bottom)*.52+1e-7,'Leave the lower garden visible')
  }
  for(let count=1;count<=layout.capacity;count++){
   const slots=bookmarkSlots(layout,count)
   if(layout.mobile)assert.ok(slots.every(slot=>slot.y===layout.anchor),'Mobile bookmarks must occupy one row')
   for(const {x,y} of slots){assert.ok(x-layout.footprint/2>=layout.left-1e-7);assert.ok(x+layout.footprint/2<=layout.right+1e-7);if(layout.mobile)assert.ok(y-(layout.cardHeight+layout.cord+.47)*layout.scale>=layout.bottom-1e-7)}
   for(let i=1;i<slots.length;i++)if(slots[i].y===slots[i-1].y)assert.ok(slots[i].x-slots[i-1].x>=layout.footprint-1e-7)
  }
  const seen=[]
  for(let page=0;page<Math.ceil(poems.length/layout.capacity);page++)seen.push(...paginate(poems,page,layout.capacity).items)
  assert.deepEqual(seen,poems)
 }
}
console.log('Bookmark layout: safe wind bounds, maximal capacity and complete paging passed across 120 scene/viewport combinations')
