import sharp from 'sharp'
import {mkdir} from 'node:fs/promises'
await mkdir('public/scene',{recursive:true})
await sharp('demo/bg.png').resize({width:2200,withoutEnlargement:true}).webp({quality:92}).toFile('public/scene/courtyard.webp')
await sharp('scene-source/layers/courtyard-clean.png').webp({quality:92}).toFile('public/scene/courtyard-clean.webp')
await sharp('scene-source/layers/courtyard-clean.png').resize({width:960,withoutEnlargement:true}).webp({quality:64}).toFile('public/scene/courtyard-preview.webp')
await sharp('scene-source/layers/blossom-foreground.png').webp({quality:92,alphaQuality:100}).toFile('public/scene/blossom-foreground.webp')
for(const name of ['courtyard-winter','courtyard-wet','blossom-winter','blossom-summer'])await sharp(`scene-source/layers/${name}.png`).resize({width:1672,withoutEnlargement:true}).webp({quality:88,alphaQuality:100}).toFile(`public/scene/${name}.webp`)
for(const name of ['courtyard-far','courtyard-mid','garden-v2-clean','garden-v2-far','garden-v2-mid','garden-v2-winter','garden-v2-wet','garden-near'])await sharp(`scene-source/layers/${name}.png`).resize({width:1672,withoutEnlargement:true}).webp({quality:88,alphaQuality:100}).toFile(`public/scene/${name}.webp`)
await sharp('scene-source/layers/garden-v2-clean.png').resize({width:960}).webp({quality:64}).toFile('public/scene/garden-v2-preview.webp')
console.log('Prepared courtyard background from demo/bg.png')
