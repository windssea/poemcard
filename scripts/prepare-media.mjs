import {mkdir,copyFile,access} from 'node:fs/promises'
import sharp from 'sharp'
import {spawnSync} from 'node:child_process'
import {pathToFileURL} from 'node:url'
export async function prepareMedia(id){
 if(!/^[a-z0-9-]+$/.test(id))throw Error('Invalid id')
 const input=`media-source/poems/${id}`,out=`public/media/poems/${id}`
 // The first poem's committed originals live in demo; CI must not depend on local copies.
 const files=id==='dalin-si-taohua'?{bookmark:'demo/bookmark.png',artwork:'demo/pic.png',video:'demo/video.mp4'}:{bookmark:`${input}/bookmark.png`,artwork:`${input}/artwork.png`,video:`${input}/motion.mp4`}
 let bookmarkName='bookmark'
 try{await access(`${input}/bookmark-v2.png`);files.bookmark=`${input}/bookmark-v2.png`;bookmarkName='bookmark-v2'}catch(e){if(e.code!=='ENOENT')throw e}
 await Promise.all(Object.values(files).map(file=>access(file)))
 await mkdir(out,{recursive:true})
 await sharp(files.bookmark).resize({width:256,withoutEnlargement:true}).webp({quality:78}).toFile(`${out}/${bookmarkName}-thumb.webp`)
 await sharp(files.bookmark).resize({width:512,withoutEnlargement:true}).webp({quality:80,effort:6}).toFile(`${out}/${bookmarkName}-mobile.webp`)
 await sharp(files.bookmark).webp({quality:88}).toFile(`${out}/${bookmarkName}.webp`)
 await sharp(files.artwork).resize({width:1440,withoutEnlargement:true}).webp({quality:88}).toFile(`${out}/artwork.webp`)
 await sharp(files.artwork).resize({width:720,withoutEnlargement:true}).webp({quality:78}).toFile(`${out}/video-poster.webp`)
 await copyFile(files.video,`${out}/motion.mp4`)
 const result=spawnSync(process.env.POEM_FFMPEG_PATH||'ffmpeg',['-y','-v','error','-i',files.video,'-map','0:v:0','-c:v','copy','-an','-movflags','+faststart',`${out}/motion.mp4`],{stdio:'inherit'})
 if(result.error){
  if(result.error.code!=='ENOENT')throw result.error
  console.warn(`ffmpeg unavailable: ${id} uses the original MP4 without transcoding`)
 }else if(result.status!==0)throw Error(`Video preparation failed: ${id}`)
 console.log(`Prepared ${id}`)
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await prepareMedia(process.argv[2]||'dalin-si-taohua')
