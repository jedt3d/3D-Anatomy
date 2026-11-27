#!/usr/bin/env python3
"""Render docs/3d-pipeline/*.md into HTML pages under anatomy-market-research/3d-pipeline/.

Run: pip install markdown && python3 tools/build_tech_pages.py
"""
import pathlib, re, html
import markdown

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "docs" / "3d-pipeline" / "th"   # Thai is the published language; English originals in docs/3d-pipeline/
OUT = ROOT / "anatomy-market-research" / "3d-pipeline"

PAGES = [  # (source md, output html, nav label)
    ("README.md", "index.html", "ภาพรวม"),
    ("00-initial-recommendation.md", "runtime-comparison.html", "เปรียบเทียบ runtime"),
    ("01-pipeline.md", "pipeline.html", "Pipeline"),
    ("02-setup-workflow.md", "setup-workflow.html", "การตั้งค่าและ workflow"),
    ("03-evidence-and-lessons.md", "evidence.html", "หลักฐานและบทเรียน"),
]
LINKMAP = {src: out for src, out, _ in PAGES}

EXTRA_CSS = """
.doc{max-width:900px}
.doc h2{margin-top:40px}
.doc table{display:block;overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:var(--card)}
.doc pre{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px;overflow-x:auto;font-size:13px;line-height:1.45}
.doc code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.92em}
.doc :not(pre)>code{background:var(--chip);padding:1px 5px;border-radius:4px}
.doc blockquote{border-left:4px solid var(--accent2);background:var(--card);margin:14px 0;padding:8px 16px;border-radius:0 8px 8px 0}
.doc a{color:var(--accent2);overflow-wrap:anywhere}
.doc li{margin:3px 0}
.doc p,.doc li{overflow-wrap:anywhere}
nav a.on{background:var(--ink);color:var(--bg)}
"""

def prep(text):
    """Adapt GitHub-style Markdown to Python-Markdown rules."""
    lines, out, fence = text.split("\n"), [], False
    for ln in lines:
        st = ln.lstrip()
        if st.startswith("```"):
            if not fence and out and out[-1].strip():
                out.append("")
            fence = not fence
            out.append(st)          # fenced blocks at column 0
            if not fence:
                out.append("")
            continue
        if fence:
            # strip the list indent the block had in the source
            out.append(ln[2:] if ln.startswith("  ") else ln)
            continue
        ln = re.sub(r'(?<![<(\"`])(https?://[^\s)<>`]+)', r'<\1>', ln)  # autolink bare URLs
        is_item = re.match(r"^\s*([-*]|\d+\.)\s", ln)
        if is_item:
            ind = len(ln) - len(st)
            if 0 < ind < 4:
                ln = "    " + st     # nested item needs 4 spaces
            prev = out[-1] if out else ""
            if prev.strip() and not re.match(r"^\s*([-*]|\d+\.)\s", prev) and not prev.startswith("    "):
                out.append("")
        out.append(ln)
    return "\n".join(out)

def render(src, out, label):
    text = prep((SRC / src).read_text(encoding="utf-8"))
    body = markdown.markdown(text, extensions=["tables", "fenced_code", "sane_lists"])
    for s, o in LINKMAP.items():
        body = body.replace(f'href="{s}"', f'href="{o}"')
    body = re.sub(r'href="(https?://[^"]+)"', r'href="\1" target="_blank" rel="noopener"', body)
    m = re.search(r"<h1>(.*?)</h1>", body)
    title = re.sub("<[^>]+>", "", m.group(1)) if m else label
    nav = '<a href="../../index.html">← หน้ารวมรายงาน</a>' + "".join(
        f'<a href="{o}"{" class=\"on\"" if o == out else ""}>{html.escape(l)}</a>' for _, o, l in PAGES)
    return f"""<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)} · 3D Pipeline</title>
<link rel="stylesheet" href="../assets/style.css">
<style>{EXTRA_CSS}</style>
</head>
<body>
<header class="top"><nav>{nav}</nav></header>
<main class="doc thai">
<p class="meta">3D Anatomy · งานวิจัยด้านเทคนิค · สร้างจาก <code>docs/3d-pipeline/th/{src}</code> · <a href="https://github.com/jedt3d/3D-Anatomy/blob/main/docs/3d-pipeline/{src}">ต้นฉบับภาษาอังกฤษ</a></p>
{body}
<footer>ต้นฉบับ: <a href="https://github.com/jedt3d/3D-Anatomy/tree/main/docs/3d-pipeline">docs/3d-pipeline</a> บน GitHub</footer>
</main>
</body>
</html>
"""

OUT.mkdir(parents=True, exist_ok=True)
for src, out, label in PAGES:
    (OUT / out).write_text(render(src, out, label), encoding="utf-8")
    print("wrote", OUT / out)
