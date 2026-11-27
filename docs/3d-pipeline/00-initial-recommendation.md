# 3D Pipeline & Runtime Recommendation: 3D Anatomy App

_Date: 2026-11-27. Targets: iPad first, Web (WASM) second, Android later, phone companion app. Preferred stack: Flutter._

> Reading of the request: "LiveWeb 3D" is taken to mean **LightWave 3D**, and "Artisan ใช้ Godot" as "or should we use a game engine such as **Godot** instead of Flutter?"

## 1. Recommendation in one paragraph

Keep **Flutter as the app** (navigation, labels, notes, quizzes, search, purchases, offline downloads, phone companion). Do **not** move the whole product into a game engine. Put 3D behind one interface (`AnatomyViewport`) and fill it with one of two renderers, chosen by a 2-week spike on a real asset:

1. **flutter_scene** (preferred if it passes): pure Flutter, glTF, runs on iOS/Android/Web.
2. **three.js inside the app** (safe fallback): WKWebView on iPad, direct canvas on Flutter Web. Most mature glTF stack (KTX2, meshopt, picking, clipping planes, outlines).

Either way there is **one renderer for all platforms**, never "three.js on web, Flutter on mobile". With flutter_scene, the same Dart 3D code runs on iPad/Android (Impeller + Flutter GPU) and on Flutter Web (WASM/Skwasm build, where flutter_scene uses its own WebGL2 backend, because Impeller itself does not run on web). With the three.js fallback, the same JS viewer runs in a WebView on iPad/Android and in the page on web. Default plan: Flutter + flutter_scene everywhere; three.js only if the spike fails.

Make **glTF 2.0 (GLB)** the single delivery format, with **Blender as the hub** that every source tool (LightWave, 3D-Coat) feeds into. That keeps the renderer choice reversible: the asset pack does not change if you switch renderer.

Why not a game engine: the app is mostly text-heavy UI and content, with 3D that is mostly static meshes plus layering, picking, transparency and cross-sections. Flutter is strong at the first; the 3D needs are modest. A game engine is strong where you do not need it (physics, game loop) and weak where you do (rich UI, accessibility, Thai text, forms, store/IAP, a companion phone app).

## 2. Runtime options compared

| Option | iPad | Web/WASM | Android | Maturity / risk | License | Verdict |
|---|---|---|---|---|---|---|
| **Flutter + flutter_scene** | Impeller + Flutter GPU | Own WebGL2 backend, CanvasKit & Skwasm | Yes | Pre-1.0 (0.24.x, Oct 2026), breaking minor releases; needs Flutter 3.47+ | MIT | **Preferred, verify in spike** |
| **Flutter + thermion (Filament)** | arm64 | WASM (multithreaded build needs COOP/COEP headers) | arm64 | Small project (~222 GitHub stars), mostly one maintainer; thermion_dart 0.5.0 (Aug 2026) | Apache-2.0 | Good engine, bus-factor risk |
| **Flutter + three.js (WebView / HtmlElementView)** | WKWebView; WebGPU in Safari 26 (WebGL2 fallback) | Native fit | WebView | Most mature glTF ecosystem; cost is a JS↔Dart bridge and WebView memory | MIT | **Fallback / lowest technical risk** |
| **Flutter + Unity embedded** | flutter_embed_unity 2.0.0 (Apr 2026) | **No web** in that plugin; flutter_unity_widget is discontinued | Yes | One Unity instance, stays in memory | Unity terms | Not recommended |
| **Godot 4 full app** | Good native | WebGL2 only; ~6.2 MB engine for 4.5.2 release build; slow loads and iOS-Safari crash reports in forums | Good | Mature engine, weak for app-style UI | MIT | Only if product becomes simulation-heavy |
| **Unity full app** | Good | Large web builds | Good | Mature | Unity terms | Overkill for this product |
| **Bevy** | Possible | WASM/WebGPU | Possible | Pre-1.0, Rust, API churn | MIT/Apache | Not for this team |

### What the spike must prove (pass/fail)
Use one real asset: full skeleton + major muscles, ~200–400 selectable parts, ~1M triangles, 2K textures.
- 60 fps orbit on a base-model iPad (A-series, not only M-chip), 30 fps floor on mid-range Android.
- Tap-to-select a part by name (ray picking), highlight/outline, hide/isolate, per-layer opacity (x-ray).
- One clipping plane (cross-section).
- Label pins anchored to 3D points, drawn by Flutter on top.
- Load a downloaded GLB from disk (iPad) and from cache (web).
- Web: first view under ~5 s on a typical connection; check bundle size.

If flutter_scene fails picking, transparency sorting or clipping, switch the viewport to three.js. The asset pack and Flutter UI stay the same.

## 3. Asset pipeline

