import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const dir='public/fonts';await mkdir(dir,{recursive:true})
const ui='风过诗廊诗画庭院临水听风随诗入境寻诗境候归庭读诗观画四季时辰天气春夏秋冬晨昼暮夜晴阴雨雪上一段下一段第共段首诗清除筛选关闭寻找输入诗名诗人朝代未找到正在展开加载重试播放轻量画质返回全部静音请稍后再试大林寺桃花白居易唐人间四月芳菲尽山寺桃花始盛开长恨春归无觅处不知转入此中来年月日分查看诗笺继续不存在ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789，。· /×‹›↗：…—（）'
let text=ui
for(const folder of ['content/poems','content/poets'])for(const file of await readdir(folder))if(file.endsWith('.json'))text+=(await readFile(`${folder}/${file}`,'utf8')).match(/[\u3400-\u9fff]/g)?.join('')||''
async function scan(dir){for(const entry of await readdir(dir,{withFileTypes:true})){if(entry.isDirectory())await scan(`${dir}/${entry.name}`);else if(/\.(tsx?|css)$/.test(entry.name))text+=(await readFile(`${dir}/${entry.name}`,'utf8')).match(/[\u3400-\u9fff]/g)?.join('')||''}}
await scan('src')
text=[...new Set([...text])].sort().join('')
const signature=createHash('sha256').update(text).digest('hex')
let cached='';try{cached=await readFile(`${dir}/signature.txt`,'utf8')}catch{}
if(cached===signature){console.log('Font subsets cached');process.exit(0)}
for(const [family,name,weight] of [['Ma Shan Zheng','poem-brush',400],['Noto Serif SC','poem-serif',400]]){
 const url=`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}&display=swap`
 const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(`Font stylesheet ${response.status}`)
 const css=await response.text(),match=css.match(/url\((https:\/\/[^)]+)\)/);if(!match)throw Error('Font source missing')
 const data=await fetch(match[1],{signal:AbortSignal.timeout(30000)});if(!data.ok)throw Error('Font download failed');const buffer=Buffer.from(await data.arrayBuffer());const extension=buffer.subarray(0,4).toString()==='wOF2'?'woff2':'ttf'
 await writeFile(`${dir}/${name}.${extension}`,buffer)
 await writeFile(`${dir}/${name}.css`,`@font-face{font-family:'${name}';src:url('/fonts/${name}.${extension}') format('${extension==='ttf'?'truetype':'woff2'}');font-weight:400;font-style:normal;font-display:swap;}\n`)
 console.log(`${family}: ${buffer.length} bytes, local subset`)
 const license=await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${family==='Ma Shan Zheng'?'mashanzheng':'notoserifsc'}/OFL.txt`,{signal:AbortSignal.timeout(30000)});if(!license.ok)throw Error('Font license unavailable');await writeFile(`${dir}/${name}-OFL.txt`,await license.text())
}
await writeFile(`${dir}/signature.txt`,signature)
await writeFile(`${dir}/fonts.css`,(await readFile(`${dir}/poem-brush.css`,'utf8'))+(await readFile(`${dir}/poem-serif.css`,'utf8')))
