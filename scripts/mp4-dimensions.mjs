import {readFile} from 'node:fs/promises'

function boxes(data,start=0,end=data.length){
 const result=[]
 for(let at=start;at+8<=end;){
  let size=data.readUInt32BE(at),header=8
  if(size===1){if(at+16>end)break;size=Number(data.readBigUInt64BE(at+8));header=16}
  else if(size===0)size=end-at
  if(size<header||at+size>end)break
  result.push({type:data.toString('ascii',at+4,at+8),start:at+header,end:at+size})
  at+=size
 }
 return result
}
export async function mp4Dimensions(file){
 const data=await readFile(file),moov=boxes(data).find(box=>box.type==='moov')
 if(moov)for(const track of boxes(data,moov.start,moov.end).filter(box=>box.type==='trak')){
  const children=boxes(data,track.start,track.end),mdia=children.find(box=>box.type==='mdia'),tkhd=children.find(box=>box.type==='tkhd')
  const handler=mdia&&boxes(data,mdia.start,mdia.end).find(box=>box.type==='hdlr')
  if(!tkhd||!handler||handler.start+12>handler.end||data.toString('ascii',handler.start+8,handler.start+12)!=='vide')continue
  if(tkhd.end-tkhd.start<8)continue
  const width=data.readUInt32BE(tkhd.end-8)/65536,height=data.readUInt32BE(tkhd.end-4)/65536
  if(width>0&&height>0)return {width,height}
 }
 throw Error(`Cannot read MP4 video dimensions: ${file}`)
}
