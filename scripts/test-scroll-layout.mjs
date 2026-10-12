import assert from 'node:assert/strict'
import {scrollLayout} from '../src/features/poem-viewer/scroll-layout.ts'
for(const [w,h] of [[390,844],[1440,900],[1920,1080],[844,390]])for(const ratio of [720/1264,16/9,1]){
 const {sheet,media,reading,desktop,head,foot}=scrollLayout(w,h,ratio)
 assert.ok(Math.abs(media.width/media.height-ratio)<1e-8)
 assert.ok(media.left>sheet.left&&media.left+media.width<sheet.left+sheet.width)
 assert.ok(media.top>=sheet.top+head&&media.top+media.height<=sheet.top+sheet.height-foot)
 if(desktop){assert.ok(reading);assert.ok(media.left+media.width<reading.left);assert.ok(reading.left+reading.width<sheet.left+sheet.width)}else assert.equal(reading,null)
 // When a portrait frame fits horizontally, its height must fill the available paper height.
 if(!desktop&&ratio===720/1264){const freeHeight=sheet.height-head-foot-12;const freeWidth=sheet.width-2*(w<700?12:30)-12;if(freeHeight*ratio<=freeWidth)assert.ok(Math.abs(media.height-freeHeight)<1e-8)}
}
console.log('Scroll layout: original aspect ratio and mounting clearance passed for portrait/landscape viewports')
