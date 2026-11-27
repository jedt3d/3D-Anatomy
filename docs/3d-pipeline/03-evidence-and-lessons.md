# 03. Evidence: what others did and what they learned

_Last updated: 2026-11-27. Every claim has a source and date. "Not verified" means I could not read the primary source in this pass._

## 1. flutter_scene (our main bet)

**What it is now.** "A realtime 3D engine for Flutter, built on Flutter GPU and Impeller", by Brandon DeRosier, who also built Flutter GPU (fscene.dev). MIT. GitHub: ~760 stars, 82 forks, 22 open issues, 10 open PRs (read 2026-11-27). Latest on pub.dev: 0.24.x (0.24.3 dated 2026-10-09; docs show 0.24.6). Needs Flutter 3.47+. Platforms: iOS, Android, Web, macOS, Windows, Linux.

**Features that matter to us (README):** glTF import (.glb, .gltf), PBR, image-based lighting, LODs, instancing, custom `.fmat` GLSL materials (needed for clipping/x-ray), **raycast picking**, orbit camera, **Flutter widgets on 3D surfaces**, screen-reader semantics, hot reload of models and shaders, a desktop editor.
Not mentioned: clipping planes, transparency sorting details, meshopt/KTX2 support. → test in the spike.

**History (why older articles disagree):**
| Date | State | Source |
|---|---|---|
| Aug 2024 | Flutter GPU + flutter_scene in preview, main channel only, Impeller required, web not a target | flutter.dev blog "Getting started with Flutter GPU" (2024-08-06); Flutter Force Weekly 03a (2024-08-11) |
| 2026 | Works on Flutter 3.47 stable; web via its own WebGL2 backend; pre-1.0 with breaking minor releases | pub.dev flutter_scene, GitHub README |

**Who has built with it:**
- **KBTG (Kasikorn Business-Technology Group, Thailand)**: Amorn Apichattanakul, "Bring 3D to Life in Flutter with flutter_scene and Flutter GPU" (2026-10-14): a 3D hotel tour and island, focused on "what each 3D effect actually costs on a phone". Full article could not be fetched (Medium blocked); worth reading directly, and worth contacting, since KBTG is local.
- **Showcase demos** by the author: Dashsurfers (endless runner) and Dashmap (streaming 3D world map); site lists ~40 examples.
- **Community experiments**: "flutter_scene experiments" (Chongqing miniature from OpenStreetMap data; real-time worm swarm), "best viewed on a laptop browser".
- I found **no shipped medical/anatomy app** on flutter_scene. We would likely be early.

**Lessons from its open issues (GitHub, read 2026-11-27):**
| Issue | Lesson for us |
|---|---|
| #351 (2026-08-21) ~3x frame-rate drop on a branch vs 0.20.0, same scene | Pin the version; benchmark every upgrade with our own scene |
| #285 (2026-08-01) GPU memory has no ownership/accounting/release story | Loading/unloading packs on iPad may leak; test in spike (item 8) |
| #234 (2026-07-12) directional-light shadows show stripes on Android/mobile only | Avoid dynamic shadows; use baked AO (we want that anyway) |
| #354, #355 (2026-08-23) shader bundles packaged twice; stale backend files shipped | App size may be bigger than needed; check IPA/APK size |
| #382 (2026-09-03) widget-on-surface texture crushes dark colours | Don't put text on 3D surfaces; draw labels as normal Flutter overlay |
| #314 Android emulator crash (SwANGLE) | Test on real Android devices |

**Verdict:** feature list fits an anatomy viewer, and the engine is active. The risks are maturity (pre-1.0, single main author, perf regressions, GPU memory) and no known medical app yet. That is why the spike is a gate, and why 3D stays behind one interface.

## 2. Other ways people put 3D in Flutter

