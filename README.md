# Shader Gallery · Lote 1

Full-bleed swipe gallery of **10 cyberpunk WebGL background shaders** for Julián / Ignara Universe handoff.

## Live

GitHub Pages (after deploy): https://thejulianbeck.github.io/shader-gallery/

## Local

Open `index.html` via any static server (required for some Safari module/font cases; file:// usually works for this self-contained build):

```bash
python3 -m http.server 8765
# → http://localhost:8765
```

## Controls

- **Swipe** left/right (touch)
- **Arrow keys** or on-screen ‹ ›
- **EXPORT** — reveals SPEC + GLSL + self-contained HTML for Ignara Universe
- Dot indicators jump to a shader
- Animation **pauses** when the tab is hidden

## Shaders (Lote 1)

1. Neon Rain  
2. Holographic Grid  
3. Chrome Voids  
4. Glitch City  
5. Plasma Veins  
6. Scanline Fog  
7. Circuit Pulse  
8. Violet Abyss  
9. Data Stream  
10. Laser Aurora  

## Stack

- WebGL1 / GLSL ES 1.00 (`mediump`)
- No build step — static HTML/CSS/JS
- High-DPI with DPR cap; lower DPR on weak devices
- Honest fallback if WebGL is unavailable

## Safari / mobile notes

- Prefer WebGL1 context (`webgl` / `experimental-webgl`)
- `viewport-fit=cover` + safe-area insets for notched iPhones
- Reduced DPR on low-memory / low-core devices
- Pause on `visibilitychange` to save battery
