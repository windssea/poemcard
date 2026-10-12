import {CanvasTexture,RepeatWrapping,SRGBColorSpace} from 'three'
function map(kind:'wood'|'stone',bump=false){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256
 const ctx=canvas.getContext('2d')!,image=ctx.createImageData(256,256)
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){
  const noise=(Math.sin(x*127.1+y*311.7)*43758.5453)%1
  const grain=kind==='wood'?Math.sin(y*.52+Math.sin(x*.024)*3)+Math.sin(y*1.8+x*.03)*.3:Math.sin(x*.08+y*.11)*Math.cos(y*.15-x*.1)
  const value=grain*17+noise*9,i=(y*256+x)*4,base=bump?[128,128,128]:kind==='wood'?[132,104,72]:[145,151,142]
  for(let c=0;c<3;c++)image.data[i+c]=base[c]+value
  image.data[i+3]=255
 }
 ctx.putImageData(image,0,0);const t=new CanvasTexture(canvas);t.wrapS=t.wrapT=RepeatWrapping;t.repeat.set(kind==='wood'?2:3,3);if(!bump)t.colorSpace=SRGBColorSpace;return t
}
export const woodMap=map('wood'),woodBump=map('wood',true),stoneMap=map('stone'),stoneBump=map('stone',true)
