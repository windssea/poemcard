# 风过诗廊

React 与 Three.js 临水诗画庭院原型。设计与阶段范围见 [设计文档](docs/design.md)。

当前主页采用 demo/bg.png 的红墙庭院构图，入口场景为 src/scene/Courtyard.tsx。真实 3D 书签位于红墙左侧，带纸边、木轴、玉环、流苏及实时投影，固定正交机位保留克制视差。背景是图像布景，不是建筑的完整三维重建。运行 npm run scene:prepare 更新背景；构建会自动准备背景。旧场景 Scene.tsx 保留参考，当前入口不使用它。

当前素材拆成 scene-source/layers 中的干净底图与透明枝花，近景独立风动与视差；更换原图时需要同步准备这两个分层文件。界面使用本地毛笔字与宋体，构建自动准备字体子集，字符未变时使用缓存。素材、字体来源和生成提示词见 [分层素材说明](docs/scene-layers.md)。

混合场景包含远云、动态墙面阴翳、书签风动、近景花瓣、淡雾和偶发飞鸟。约每42秒出现飞鸟；轻量画质减少动态数量。打开诗画时暂停背后庭院渲染。建筑和原图悬饰仍为静态素材，后续可替换独立分层素材。

新增 CourtyardDetails：程序生成月面纹理的球体、不同深度的云雾片层、六角宫灯木框与流苏、暖色点光及灯晕。夜间月亮和宫灯渐亮，灯体绕固定挂点轻摆；手机保留一盏宫灯，轻量模式减少云层。顶部入口采用无底色的屋檐文字，检索及境候弹窗使用纤维宣纸纹理与紧凑排版。

固定视角浏览，桌面每段数量根据可见红墙与风摆余量动态计算；手机每页最多四首，一行排列，压缩顶部景观并按可用宽度调整书签大小。书签使用 bookmark-v2.png；手机使用512px高清WebP与高像素比，桌面使用完整纹理，手机保持克制风摆，减少模糊和相邻遮挡。使用左右按钮、方向键或手机横滑切段；“寻诗”按诗名、诗人、朝代筛选，“境候”调整环境。当前已有《大林寺桃花》《定风波》《饮湖上初晴后雨》《赠刘景文》《夜雨寄北》五首。诗词从悬挂书签或寻诗面板打开。

首屏优先预加载约49KB的庭院背景预览，图片显示即结束滴墨，不等待Three.js、书签和前景枝花。完整背景随后替换预览；书签按180ms错开请求并独立显示，不互相阻塞。诗卷组件和视频只在点击诗词后加载，首页不预取MP4。

点击书签进入全屏诗画，主图展开后延迟播放静音循环视频；读诗按钮切换到独立阅读页并暂停视频，观画返回继续。视频保留原比例完整显示，以窗口高度为主；左右留白使用浅色旧宣纸与木质画轴，窄屏宽度不足时等比缩小。

播放器使用离屏video解码、VideoCanvas画布逐帧显示，页面不展示原生video控件，以减少手机浏览器插入播放器界面的机会。画布比例同步视频元数据，保留原始帧率和画面；切换读诗或离开页面暂停，关闭时释放解码器。自动播放受浏览器策略限制时使用页面内播放按钮。当前媒体同源；未来跨域媒体需允许浏览器获取视频。目标手机浏览器兼容仍需真机测试。

画卷在宽度900px及以上时采用左侧动画、右侧竖排诗词，按诗名、诗人、内容从右向左阅读；窄屏采用观画与读诗切换。宽窄视口切换沿用同一个播放器。

## 本地运行

```powershell
npm install
npm run media:prepare
npm run content
npm run dev
```

测试素材 demo、场景分层素材及诗词的 media-source 源素材纳入 Git；public/media 和 public/content 为生成结果，不提交。npm run build 会按 content/poems 自动生成全部诗词素材和索引。《大林寺桃花》原图与视频读取 demo，新版书签读取 media-source/poems/dalin-si-taohua/bookmark-v2.png；其余诗词从 media-source/poems/对应ID 读取。素材脚本优先使用 bookmark-v2.png，自动生成完整、手机与缩略图版本；对应内容JSON需引用 bookmark-v2.webp 和 bookmark-v2-thumb.webp。

## 新增诗词

诗词资料优先查询 [古诗文网](https://www.gushiwen.cn)。每首诗保存具体作品页链接、查询日期、核实状态；规范见 content/source-policy.json。当前测试诗仍来自用户提供的 demo，尚未标记为网站核实。未查到的信息保留空值。

复制 content/poems/dalin-si-taohua.json，使用新的稳定英文 id，维护诗人引用、原文、名句和 sceneHint。将素材放入 media-source/poems/新ID，运行 node scripts/prepare-media.mjs 新ID，再运行 npm run build。构建会检查内容与素材引用；生成文件在 public/content 和 public/media。

《定风波》ID 为 ding-feng-bo，资料已核对古诗文网，原始素材来自 D:/dev/windssea/poem/output/poetry/定风波。将 bookmark.png、定风波.png、video-depth-v2/定风波-移轴立体-v2.mp4 对应复制到 media-source/poems/ding-feng-bo 下的 bookmark.png、artwork.png、motion.mp4，再运行 node scripts/prepare-media.mjs ding-feng-bo。长词竖排从右侧开始，向左滚动继续阅读。

《饮湖上初晴后雨》ID 为 yin-hu-shang-chu-qing-hou-yu，对应组诗其二，资料已核对古诗文网并采用“空蒙”。原始素材来自 D:/dev/windssea/poem/output/poetry/饮湖上初晴后雨，将 painting.png、bookmark.png、video/final.mp4 对应复制到同 ID 的 media-source/poems 目录下 artwork.png、bookmark.png、motion.mp4，运行 node scripts/prepare-media.mjs yin-hu-shang-chu-qing-hou-yu。

《赠刘景文》ID 为 zeng-liu-jing-wen，资料采用“最是”版本。原始素材来自 D:/dev/windssea/poem/output/poetry/赠刘景文，将 poster-v2.png、bookmark.png、video-v5/final.mp4 对应复制到同 ID 的 media-source/poems 目录下 artwork.png、bookmark.png、motion.mp4，运行 node scripts/prepare-media.mjs zeng-liu-jing-wen。

《夜雨寄北》ID 为 ye-yu-ji-bei，唐代李商隐，原文采用“何当共剪西窗烛”。资料核对古诗文网，写作年份及收信人身份保留争议。原始素材来自 D:/dev/windssea/poem/output/poetry/夜雨寄北，将 bookmark-v2.png、painting-v2.png、video-v2/grok-raw.mp4 对应复制到 media-source/poems/ye-yu-ji-bei 下 bookmark-v2.png、artwork.png、motion.mp4。源视频720×1264、24fps，保留原帧率；入境为秋夜细雨。当前共五首，手机自动分成两页，每页最多四首；视频仅点击后加载。

## 部署

运行 npm run build，将 dist 部署到 Cloudflare Pages。Git 自动构建使用同一命令，脚本从已提交源素材自动生成 WebP、缩略图、视频封面和 MP4，然后校验诗词内容，不依赖本地生成目录。ffmpeg 可用时进行无损 faststart 封装；未安装时直接复制原视频，构建仍可完成，不改变帧率。也可以本地构建后用 Wrangler 上传 dist。媒体迁移 R2 时设置 VITE_MEDIA_BASE_URL。精细模型与真实设备性能测试尚待后续阶段。