```
LightWave 2026 ──FBX/OBJ──┐
3D-Coat (sculpt) ─retopo + bake─┐
                          ▼   ▼
                     Blender (hub, source of truth: .blend)
                     - naming, hierarchy, custom properties
                     - materials → glTF PBR (metal/rough)
                     - LODs per part
                          │ glTF exporter (GLB, + custom props as extras)
                          ▼
                 gltf-transform CLI (CI script)
                 - dedup / prune / weld
                 - simplify (LOD1, LOD2)
                 - EXT_meshopt_compression
                 - KTX2 textures (KHR_texture_basisu)
                 - glTF Validator gate
                          ▼
         Asset packs per system (skeleton.glb, muscles.glb, …)
         + manifest.json (version, hash, size, part IDs)
                          ▼
      CDN ──► iPad: app support dir │ Web: Cache Storage / OPFS
```

### Per tool
- **LightWave 2026** (released June 2026, Windows/macOS, £795): no glTF or USD export is mentioned in the release coverage. Export **FBX or OBJ** into Blender. Use LightWave for what it is good at (modeling, rendering marketing stills), not as the delivery exporter. _Verify FBX export options against your LightWave version._
- **3D-Coat**: sculpt high-res organic forms, then retopo (low poly, clean UVs) and bake normal/AO/curvature maps. Export low-poly mesh + baked maps (FBX/OBJ + PNG) into Blender. 3D-Coat's API has a glTF exporter class, but use Blender as the single exporter so all parts share one convention.
- **Blender**: the only place that writes GLB. Its glTF exporter writes custom properties to `extras` when "Include → Custom Properties" is on.

### Compression and textures
- **Geometry: meshopt over Draco.** Meshopt decodes faster on mobile and web, and also compresses animation; Draco gives slightly smaller files but slower decode. Pick one; three.js, Filament and Godot all read meshopt (verify flutter_scene during the spike).
- **Textures: KTX2 / Basis Universal.** UASTC for normal maps, ETC1S for albedo/AO. Stays compressed in GPU memory, which matters most on iPad.
- **Budget (starting point):** ≤1.5M triangles visible at once on iPad, 2K textures per system (4K only for hero close-ups), one GLB per system ≤30 MB after compression.
- **LOD:** export LOD0/1/2 per system; load LOD1 first, swap in LOD0 on zoom.
- **USDZ:** optional, only for iOS "View in AR" (AR Quick Look). Not a runtime format.

### Anatomy structure and metadata
The 3D file holds geometry and stable IDs only. Everything else lives in data.
- **Node naming:** `sys.part.side`, e.g. `msk.biceps_brachii.L`. Never rename once shipped.
- **glTF extras per node:** `{ "id": "biceps_brachii_L", "system": "muscular", "layer": 3 }`.
- **Content database (JSON or SQLite, separate from GLB):** id → names (EN/TH/Latin), standard IDs (TA2 / FMA / SNOMED CT body structure), origin/insertion/innervation, notes, quiz items, artist notes (form, landmarks). This is what the phone companion app reuses without any 3D.
- **Layers:** a layer number per part (skin → superficial muscle → deep muscle → bone → organs) drives peel-away and x-ray.

### Offline
- Manifest lists packs with SHA-256 and size. App downloads per system, verifies hash, stores in app support dir (iPad) or Cache Storage/OPFS (web), and updates by diff on manifest version.

## 4. Team effort (rough)
- Flutter + flutter_scene/three.js: one Flutter dev + one part-time 3D/JS dev; spike 2 weeks; viewport MVP 6–8 weeks.
- Godot full app: rebuild all UI in Godot, plus a separate phone app; more effort for the same product.
- Pipeline automation (Blender export script + gltf-transform CI): ~1 week, then saves time on every asset change.

## 5. Open items to verify
- flutter_scene: meshopt/KTX2 support, picking, clipping, transparency sorting (spike).
- Godot 4.x web: current threads/COOP-COEP and iOS Safari behaviour (docs page could not be read in this pass).
- Safari 26 WebGPU on by default on iPadOS: stated by a secondary source (VR.org, May 2026), not confirmed from Apple.
- LightWave 2026 export formats on your installed version.

## Sources (accessed 2026-11-27)
- flutter_scene on pub.dev: https://pub.dev/packages/flutter_scene and docs https://pub.dev/documentation/flutter_scene/latest/
- Flutter GPU intro (Aug 2024, now partly outdated): https://flutter.dev/blog/getting-started-with-flutter-gpu
- thermion: https://github.com/nmfisher/thermion · https://pub.dev/packages/thermion_dart
- flutter_embed_unity: https://pub.dev/packages/flutter_embed_unity · flutter_unity_widget (discontinued): https://pub.dev/packages/flutter_unity_widget
- Godot web export docs: https://docs.godotengine.org/en/4.5/tutorials/export/exporting_for_web.html · build sizes: https://github.com/JohannesDeml/Godot-Web-LoadingTest
- Godot forum, iOS web crashes: https://forum.godotengine.org/t/game-crashes-randomly-on-ios-devices-html-export/114043
- LightWave 2026 release: https://www.cgchannel.com/2026/06/lightwave-digital-releases-lightwave-2026/
- 3DCoat glTF exporter class: https://3dcoat.com/files/docs/classgltf_1_1gltfExporter-members.html
- Blender glTF exporter: https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html
- WebGPU / three.js status (secondary): https://vr.org/articles/webgpu-baseline-2026-three-js-webxr-default · https://web.dev/blog/webgpu-supported-major-browsers
