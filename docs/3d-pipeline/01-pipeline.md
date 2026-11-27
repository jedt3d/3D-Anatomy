# 01. The pipeline we should build

_Last updated: 2026-11-27. Status: proposal, pending spike._

## 1. Goal
Ship one set of 3D anatomy assets that:
- renders on iPad (first), Web (Flutter Web), Android (later);
- can be downloaded per body system for offline use;
- has every part selectable, labelled, searchable and layerable;
- can be rebuilt automatically when an artist changes a source file.

## 2. Shape of the pipeline

```
 SOURCE (artists)                HUB                    BUILD (script / CI)                  RUNTIME
 ──────────────────              ───────                ───────────────────                  ───────
 LightWave 2026 ──FBX/OBJ──┐
                           ├──► Blender (.blend) ──GLB──► gltf-transform ──► packs/*.glb ──► Flutter app
 3D-Coat ─sculpt→retopo→bake┘    names, IDs,             dedup, prune, weld   manifest.json    flutter_scene
                                 materials, LODs,        simplify (LOD)       + content DB     (iPad/Android:
 Blender (direct modelling) ────► custom properties      meshopt              (JSON/SQLite)     Impeller;
                                                         KTX2 (ETC1S/UASTC)                      Web: WebGL2)
                                                         glTF Validator gate
```

Rule: **only Blender writes GLB.** Every source tool hands Blender plain geometry and baked maps. That gives one place where names, IDs, scale, axes and materials are made consistent.

## 3. Role of each tool

### LightWave 3D (2026, released June 2026, Windows/macOS)
- Use for: hard-surface/base modelling the team already knows, layout, high-quality marketing renders.
- Hand-off: **FBX** (keeps hierarchy and names) or **OBJ** (geometry only). Release coverage of LightWave 2026 does not mention glTF or USD export, so do not rely on it for delivery.
- Watch for: unit scale (set 1 unit = 1 m on export or fix in Blender), Y-up vs Z-up, and n-gons (triangulate or quad-only before hand-off).
- Note: there is a `~/GitHub/lightwave3d-dev` folder on your Mac. If that is LightWave plugin work, a direct LightWave → glTF exporter is possible later, but it is not needed for v1.

### 3D-Coat
- Use for: organic sculpting (muscles, organs, skin detail), then **retopology** to a clean low-poly mesh and **baking** normal, AO and curvature maps from the high-res sculpt.
- Hand-off: low-poly mesh (FBX/OBJ) + baked maps (16-bit PNG for normal maps, 8-bit PNG for others).
- 3D-Coat has a glTF exporter in its codebase, but keep Blender as the single exporter.

### Blender (hub)
- Single source of truth per body system: `msk_upper_limb.blend`, `skeleton.blend`, etc.
- Holds: final names, part IDs (custom properties), layer numbers, PBR materials (Principled BSDF, metal/rough), LOD meshes, scale and orientation.
- Exports GLB with **custom properties → glTF `extras`** and **Apply Modifiers** on.

## 4. Asset rules (start here, adjust after the spike)

Based on the Khronos 3D Commerce realtime guidelines (v1.0.0, 2020) scaled up for a full-body app:

| Item | Rule |
|---|---|
| Units / axes | 1 unit = 1 m; +Y up; body faces +Z (glTF convention) |
| Triangles | ≤1.5M visible at once on iPad; per system pack target 150k–500k (LOD0) |
| LODs | LOD0 (full), LOD1 (~50%), LOD2 (~20%) per system |
| Textures | power-of-two; 2K default, 4K only for hero close-ups; base colour & emissive in sRGB, others linear |
| Normal maps | OpenGL convention, MikkTSpace tangents, never JPG |
| Materials | PBR metal/rough; as few materials as possible; transparent parts on their own material |
| UVs | fully unwrapped, 0–1, no overlap (except deliberate mirroring with separate AO) |
| Naming | `a–z 0–9 _ -`, starts with a letter, no spaces (see section 5) |
| Pack size | ≤30 MB per system pack after compression |

## 5. Part identity, labels and layers

The GLB carries **geometry + stable IDs only**. Everything a person reads lives in a content database.

- **Node name:** `<system>.<part>.<side>` e.g. `msk.biceps_brachii.l`. Once shipped, never rename (it breaks saved notes and quizzes).
- **Custom properties on each object in Blender → `extras` in GLB:**
  ```json
  { "aid": "biceps_brachii_l", "system": "muscular", "layer": 3, "pick": true }
  ```
- **Content DB (JSON in repo → SQLite in app):** keyed by `aid`:
  names (EN, TH, Latin), standard IDs (TA2, FMA, SNOMED CT body structure), origin/insertion/innervation/blood supply, artist notes (form, landmarks), label anchor point, related parts, quiz items.
- **Layers:** 0 skin, 1 fascia/fat, 2 superficial muscle, 3 deep muscle, 4 ligament/vessel/nerve, 5 bone, 6 organ. Drives peel-away and x-ray.
- The phone companion app uses the content DB only. No 3D needed for short notes and review.

## 6. Packaging and offline
- One GLB per body system and LOD: `skeleton.lod0.glb`, `skeleton.lod1.glb`, ...
- `manifest.json`: pack id, version, LOD, byte size, SHA-256, required content-DB version.
- iPad/Android: download to app support dir, verify hash, then load. Update only packs whose hash changed.
- Web: Cache Storage (service worker) or OPFS; same manifest.
- Host on a CDN (e.g., Cloudflare R2 or S3 + CloudFront); serve `.glb` with long cache headers and a versioned path.
- Optional: USDZ export of selected models for iOS "View in AR" (AR Quick Look). Not a runtime format.

## 7. Spike: pass/fail before committing to flutter_scene
Use one real pack (skeleton + upper-limb muscles, ~200–400 parts, ~1M tris, 2K textures). Must pass on a base iPad (A-series), a mid-range Android phone, and Safari on iPad (Flutter Web):

1. Loads meshopt + KTX2 GLB. If not, fall back to uncompressed geometry + PNG/WebP and measure the cost.
2. 60 fps orbit on iPad; ≥30 fps on mid Android and on web.
3. Tap → raycast picks the right part and returns its `aid` from `extras`.
4. Highlight/outline, hide, isolate, and per-layer opacity with correct transparency sorting.
5. One clipping plane (cross-section) via a custom `.fmat` material.
6. Flutter label widgets pinned to 3D anchor points while orbiting.
7. Load a pack from local file (iPad) and from cache (web).
8. GPU memory stays flat after loading/unloading packs 10 times (flutter_scene issue #285 says GPU memory has no release story yet).

If 3–5 fail and cannot be fixed in a few days, switch the viewport to three.js (WebView on device, page on web). The asset packs and the Flutter UI do not change.

## 8. Web delivery note
Flutter Web can build to Wasm (`flutter build web --wasm`), but per the Flutter docs (updated 2026-11-11) **iOS browsers fall back to the JS build (dart2js + CanvasKit) by default**; Safari 26.2+ can opt in through `wasmAllowList`. flutter_scene ships its own WebGL2 backend and works under both CanvasKit and Skwasm, so this changes load size and speed, not features. Impeller itself does not run on web.
