# Environment texture edit prompts

Generated with the built-in image_gen tool on 2026-10-13. Original assets were kept; selected outputs were copied to scene-source/layers. All edits preserve the original wide canvas. Generated variants may repaint fine detail and are not pixel-exact masks.

## courtyard-winter.png

Reference: layers/courtyard-clean.png. transparent_background=false.

Use case: lighting-weather. EDIT TARGET: supplied clean courtyard background, for a fixed-camera 2.5D web scene. Produce its WINTER MATERIAL VARIANT. Preserve exact original canvas aspect ratio, framing, camera, roof silhouettes, red wall boundaries, tile positions, brick details, mountain silhouettes, pavilion locations, and ground perspective. Do not shift or scale objects. Add believable fine layered snow resting on upward-facing teal roof tiles, eaves ridges and ornamental finials, nuanced crystalline powder, shadow underneath overhanging snow. Sparse snow along the foot of the red wall and between paving slabs; retain dark stone patches and readable stone joints. Distant mountains lightly powdered, distant trees winter bare. Keep large red wall empty and red, weathered tactile plaster, not painted white. Lighting neutral soft winter daylight, NOT dark and NOT dramatic blue. Photorealistic fine traditional Chinese architecture matching input's finish, premium natural materials, understated, no plastic. No falling snow particles, no foreground branches, no bookmarks, no text, no people, no UI. This is a registered texture variant: exact same perspective and architecture composition is highest priority.

## courtyard-wet.png

Reference: layers/courtyard-clean.png. transparent_background=false.

Use case: lighting-weather. EDIT TARGET: supplied courtyard background, fixed orthographic-camera 2.5D website texture. Create RAIN-WET material variant in precisely the same original canvas, framing, scale, perspective and architecture coordinates. Keep every roof tile, eave silhouette, wall boundary, mountain and building in the same position. Change only surface state and overcast illumination: naturally wet darker terracotta wall near base, fine moist streaks below eaves without painting stripes across the empty wall, slightly more reflective glazed teal tiles, darker rain-soaked rough limestone paving. Add several shallow irregular puddles ONLY in the existing narrow ground strip along bottom, reflecting red wall, pale sky and roof silhouettes softly; retain paving joints and tactile stone roughness. Premium photographic traditional Chinese architectural materials, subtle wet highlights, not glossy plastic and not a mirror floor. Neutral overcast daylight, no night grading (time of day handled in shaders). Leave large red wall empty for hanging UI. No rain particles baked in, no foreground branches, no bookmarks or hanging objects, no people, no text, no UI. Highest priority: registered composition exactly matches edit target so the image can smoothly blend as a WebGL surface texture.

## blossom-winter.png

Reference: layers/blossom-foreground.png. transparent_background=true.

Use case: lighting-weather / background-extraction. Edit target is the supplied TRANSPARENT foreground flowering branches for a fixed viewpoint Chinese courtyard website. Produce the WINTER version of this same transparent layer. EXACT same original wide canvas ratio and placement: two near branches enter from upper-left and upper-right edges, do not recenter, enlarge, move or change the main woody branch topology. Remove ALL blossoms and leaves, keep only finely detailed bare brown twigs with small believable caps of delicate powder snow on upward-facing branch surfaces. Premium photographic organic bark, subtle soft neutral daylight, fine snow granules and natural crevices, no cartoon white outlines, no smooth plastic. Truly transparent alpha everywhere outside branches and snow. No sky, architecture, wall, ground, extra props, text or standalone objects. Preserve empty central and lower canvas for UI, full original canvas layout. Render actual transparent background.

## blossom-summer.png

Reference: layers/blossom-foreground.png. transparent_background=true.

Use case: lighting-weather / background-extraction. EDIT supplied transparent foreground branch layer to a SUMMER LEAF variant on exactly the same full wide original canvas. Preserve main branch topology, scale, positions and roots clipped at upper-left and upper-right edges. Replace the peach blossoms with restrained clusters of small natural fresh green leaves growing on these woody branches; leave the lower and central canvas empty. No oversized foliage, no dense curtain. Delicate translucent leaf veins, natural rough brown bark, premium photoreal materials matching original, neutral soft daylight, no shine like plastic. Truly transparent alpha outside branches and leaves. Do not include architecture, wall, sky, ground, people, text, extra objects. Exact original framing and branch placement for parallax compositing.
