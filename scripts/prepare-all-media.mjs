import {readdir,readFile} from 'node:fs/promises'
import {prepareMedia} from './prepare-media.mjs'

const ids=new Set()
for(const file of (await readdir('content/poems')).sort()){
 if(!file.endsWith('.json'))continue
 const poem=JSON.parse(await readFile(`content/poems/${file}`,'utf8'))
 if(ids.has(poem.id))throw Error(`Duplicate poem: ${poem.id}`)
 ids.add(poem.id)
 await prepareMedia(poem.id)
}
console.log(`Prepared media for ${ids.size} poems`)
