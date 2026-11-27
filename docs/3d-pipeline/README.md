# 3D Pipeline docs

_Last updated: 2026-11-27_

Research and working notes for how 3D anatomy models get from the art tools (LightWave 3D, 3D-Coat, Blender) into the app (Flutter on iPad, Android, and Web).

| File | What it covers |
|---|---|
| [00-initial-recommendation.md](00-initial-recommendation.md) | First comparison of runtimes (flutter_scene, thermion, three.js, Unity, Godot, Bevy) |
| [01-pipeline.md](01-pipeline.md) | The pipeline we should build: tools, formats, compression, metadata, packaging, offline |
| [02-setup-workflow.md](02-setup-workflow.md) | How to set it up: tool versions, repo layout, export and optimize scripts, Flutter setup, CI, artist checklist |
| [03-evidence-and-lessons.md](03-evidence-and-lessons.md) | What others did, what worked, what went wrong, and what that means for us |

## Decision so far

- **One app, one renderer:** Flutter everywhere (iPad, Android, Web) with **flutter_scene** for 3D. No separate three.js web pipeline.
- **One asset format:** glTF 2.0 binary (**GLB**), exported only from **Blender**. LightWave and 3D-Coat feed Blender.
- **Gate:** a 2-week spike must pass before we commit (see 01-pipeline.md, section 7). three.js stays a documented fallback only.
- **No full game engine** (Godot/Unity) for now. See 03-evidence-and-lessons.md for why.

## Words used here
- **GLB**: one-file glTF 2.0. Geometry, materials, textures, node tree, custom data.
- **meshopt**: `EXT_meshopt_compression`, geometry compression that decodes fast.
- **KTX2 / Basis**: `KHR_texture_basisu`, GPU-compressed textures that stay small in GPU memory.
- **LOD**: lower-detail copies of a mesh, used when zoomed out.
- **Spike**: a short throwaway build to answer one risky question.
