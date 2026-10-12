# 风过诗廊

React 与 Three.js 临水诗画庭院原型。设计与阶段范围见 [设计文档](docs/design.md)。

当前主页采用 demo/bg.png 的红墙庭院构图，入口场景为 src/scene/Courtyard.tsx。真实 3D 书签位于红墙左侧，带纸边、木轴、玉环、流苏及实时投影，固定正交机位保留克制视差。背景是图像布景，不是建筑的完整三维重建。运行 npm run scene:prepare 更新背景；构建会自动准备背景。旧场景 Scene.tsx 保留参考，当前入口不使用它。

当前素材拆成 scene-source/layers 中的干净底图与透明枝花，近景独立风动与视差；更换原图时需要同步准备这两个分层文件。界面使用本地毛笔字与宋体，构建自动准备字体子集，字符未变时使用缓存。素材、字体来源和生成提示词见 [分层素材说明](docs/scene-layers.md)。

混合场景包含远云、动态墙面阴翳、书签风动、近景花瓣、淡雾和偶发飞鸟。约每42秒出现飞鸟；轻量画质减少动态数量。打开诗画时暂停背后庭院渲染。建筑和原图悬饰仍为静态素材，后续可替换独立分层素材。

固定视角浏览，桌面每段最多 6 首、手机 3 首。使用左右按钮、方向键或手机横滑切段；“寻诗”按诗名、诗人、朝代筛选，“境候”调整环境。当前只有一首测试诗，因此分页按钮暂不可用；新增诗词后自动分段，不重复书签。

点击书签进入全屏诗画，主图展开后延迟播放静音循环视频；读诗按钮切换到独立阅读页并暂停视频，观画返回继续。视频保留原比例完整显示，以窗口高度为主；左右留白使用浅色旧宣纸与木质画轴，窄屏宽度不足时等比缩小。

画卷在宽度900px及以上时采用左侧动画、右侧竖排诗词，按诗名、诗人、内容从右向左阅读；窄屏采用观画与读诗切换。宽窄视口切换沿用同一个播放器。

## 本地运行

```powershell
npm install
node scripts/prepare-media.mjs
npm run content
npm run dev
```

素材处理前，将 demo/bookmark.png、demo/pic.png、demo/video.mp4 分别复制到 media-source/poems/dalin-si-taohua/bookmark.png、artwork.png、motion.mp4。本次已完成复制。测试素材 demo 与场景分层素材已加入 Git；media-source、public/media 和 public/content 为本地素材工作目录或生成结果，按忽略规则不提交，克隆后按以上步骤重新生成。

## 新增诗词

诗词资料优先查询 [古诗文网](https://www.gushiwen.cn)。每首诗保存具体作品页链接、查询日期、核实状态；规范见 content/source-policy.json。当前测试诗仍来自用户提供的 demo，尚未标记为网站核实。未查到的信息保留空值。

复制 content/poems/dalin-si-taohua.json，使用新的稳定英文 id，维护诗人引用、原文、名句和 sceneHint。将素材放入 media-source/poems/新ID，运行 node scripts/prepare-media.mjs 新ID，再运行 npm run build。构建会检查内容与素材引用；生成文件在 public/content 和 public/media。

## 部署

运行 npm run build，将 dist 部署到 Cloudflare Pages。Git 自动构建需要自行配置素材获取步骤；也可以本地构建后用 Wrangler 直接上传 dist。媒体迁移 R2 时设置 VITE_MEDIA_BASE_URL。当前仍是几何体场景原型，精细模型、连续环境过渡和真实设备性能测试尚待后续阶段。
