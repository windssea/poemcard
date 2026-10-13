# 双场景生图记录

使用内置image_gen，2026-10-13。下列是选定素材的实际提示词；生成结果可能局部重绘，不保证像素级注册。原始图像保持不变，生成文件在layers。被用户否定的第一版矩形景窗仅在本地drafts/garden-v1保留，不参与部署。

## courtyard-far.png

Target: layers/courtyard-clean.png; transparent_background=false.

Use case: precise-object-edit. EDIT TARGET is this fixed-camera Chinese courtyard clean plate. Create its FAR SCENERY layer on exactly the same full canvas and camera. Keep the distant mountain silhouettes, mist, far treetops, pavilion, sky and their exact positions in the upper-left and central area. Remove all foreground architecture: entire red wall, all teal roof tiles, ornate palace at upper-right, pavement and pillars. Reconstruct behind them a continuous quiet distant mountain valley with mist and pale sky, without new prominent buildings. Lower half should be calm soft grey-green mist and distant low vegetation suitable to be occluded by a separate architectural layer. No near branches, bookmarks, text, UI, people. Premium photographic painterly natural detail matching original, fixed composition, no perspective change. This full opaque far plate will move a few pixels behind an extracted original midground. Preserve original visible distant scenery accurately.

## courtyard-mid.png

Target: layers/courtyard-clean.png; transparent_background=true.

Use case: background-extraction. EDIT TARGET original courtyard clean plate. Extract ONLY near architecture and ground into a genuinely transparent RGBA midground on EXACT same full canvas. Preserve original red wall, teal wall roof tiles, ornate palace/eave at upper right, right pillar, entire pavement, and all original positions and fine material texture. Remove every pixel of sky, distant mountains, distant pavilion, distant trees and mist above the wall or around the roof silhouettes; these regions must be real alpha transparency. Do NOT remove foreground palace roof and ridge ornaments. Preserve tiny roof ornament cutout silhouettes with fine alpha edges. No near flowering branches, no hanging cards, text, UI or extra objects. Highest priority accurate extraction and no architecture reconstruction, no shifting framing. This layer overlays a separate mountain background; all voids reveal that background.

## garden-v2-clean.png

References: references/garden-window-ref-1.png and garden-window-ref-2.png (user attachments); transparent_background=false.

Use case: historical-scene. Create a NEW premium WIDE 16:9 fixed-camera Jiangnan garden framed-view background for a poetry gallery, inspired by the references, not a collage. Reference 1: shaded corridor, beautiful dark wood folded-corner opening with delicate colored floral glass on SIDE panels, sunlit spring courtyard beyond. Reference 2: authentic elegant Chinese garden window silhouettes and restrained fine fretwork. Camera is inside a quiet covered viewing corridor facing a single large horizontally elongated OCTAGONAL / folded-shoulder garden opening. Composition for later hanging poem cards: central straight dark wood horizontal lintel at about 30% canvas height, opening spans x=6% to x=83%, top=31%, bottom=87%, folded corner transitions at outer left/right; keep the inner broad central aperture free of crossbars. Left and right side pilasters feature VERY narrow muted jade/amber/rose floral leaded-glass inserts inspired by reference 1, small refined details not western church windows. Rich aged matte dark wood, ivory plaster reveals with subtle age, precise carved corner joins, no glossy plastic. Through aperture: several layers of a sunlit Jiangnan courtyard, delicate flowering peach branch ONLY at far outer-left beyond window, pale garden walls, grey curved eaves, distant white magnolias at right, a tranquil water court and soft distant roofline; central backdrop quiet light pale garden wall and mist so hanging poem bookmarks remain readable. No foreground branches, no hanging books (they will be separate layers). Bottom only 10-12% shows smooth old limestone corridor floor with delicate window and colored-glass light projections, elegant but not busy. Strong near/mid/far depth: shaded near timber window, middle sunlit blossom courtyard, farther garden roofs and soft atmospheric sky. Photographic architectural quality, sophisticated Chinese poetic mood, soft spring daylight, rich delicate materials, architectural symmetry with subtle natural asymmetry outside. Full wide canvas, fixed frontal viewpoint with no extreme lens distortion. No people, text, branding, UI, banners, collage or multiple windows. The octagonal silhouette and restrained colored glass must be the memorable visual identity, and the entire hanging-bookmark area under the top lintel must stay spacious.

实际生成将横楣放在更靠上位置，代码挂点按选定图校准，没有按提示词的百分比机械套用。

## garden-v2-far.png

Target: layers/garden-v2-clean.png; transparent_background=false.

Use case: precise-object-edit. EDIT TARGET new octagonal timber viewing-window background. Produce its full opaque FAR GARDEN plate on exactly the same full wide canvas. Remove ALL near timber window framing, near ceiling wood, floral colored glass side panels, plaster reveals and near corridor floor, but retain the exact positions of the visible distant garden scene: left spring blossoms, white garden wall and small ornamental opening, stone bridge, still water, right garden pavilion and magnolia flowers, tree canopies and blue sky. Reconstruct obscured peripheral regions with quiet matching garden vegetation/sky above and water below. Do not move visible pavilion, bridge, plants or scale scenery. Premium photographic spring garden, soft daylight and subtle existing atmospheric depth. No new large objects, no foreground frame, people, text, books, signs, UI. This plate moves a few pixels BEHIND the separately extracted window silhouette. Original full canvas and source scene registration are mandatory.

