import sharp from 'sharp'
import {mkdir} from 'node:fs/promises'
await mkdir('public/scene',{recursive:true})
await sharp('demo/bg.png').resize({width:2200,withoutEnlargement:true}).webp({quality:92}).toFile('public/scene/courtyard.webp')
await sharp('scene-source/layers/courtyard-clean.png').webp({quality:92}).toFile('public/scene/courtyard-clean.webp')
await sharp('scene-source/layers/courtyard-clean.png').resize({width:960,withoutEnlargement:true}).webp({quality:64}).toFile('public/scene/courtyard-preview.webp')
await sharp('scene-source/layers/blossom-foreground.png').webp({quality:92,alphaQuality:100}).toFile('public/scene/blossom-foreground.webp')
console.log('Prepared courtyard background from demo/bg.png')
