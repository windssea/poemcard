# 诗画界面与分层素材

季节新增 courtyard-winter、courtyard-wet、blossom-winter、blossom-summer 四张同画幅素材。原始PNG在scene-source/layers，WebP由prepare-scene生成，透明枝条保留alpha。互动与后续材质路线见 [环境互动设计](environment-design.md)，实际生图提示词见 [环境素材提示词](../scene-source/environment-prompts.md)。

近景枝花从底图分离后，可以以独立深度与风动幅度渲染，原始 demo/bg.png 保留。底图和枝花使用内置 imagegen 编辑生成，可能存在局部重绘；它们不是原图的无损逐像素分割。建筑和远山仍在底景中，云雾、阴翳、鸟与花瓣为独立程序层。

## 素材文件

- scene-source/layers/courtyard-clean.png：移除枝花和原有右侧挂饰的干净底图，1672×941。
- scene-source/layers/blossom-foreground.png：透明近景枝花，1672×941。
- public/scene/courtyard-clean.webp 和 blossom-foreground.webp：构建生成的网页素材。
- demo/bg.png：原始参考素材，未覆盖。

枝花保留真实 alpha，移动时不叠加旧枝花。近景位于 z=1.6，并采用局部顶点形变，根部保持稳定、枝梢轻微摇动。背景、云雾、书签、枝花和花瓣具有不同视差幅度。布景固定构图不提供自由旋转。

## 字体与界面

标题、纸笺工具入口、前卷后卷、诗名和画卷按钮使用 Ma Shan Zheng 毛笔字体；输入框、说明、朝代诗人和诗词正文使用 Noto Serif SC。中文长正文不用毛笔字体，以保持阅读清晰。

后续根据用户要求，当前所有界面文字、输入、说明及原文均改用 Ma Shan Zheng，原先宋体层级通过字号和间距区分。Noto Serif SC保留为备用资产。关闭、读诗、观画按钮取消背景与边框，透明文字嵌入装裱内；画心增加轻薄残边透明过渡，诗人落印以姓名生成。

字体来自 [Ma Shan Zheng 项目](https://github.com/googlefonts/mashanzheng) 和 [Google Fonts Noto Serif SC](https://github.com/google/fonts/tree/main/ofl/notoserifsc)。字体按界面与本地内容字符制作子集，网页从 public/fonts 加载，不请求外部字体服务；保留 OFL 文件。构建在字符集不变时复用缓存；新增文字时需要网络获取新的子集。离线开发应预先执行 npm run fonts:prepare。

字体入口为 /fonts/fonts.css，UI 设计在 src/app/ink-ui.css。搜索和环境面板使用纸色、墨色、朱砂色；工具入口为竖排纸笺，分页简化为前卷后卷。移动端缩小标题与纸笺，面板限制最大高度并允许滚动。阅读页保留完整装裱，正文居中、留足行距。

## 内置 imagegen 提示词

底图提示词：

```text
Use case: precise-object-edit. Input image is an edit target for a layered parallax website courtyard. Produce a CLEAN BACKGROUND PLATE with exactly the same 16:9 composition, fixed viewpoint, red wall, ground, distant mountains, roof architecture, colors and light. Remove ONLY the foreground flowering branches entering from upper left and upper right, and REMOVE the five existing hanging paper bookmarks and tassels on the right. Inpaint the revealed sky, roof, wall using matching detail. Keep architecture and red wall unchanged. No new props, no new text, no UI. Keep the large red wall empty for interactive bookmarks. This is the back layer; all foreground branch flowers and hanging ornaments must be absent.
```

透明枝花提示词：

```text
Use case: background-extraction. Input image is an edit target for a layered parallax website. Extract ONLY the existing near flowering branches and blossoms that enter from the upper-left and upper-right into a TRANSPARENT FOREGROUND LAYER. Preserve their original shape, photorealistic/painterly material, lighting and approximate original placement on the same full 16:9 canvas. The branches must remain attached to and clipped by their original outer canvas edges. Everything except these near branches and blossoms must be truly transparent: remove sky, mountains, all architecture, red wall, ground, all hanging bookmarks and tassels. Do not add, restyle, enlarge or reposition flowers. No floating standalone blossom clusters in the middle. No text or UI.
```