| Approach | Evidence | Lesson |
|---|---|---|
| **model_viewer_plus** (WebView + Google `<model-viewer>`) | pub.dev 1.10.0, ~49k downloads. Needs cleartext localhost on Android 9+, an Info.plist flag on iOS, CORS headers on web; "AR View may not be available on iOS 16+"; low render quality on some phones (issue #44) | Good for "show one product model". Too limited for picking hundreds of parts, layers, clipping |
| **thermion** (Filament engine for Flutter) | GitHub nmfisher/thermion: iOS, Android, macOS, Windows, Web/WASM; Apache-2.0; ~220 stars; thermion_dart 0.5.0 (2026-08-20); multithreaded WASM needs COOP/COEP | Strong renderer (Filament) but small project, mostly one maintainer |
| **Unity embedded in Flutter** | flutter_unity_widget: last release 2024-01-08, marked **discontinued** on pub.dev; Flutter widgets over Unity on web don't receive taps. flutter_embed_unity 2.0.0 (2026-04-13): Android/iOS only, **no web**, one Unity instance, Unity stays in memory after dispose | Embedding a game engine into Flutter is fragile and breaks our web target |

## 3. Game engines as the whole app

| Engine | Evidence | Lesson |
|---|---|---|
| **Godot 4** | Web export needs WebAssembly + WebGL 2.0 (Godot docs). Release web build ~6.2 MB for 4.5.2, ~6.3 MB for 4.6.2; grew ~15% from 4.3 to 4.4; author notes "loading times are really long for godot (compared to unity)" (JohannesDeml/Godot-Web-LoadingTest). Forum threads report random crashes of HTML exports on iOS devices (2025) | Fine engine, but web on iPad is the weak spot, and we would rebuild all app UI (Thai text, forms, IAP) in Godot plus a separate phone app |
| **Unity** | Large web builds; licence terms; embedding issues above | Overkill for mostly-static anatomy meshes |

## 4. How established anatomy platforms did it

| Product | What is documented | Lesson |
|---|---|---|
| **Google Body → ZygoteBody** | Google Body launched 2010-12-15 using JavaScript + WebGL, no plugins; Google shut it 2011-10-13; Zygote relaunched it 2012-01-09 and open-sourced the core as open-3d-viewer. Layers can be removed or made transparent; parts are labelled and searchable (Wikipedia) | Layers + transparency + labels + search is the core feature set, and it has run on plain WebGL since 2010. We don't need a game engine for it |
| **BioDigital Human** | Launched 2011 as web-based 3D body; "one of the early systems to leverage WebGL"; runs in browsers without plugins; >1M users; offers APIs (Wikipedia) | Web-first 3D anatomy is a proven business; their value is the content DB and API, not the renderer |
| Complete Anatomy, Visible Body, etc. | Rendering stack not publicly documented in sources I could read | Not verified, so not used as evidence |

## 5. Asset tools

| Tool | Evidence | Lesson |
|---|---|---|
| **LightWave 2026** | Released 2026-06-15 coverage (CG Channel): Windows 10+/macOS 14.1+, £795; features are VFX/modelling/rendering (MotoRig, Fracture, RiPR 2, Gaussian-splat preview). No glTF/USD export mentioned. Reallusion forum (2025-12-26) user asking to restore a LightWave export path | Treat LightWave as a modelling source; hand off FBX/OBJ to Blender |
| **3D-Coat** | Its API docs contain a `gltf::gltfExporter` class (docs generated 2025-12-25) | glTF export exists in code; still route through Blender for one convention |
| **Blender** | Official glTF 2.0 importer/exporter in the manual, including custom properties → extras | The de-facto hub for glTF pipelines |
| **glTF Transform CLI** | v4.5.0: `inspect`, `optimize`, `dedup`, `prune`, `weld`, `simplify`, `meshopt`, `draco`, `etc1s`, `uastc`, `webp`… Docs say `optimize` defaults "may not be ideal for all scenes", run `inspect` first | Script individual steps, don't rely on one-shot optimize |
| **Khronos 3D Commerce realtime guidelines** v1.0.0 (2020-10-20) | ≤100k triangles and ideally <5 MB per product asset; 1K/2K textures, power-of-two; PBR metal/rough; sRGB only for base colour/emissive; OpenGL normals, MikkTSpace; UVs 0–1; names a–z0–9_-; 1 unit = 1 m, +Y up | Good base rules; our packs are bigger than one product, so we set per-pack budgets instead |

## 6. Flutter Web reality check
Flutter docs (updated 2026-11-11): `flutter build web --wasm` needs WasmGC and newer Wasm features; Chromium 137+ runs Wasm by default; **all iOS browsers fall back to the JS build by default**; Safari 26.2+ can opt in. Multithreaded rendering needs COOP/COEP headers. `dart:html`/`package:js` are not supported under Wasm, so use `package:web` and `dart:js_interop`.
**Lesson:** on iPad Safari, expect the JS + CanvasKit build unless we opt in. Budget for a larger first load and test both builds.

## 7. What this means for us
1. Flutter + flutter_scene is the right first bet: it matches the user's stack and covers iPad, Android and Web with one codebase. Nobody has shipped an anatomy app on it that I could find, so we prove it in a 2-week spike.
2. Keep 3D behind `AnatomyViewport`. If the spike fails, three.js is the fallback; the asset packs do not change.
3. Don't embed Unity or move to Godot: the evidence shows weak web on iPad and fragile embedding.
4. Our real moat, like BioDigital's, is the **content DB** (IDs, names, relations, notes) and clean, well-named assets. Invest there first.
5. Avoid dynamic shadows and text-on-3D; use baked AO and Flutter overlays.
6. Pin versions and benchmark every engine upgrade with our own scene.

## Sources (accessed 2026-11-27)
- flutter_scene: https://pub.dev/packages/flutter_scene · https://github.com/bdero/flutter_scene · https://github.com/bdero/flutter_scene/issues · https://fscene.dev/
- KBTG article: https://medium.com/kbtg-life/bring-3d-to-life-in-flutter-with-flutter-scene-and-flutter-gpu-068c9421470a (teaser via https://flutterx.com/bring-3d-to-life-in-flutter-with-flutter-scene-and-flutter-gpu-2026-10-14)
- flutter_scene experiments: https://sourav-sonkar.github.io/flutter_scence_practice/
- Flutter GPU blog (2024): https://flutter.dev/blog/getting-started-with-flutter-gpu · https://flutterforce.substack.com/p/flutter-force-weekly-03a
- Flutter Web Wasm: https://docs.flutter.dev/platform-integration/web/wasm
- thermion: https://github.com/nmfisher/thermion · https://pub.dev/packages/thermion_dart
- model_viewer_plus: https://pub.dev/packages/model_viewer_plus
- Unity in Flutter: https://pub.dev/packages/flutter_unity_widget · https://pub.dev/packages/flutter_embed_unity
- Godot: https://docs.godotengine.org/en/4.5/tutorials/export/exporting_for_web.html · https://github.com/JohannesDeml/Godot-Web-LoadingTest · https://forum.godotengine.org/t/game-crashes-randomly-on-ios-devices-html-export/114043
- Anatomy platforms: https://en.wikipedia.org/wiki/ZygoteBody · https://en.wikipedia.org/wiki/BioDigital
- LightWave 2026: https://www.cgchannel.com/2026/06/lightwave-digital-releases-lightwave-2026/ · https://discussions.reallusion.com/t/iclone-and-cc5-to-lightwave3d-2025-6/16230
- 3D-Coat glTF exporter class: https://3dcoat.com/files/docs/classgltf_1_1gltfExporter-members.html
- Blender glTF: https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html
- glTF Transform CLI: https://gltf-transform.dev/cli
- Khronos realtime asset guidelines: https://github.com/mlimper/3DC-Asset-Creation/blob/main/asset-creation-guidelines/RealtimeAssetCreationGuidelines.md