## garden-v2-mid.png

Target: layers/garden-v2-clean.png; transparent_background=true.

Use case: background-extraction. EDIT TARGET octagonal dark timber garden viewing-window. Extract ONLY original NEAR ARCHITECTURE into a true RGBA cutout on exactly the same full wide canvas. Keep original timber ceiling/top lintel, folded-corner/octagonal window framing, fine carved corner fretwork, narrow floral colored-glass side panels, ivory plaster reveals, bottom carved wood base panels and corridor limestone floor including delicate colored light and shadows. Keep every frame edge in exact original position, texture and proportions. Remove ALL garden scenery inside the opening: blossoms, magnolias, water, garden roofs, walls, trees and sky. Entire central octagonal opening and holes in fretwork must be true alpha transparent, NOT black, white or hazy fill. Keep side colored-glass decorative panels as translucent/tinted architecture details, no new props. Exact silhouette registration; no redesign, moving, enlarging or new perspective. No people, text, UI, cards or foreground plants. Fine realistic alpha edges and premium original woodgrain.

## garden-v2-winter.png

Target: layers/garden-v2-far.png; transparent_background=false.

Use case: lighting-weather. EDIT TARGET far garden landscape plate, no near window frame. Create registered WINTER version. EXACT same canvas, garden wall, pavilion, stone bridge, pool and distant tree positions. Remove spring blossoms and magnolia flowers, keep natural finely detailed bare twigs; add snow resting delicately on outdoor grey pavilion roofs, garden wall cap tiles, stone bridge railings, rocks and shrubs. Pale cold distant atmosphere, soft neutral winter daylight, fine snow shadows and granular powder, calm reflective water with subtle icy edges, not a white cartoon. No snowflakes baked in, no new architecture, no people, text or UI. Preserve exact perspective and framing to blend behind separate timber window. Important: only outdoor garden changes; no foreground window or indoor corridor.

## garden-v2-wet.png

Target: layers/garden-v2-far.png; transparent_background=false.

Use case: lighting-weather. EDIT TARGET same far Jiangnan garden plate. Make neutral overcast RAIN-WET version preserving exact framing, camera, positions of pavilion, bridge, white garden wall, rocks, plants and pool. Damp darker roofs and rock crevices, soft moist foliage, faint runoff staining on outdoor white plaster, still jade-green pool with delicate subdued small rain ripples and diffuse reflections. Remove hard sunshine shadows, subtle thin mist at water level. Retain the spring blossoms at original position; do not add falling rain particles (shader handles them). Photographic premium material texture, no glossy plastic, no full mirror floor, no new objects, people, text, UI or near window. Original full canvas and registration preserved for blending behind timber architecture.

## garden-near.png

Supporting style/layout reference: first draft garden-clean.png (now in local drafts/garden-v1); transparent_background=true. This is an independent foliage generation, not an architectural extraction.

Asset: separate near foliage foreground for the supplied 16:9 Jiangnan viewing-window scene. Supporting reference only for placement and premium natural material style. Create a TRUE transparent full-canvas layer, only sparse slender bamboo leaves on stems entering the upper-left edge and a few fine willow strands entering upper-right edge. Keep central and lower 75% completely empty, no dense curtain. Leaves should be small, restrained, graceful with fine translucent veins, natural photographic soft daylight, dark organic stems, no plastic or illustration outlines. Roots clipped at the upper corners; long tips must stay near outer 15% of the frame so they never conceal hanging poem cards in the central window. No background of any kind, no wall, no frame, no roof, no water, no text, no UI, no people. Original full wide canvas ratio, genuinely transparent alpha everywhere except these near leaves and stems. This is for near parallax and soft breeze.
# 手机景窗构图补充（2026-10-13）

内置image_gen编辑模式，参考/编辑目标为layers/garden-v2-mid.png，transparent_background=true。选定结果保存为layers/garden-mobile-mid.png（941×1672，真实alpha），构建生成public/scene/garden-mobile-mid.webp以及与园林合成的garden-mobile-preview.webp，桌面素材保留。

完整请求：

```text
Edit target: supplied transparent landscape Chinese garden window frame. Create a complementary PORTRAIT 9:16 mobile composition, a full tall octagonal viewing window in the same exquisite authentic dark weathered timber, subtle hand-carved corners and two narrow floral stained-glass sidelights. BOTH side panels must be fully within image. A broad calm dark wood lintel occupies top 12%, full central opening begins at 14% image height and ends at 84%, sides of opening at x=14% and x=86%. Corners softly chamfered, modest corner carvings; narrow pink/amber/jade floral glass sidelights occupy x=3%-10% and90%-97% from y=22%-75%. Bottom carved timber panel at y=85%-94%, narrow pale stone floor at bottom. Central window opening must be genuinely transparent alpha to show a separate garden layer, not black paint. No garden scenery, no plants across opening, no UI, no text, no hanging bookmarks, no people. Preserve refined photorealistic wood grain and diffuse daylight, no glossy plastic, no fisheye. Fixed straight-on view, full frame in portrait, crisp intricate materials. Transparent background ONLY through the central aperture; opaque architecture and floor.
```
