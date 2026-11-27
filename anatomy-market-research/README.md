# 3D Anatomy Market Review (local site)

A static review website: market size, competitors, killer features, a positioning map, country prioritisation, pricing, go-to-market by market, a revenue model and risks. Every fact links to its source (accessed 2026-11-27). Estimates are tagged.

## Run locally

Option A: double-click `index.html`. It works from `file://` with no build step.

Option B: run a local server from this folder:

```bash
cd anatomy-market-research
python3 -m http.server 8080
# then open http://localhost:8080
```

## Files
- `index.html`: narrative content (EN, with a Thai summary)
- `assets/data.js`: competitors, market reports, country scores and sources. Edit this file to update the data.
- `assets/app.js`: the sortable table, positioning map, country weights and revenue calculator
- `assets/style.css`: styles (light and dark)
