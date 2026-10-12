import assert from 'node:assert/strict'
import {readdir} from 'node:fs/promises'
import {mp4Dimensions} from './mp4-dimensions.mjs'
for(const id of await readdir('public/media/poems')){
 const size=await mp4Dimensions(`public/media/poems/${id}/motion.mp4`)
 assert.deepEqual(size,{width:720,height:1264},`${id}: dimensions must match independently checked ffprobe output`)
}
console.log('MP4 dimensions: all four portrait videos match ffprobe (720 × 1264)')
