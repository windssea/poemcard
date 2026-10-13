import assert from 'node:assert/strict'
import {sceneView} from '../src/scene/environment/scenes.ts'

for(const kind of ['courtyard','garden'])for(const [width,height] of [[1440,900],[1920,1080],[2560,1271],[3440,1440],[5120,1440]]){
 const view=sceneView(kind,false,width,height)
 const pixelsPerUnit=height/8.85
 // The mid plate must cover both edges, including the depth rig's overscan.
 assert.ok(16.72*view.scaleX*pixelsPerUnit*.94>=width-1e-7)
 assert.equal(view.scaleY,1,'Keep roof and bookmark hanging heights unchanged')
 assert.equal(view.cameraY,.28)
}
assert.equal(sceneView('courtyard',true,390,844).scaleX,1)
const portrait=sceneView('garden',true,390,844)
assert.ok(Math.abs(16.72*portrait.scaleX*844/8.85-390)<1e-7)
console.log('Scene view: wide-screen coverage and mobile framing passed')
