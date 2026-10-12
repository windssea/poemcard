import {mkdir,readFile,readdir,writeFile,access} from 'node:fs/promises'
import path from 'node:path'
import {mp4Dimensions} from './mp4-dimensions.mjs'
const out='public/content'; await mkdir(`${out}/poems`,{recursive:true})
const index=[]; const ids=new Set();
for(const file of await readdir('content/poems')){
 if(!file.endsWith('.json'))continue
 const p=JSON.parse(await readFile(`content/poems/${file}`,'utf8'))
 if(!/^[a-z0-9-]+$/.test(p.id)||ids.has(p.id))throw Error(`Invalid or duplicate id: ${p.id}`)
 ids.add(p.id)
 const poet=JSON.parse(await readFile(`content/poets/${p.poetId}.json`,'utf8'))
 const dynasties=JSON.parse(await readFile('content/dynasties.json','utf8'));const dynasty=dynasties.find(d=>d.id===p.dynastyId)
 if(!dynasty||!p.title||!p.stanzas?.length||!p.media?.video?.sources?.length)throw Error(`Incomplete poem: ${p.id}`)
 for(const key of [p.media.bookmark,p.media.thumbnail,p.media.artwork,p.media.video.poster,...p.media.video.sources.map(s=>s.src)]){
  if(key.includes('..')||path.isAbsolute(key))throw Error('Unsafe media key')
  await access(`public/media/${key}`)
 }
 if(!['spring','summer','autumn','winter'].includes(p.sceneHint.season)||p.sceneHint.timeOfDay<0||p.sceneHint.timeOfDay>24)throw Error('Invalid scene hint')
 if(!p.published)continue
 const bookmarkMobile=p.media.bookmark.replace(/\.webp$/,'-mobile.webp');await access(`public/media/${bookmarkMobile}`)
 const summary={id:p.id,title:p.title,poet:poet.name,dynasty:dynasty.name,thumbnail:p.media.thumbnail,bookmark:p.media.bookmark,bookmarkMobile,sortOrder:p.sortOrder}
 const dimensions=await mp4Dimensions(`public/media/${p.media.video.sources[0].src}`)
 index.push(summary);await writeFile(`${out}/poems/${p.id}.json`,JSON.stringify({...p,...summary,media:{...p.media,video:{...p.media.video,...dimensions}}}))
}
index.sort((a,b)=>a.sortOrder-b.sortOrder);await writeFile(`${out}/index.json`,JSON.stringify(index));console.log(`Validated ${index.length} poems`)
