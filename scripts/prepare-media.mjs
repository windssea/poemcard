import {mkdir,copyFile,access} from 'node:fs/promises'
import sharp from 'sharp'
import {spawnSync} from 'node:child_process'
const id=process.argv[2]||'dalin-si-taohua';if(!/^[a-z0-9-]+$/.test(id))throw Error('Invalid id')
const input=`media-source/poems/${id}`,out=`public/media/poems/${id}`;await mkdir(out,{recursive:true})
await sharp(`${input}/bookmark.png`).resize({width:256,withoutEnlargement:true}).webp({quality:78}).toFile(`${out}/bookmark-thumb.webp`)
await sharp(`${input}/bookmark.png`).webp({quality:88}).toFile(`${out}/bookmark.webp`)
await sharp(`${input}/artwork.png`).resize({width:1440,withoutEnlargement:true}).webp({quality:88}).toFile(`${out}/artwork.webp`)
await sharp(`${input}/artwork.png`).resize({width:720,withoutEnlargement:true}).webp({quality:78}).toFile(`${out}/video-poster.webp`)
await access(`${input}/motion.mp4`);await copyFile(`${input}/motion.mp4`,`${out}/motion.mp4`)
const result=spawnSync('ffmpeg',['-y','-v','error','-i',`${input}/motion.mp4`,'-map','0:v:0','-c:v','copy','-an','-movflags','+faststart',`${out}/motion.mp4`],{stdio:'inherit'})
if(result.error)console.warn('ffmpeg unavailable: copied original; prepare faststart before production')
else if(result.status!==0)throw Error('Video preparation failed')
console.log(`Prepared ${id}`)
