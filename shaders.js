/* Julián Shader Gallery — Lote 1 shader library (WebGL1-safe GLSL ES 1.00) */
window.SHADER_LOTE_1 = [
  {
    "id": "neon-rain",
    "name": "Neon Rain",
    "mood": "acid cyan · falling neon · night noir",
    "keywords": [
      "neon",
      "rain",
      "matrix",
      "cyan",
      "magenta",
      "noir"
    ],
    "palette": [
      "#05060a",
      "#00f0ff",
      "#ff2bd6",
      "#7af7ff",
      "#0a1020"
    ],
    "motion": "Vertical rain streaks with parallax layers, occasional magenta flares, slow horizontal drift.",
    "performance": "Light — hashed streaks, no heavy loops. Mobile-safe.",
    "fragment": "precision mediump float;\nuniform float u_time;\nuniform vec2 u_resolution;\nvarying vec2 v_uv;\nfloat hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }\nfloat rain(vec2 uv, float t, float dens, float speed){\n  vec2 g = vec2(uv.x * dens, uv.y * dens * 0.35 - t * speed);\n  vec2 i = floor(g); float f = fract(g.y);\n  float h = hash(i);\n  float streak = smoothstep(0.92, 1.0, 1.0 - abs(fract(g.x) - 0.5) * 2.0);\n  float len = mix(0.15, 0.55, h);\n  float drop = smoothstep(len, 0.0, f) * streak * step(0.55, h);\n  return drop;\n}\nvoid main(){\n  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;\n  float t = u_time;\n  vec3 col = vec3(0.02, 0.03, 0.06);\n  float r1 = rain(uv, t, 28.0, 1.8);\n  float r2 = rain(uv + 0.13, t * 0.85, 42.0, 2.4);\n  float r3 = rain(uv - 0.07, t * 1.15, 18.0, 1.2);\n  col += vec3(0.0, 0.85, 1.0) * r1 * 0.9;\n  col += vec3(0.0, 0.95, 1.0) * r2 * 0.55;\n  col += vec3(1.0, 0.15, 0.75) * r3 * 0.45;\n  float glow = rain(uv * 0.6, t * 0.4, 10.0, 0.6);\n  col += vec3(0.1, 0.4, 0.6) * glow * 0.35;\n  float vig = smoothstep(1.3, 0.2, length(uv));\n  col *= vig;\n  col = pow(col, vec3(0.92));\n  gl_FragColor = vec4(col, 1.0);\n}",
    "traits": [
      "neon",
      "rain",
      "cyan",
      "magenta",
      "density-high",
      "streaks",
      "noir",
      "vertical"
    ],
    "lote": 1
  },
  {
    "id": "holographic-grid",
    "name": "Holographic Grid",
    "mood": "horizon perspective · hologram flicker · teal glass",
    "keywords": [
      "grid",
      "hologram",
      "perspective",
      "teal",
      "scan"
    ],
    "palette": [
      "#020812",
      "#14ffe4",
      "#6bffe8",
      "#0a2a3a",
      "#ffffff"
    ],
    "motion": "Infinite floor grid rushing toward camera with holographic shimmer and scan pulse.",
    "performance": "Light — analytic grid + soft fog.",
    "fragment": "precision mediump float;\nuniform float u_time;\nuniform vec2 u_resolution;\nvarying vec2 v_uv;\nvoid main(){\n  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;\n  float t = u_time;\n  vec3 col = vec3(0.01, 0.03, 0.06);\n  float horizon = 0.12;\n  if (uv.y < horizon) {\n    float depth = (horizon - uv.y);\n    vec2 p = vec2(uv.x / max(depth, 0.001), 1.0 / max(depth, 0.001));\n    p.y += t * 1.6;\n    vec2 gv = abs(fract(p) - 0.5);\n    float line = smoothstep(0.04, 0.0, min(gv.x, gv.y));\n    float fade = smoothstep(0.0, 0.55, depth);\n    col += vec3(0.08, 0.95, 0.85) * line * fade * 1.2;\n    col += vec3(0.02, 0.2, 0.25) * fade * 0.5;\n  } else {\n    float sky = (uv.y - horizon) * 1.4;\n    col += vec3(0.02, 0.08, 0.12) * (1.0 - sky);\n    float scan = 0.5 + 0.5 * sin(uv.y * 80.0 - t * 3.0);\n    col += vec3(0.05, 0.3, 0.28) * scan * 0.08 * (1.0 - sky);\n  }\n  float beam = exp(-abs(uv.x) * 3.5) * 0.15 * (0.6 + 0.4 * sin(t * 2.0));\n  col += vec3(0.2, 1.0, 0.9) * beam * smoothstep(0.4, -0.2, uv.y);\n  float flicker = 0.92 + 0.08 * sin(t * 17.0 + uv.y * 40.0);\n  col *= flicker;\n  float vig = smoothstep(1.4, 0.25, length(uv * vec2(0.9, 1.1)));\n  col *= vig;\n  gl_FragColor = vec4(col, 1.0);\n}",
    "traits": [
      "grid",
      "hologram",
      "perspective",
      "teal",
      "scan",
      "density-medium",
      "floor",
      "flicker"
    ],
    "lote": 1
  },
  {
    "id": "chrome-voids",
    "name": "Chrome Voids",
    "mood": "liquid metal · dark orbs · neon reflections",
    "keywords": [
      "chrome",
      "metal",
      "orb",
      "void",
      "reflection"
    ],
    "palette": [
      "#0a0a10",
      "#c8d0e0",
      "#ff3cac",
      "#00e5ff",
      "#1a1028"
    ],
    "motion": "Soft SDF metal spheres with animated highlight sweeps and dual neon rim lights.",
    "performance": "Medium — few SDF spheres, cheap specular.",
    "fragment": "precision mediump float;\nuniform float u_time;\nuniform vec2 u_resolution;\nvarying vec2 v_uv;\nfloat sdCircle(vec2 p, float r){ return length(p) - r; }\nvoid main(){\n  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;\n  float t = u_time;\n  vec3 bg = vec3(0.03, 0.03, 0.06);\n  bg += vec3(0.15, 0.02, 0.12) * exp(-length(uv - vec2(-0.55, 0.3)) * 2.5);\n  bg += vec3(0.02, 0.12, 0.2) * exp(-length(uv - vec2(0.6, -0.25)) * 2.2);\n  vec3 col = bg;\n  for (int i = 0; i < 3; i++) {\n    float fi = float(i);\n    vec2 c = vec2(sin(t * 0.35 + fi * 2.1) * 0.35, cos(t * 0.28 + fi * 1.7) * 0.22);\n    float r = 0.22 - fi * 0.04;\n    float d = sdCircle(uv - c, r);\n    float soft = smoothstep(0.02, -0.08, d);\n    vec2 n = normalize(uv - c + 1e-4);\n    float spec = pow(max(0.0, dot(n, normalize(vec2(sin(t), cos(t * 0.7))))), 24.0);\n    float fres = pow(1.0 - max(0.0, -d / r), 2.5);\n    vec3 metal = mix(vec3(0.12, 0.13, 0.16), vec3(0.75, 0.8, 0.9), fres);\n    metal += vec3(1.0, 0.25, 0.7) * fres * 0.35;\n    metal += vec3(0.0, 0.9, 1.0) * spec;\n    col = mix(col, metal, soft);\n    col += vec3(0.0, 0.7, 1.0) * exp(-abs(d) * 40.0) * 0.25;\n  }\n  col = pow(col, vec3(0.95));\n  gl_FragColor = vec4(col, 1.0);\n}",
    "traits": [
      "chrome",
      "metal",
      "orb",
      "void",
      "reflection",
      "sparse",
      "specular",
      "magenta-rim"
    ],
    "lote": 1
  },
  {
    "id": "glitch-city",
    "name": "Glitch City",
    "mood": "broken signal · RGB split · skyline pulse",
    "keywords": [
      "glitch",
      "city",
      "rgb-split",
      "databend",
      "night"
    ],
    "palette": [
      "#08040c",
      "#ff004c",
      "#00ffe0",
      "#ffe600",
      "#2a0830"
    ],
    "motion": "Procedural skyline with chromatic aberration, tear bands, and timed glitch bursts.",
    "performance": "Light-medium — skyline bars + hash glitch bands.",
    "fragment": "precision mediump float;\nuniform float u_time;\nuniform vec2 u_resolution;\nvarying vec2 v_uv;\nfloat hash(float n){ return fract(sin(n) * 43758.5453); }\nfloat hash2(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }\nfloat skyline(vec2 uv){\n  float x = uv.x * 8.0;\n  float id = floor(x);\n  float h = 0.15 + 0.55 * hash(id * 7.13);\n  float w = 0.35 + 0.3 * hash(id * 3.7);\n  float cx = fract(x) - 0.5;\n  float building = step(abs(cx), w * 0.5) * step(uv.y + 0.45, h);\n  float win = step(0.7, hash2(vec2(id, floor((uv.y + 0.45) * 18.0)))) * building;\n  return building * 0.35 + win * 0.9;\n}\nvoid main(){\n  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;\n  float t = u_time;\n  float gBurst = step(0.92, hash(floor(t * 3.0)));\n  float tear = (hash(floor(uv.y * 40.0 + t * 8.0)) - 0.5) * gBurst * 0.08;\n  vec2 guv = uv + vec2(tear, 0.0);\n  float shift = 0.008 + 0.02 * gBurst;\n  float r = skyline(guv + vec2(shift, 0.0));\n  float g = skyline(guv);\n  float b = skyline(guv - vec2(shift, 0.0));\n  vec3 col = vec3(0.05, 0.02, 0.08);\n  col += vec3(r, g * 0.7, b) * vec3(1.0, 0.3, 0.85);\n  col += vec3(0.0, 0.9, 0.85) * g * 0.25;\n  float band = step(0.97, hash(floor(uv.y * 25.0 + t * 12.0))) * gBurst;\n  col = mix(col, vec3(1.0, 0.95, 0.2), band * 0.55);\n  float fog = exp(-(uv.y + 0.5) * 1.8);\n  col += vec3(0.4, 0.05, 0.25) * fog * 0.2;\n  float scan = 0.85 + 0.15 * sin(gl_FragCoord.y * 2.5 + t * 10.0);\n  col *= scan;\n  gl_FragColor = vec4(col, 1.0);\n}",
    "traits": [
      "glitch",
      "city",
      "rgb-split",
      "databend",
      "night",
      "skyline",
      "noise",
      "scanline"
    ],
    "lote": 1
  },
  {
    "id": "plasma-veins",
    "name": "Plasma Veins",
    "mood": "organic energy · magenta flow · living neon",
    "keywords": [
      "plasma",
      "veins",
      "organic",
      "magenta",
      "flow"
    ],
    "palette": [
      "#0a0210",
      "#ff1f8f",
      "#ff6bcb",
      "#5b1aff",
      "#1a0530"
    ],
    "motion": "Domain-warped FBM veins with pulsing brightness along flow paths.",
    "performance": "Medium — 2-layer warp, keep octaves low for mobile.",
    "fragment": "precision mediump float;\nuniform float u_time;\nuniform vec2 u_resolution;\nvarying vec2 v_uv;\nfloat hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }\nfloat noise(vec2 p){\n  vec2 i = floor(p); vec2 f = fract(p);\n  float a = hash(i); float b = hash(i + vec2(1.0, 0.0));\n  float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));\n  vec2 u = f * f * (3.0 - 2.0 * f);\n  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;\n}\nfloat fbm(vec2 p){\n  float v = 0.0; float a = 0.5;\n  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }\n  return v;\n}\nvoid main(){\n  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;\n  float t = u_time * 0.35;\n  vec2 p = uv * 2.2;\n  vec2 q = vec2(fbm(p + t), fbm(p + vec2(2.3, 1.1) - t));\n  vec2 r = vec2(fbm(p + 2.0 * q + vec2(1.7, 9.2) + t * 0.6), fbm(p + 2.0 * q + vec2(8.3, 2.8) - t * 0.4));\n  float f = fbm(p + 2.5 * r);\n  float veins = pow(1.0 - abs(f * 2.0 - 1.0), 3.5);\n  vec3 col = vec3(0.04, 0.01, 0.08);\n  col += vec3(0.9, 0.1, 0.55) * veins;\n  col += vec3(0.35, 0.05, 0.9) * pow(f, 2.0) * 0.55;\n  col += vec3(1.0, 0.5, 0.85) * pow(veins, 4.0) * 0.8;\n  float pulse = 0.7 + 0.3 * sin(t * 4.0 + f * 6.0);\n  col *= pulse;\n  col *= smoothstep(1.35, 0.2, length(uv));\n  gl_FragColor = vec4(col, 1.0);\n}",
    "traits": [
      "plasma",
      "veins",
      "organic",
      "magenta",
      "flow",
      "noise",
      "density-high",
      "violet"
    ],
    "lote": 1
  },
  {
    "id": "scanline-fog",
    "name": "Scanline Fog",
    "mood": "CRT haze · soft fog volumes · cold phosphor",
    "keywords": [
      "scanline",
      "fog",
      "crt",
      "phosphor",
      "haze"
    ],
    "palette": [
      "#060a0e",
      "#7fd4ff",
      "#b8e8ff",
      "#1a3040",
      "#3a6070"
    ],
    "motion": "Drifting soft fog blobs behind classic CRT scanlines and gentle phosphor bloom.",
    "performance": "Light — few noise samples + scanline multiply.",
    "fragment": "precision mediump float;\nuniform float u_time;\nuniform vec2 u_resolution;\nvarying vec2 v_uv;\nfloat hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }\nfloat noise(vec2 p){\n  vec2 i = floor(p); vec2 f = fract(p);\n  float a = hash(i); float b = hash(i + vec2(1.0, 0.0));\n  float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));\n  vec2 u = f * f * (3.0 - 2.0 * f);\n  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n}\nvoid main(){\n  vec2 uv = gl_FragCoord.xy / u_resolution.xy;\n  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;\n  float t = u_time * 0.15;\n  float n1 = noise(p * 1.5 + vec2(t, t * 0.7));\n  float n2 = noise(p * 2.8 - vec2(t * 0.6, -t));\n  float fog = smoothstep(0.35, 0.85, n1 * 0.65 + n2 * 0.45);\n  vec3 col = vec3(0.04, 0.06, 0.09);\n  col += vec3(0.35, 0.7, 0.95) * fog * 0.55;\n  col += vec3(0.55, 0.85, 1.0) * pow(fog, 3.0) * 0.35;\n  float beam = exp(-abs(p.x + 0.15 * sin(t * 2.0)) * 4.0) * 0.12;\n  col += vec3(0.4, 0.8, 1.0) * beam;\n  float scan = 0.78 + 0.22 * sin(gl_FragCoord.y * 3.14159);\n  col *= scan;\n  float roll = 0.96 + 0.04 * sin(uv.y * 6.0 - u_time * 2.0);\n  col *= roll;\n  col *= smoothstep(1.4, 0.3, length(p));\n  gl_FragColor = vec4(col, 1.0);\n}",
    "traits": [
      "scanline",
      "fog",
      "crt",
      "phosphor",
      "haze",
      "soft",
      "density-low",
      "blue"
    ],
    "lote": 1
  },
  {
    "id": "circuit-pulse",
    "name": "Circuit Pulse",
    "mood": "PCB traces · electric pulse · emerald current",
    "keywords": [
      "circuit",
      "pcb",
      "pulse",
      "electric",
      "emerald"
    ],
    "palette": [
      "#040806",
      "#00ff9c",
      "#7dffc8",
      "#0a2018",
      "#ffcc00"
    ],
    "motion": "Manhattan-ish circuit traces with traveling pulse packets and node glows.",
    "performance": "Light — grid + distance-to-trace tricks.",
    "fragment": "precision mediump float;\nuniform float u_time;\nuniform vec2 u_resolution;\nvarying vec2 v_uv;\nfloat hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }\nfloat traces(vec2 uv){\n  vec2 g = abs(fract(uv) - 0.5);\n  float h = hash(floor(uv));\n  float horiz = step(0.5, h) * smoothstep(0.04, 0.0, g.y);\n  float vert = step(0.5, 1.0 - h) * smoothstep(0.04, 0.0, g.x);\n  return max(horiz, vert);\n}\nvoid main(){\n  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;\n  float t = u_time;\n  vec2 p = uv * 6.0;\n  float tr = traces(p);\n  float tr2 = traces(p * 0.5 + 0.25);\n  vec2 cell = floor(p);\n  float node = smoothstep(0.12, 0.0, length(fract(p) - 0.5));\n  node *= step(0.75, hash(cell));\n  float pulse = fract(t * 0.35 + hash(cell) + uv.x * 0.2 + uv.y * 0.15);\n  float packet = smoothstep(0.15, 0.0, abs(pulse - 0.5)) * tr;\n  vec3 col = vec3(0.02, 0.04, 0.03);\n  col += vec3(0.0, 0.45, 0.28) * (tr * 0.45 + tr2 * 0.25);\n  col += vec3(0.2, 1.0, 0.65) * packet * 1.4;\n  col += vec3(1.0, 0.85, 0.2) * node * (0.5 + 0.5 * sin(t * 6.0 + hash(cell) * 20.0));\n  col += vec3(0.0, 0.8, 0.5) * exp(-length(uv) * 1.5) * 0.15;\n  col *= smoothstep(1.35, 0.25, length(uv));\n  gl_FragColor = vec4(col, 1.0);\n}",
    "traits": [
      "circuit",
      "pcb",
      "pulse",
      "electric",
      "emerald",
      "grid",
      "nodes",
      "density-medium"
    ],
    "lote": 1
  },
  {
    "id": "violet-abyss",
    "name": "Violet Abyss",
    "mood": "deep void · purple vortices · star-dust drift",
    "keywords": [
      "violet",
      "abyss",
      "vortex",
      "void",
      "cosmic"
    ],
    "palette": [
      "#050016",
      "#6b1aff",
      "#c44dff",
      "#1a0535",
      "#e0b0ff"
    ],
    "motion": "Slow spiral vortex into a dark core with orbiting particle dust and soft blooms.",
    "performance": "Light — polar spiral + sparse dots.",
    "fragment": "precision mediump float;\nuniform float u_time;\nuniform vec2 u_resolution;\nvarying vec2 v_uv;\nfloat hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }\nvoid main(){\n  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;\n  float t = u_time * 0.25;\n  float r = length(uv);\n  float a = atan(uv.y, uv.x);\n  float spiral = sin(a * 5.0 + 1.0 / max(r, 0.05) - t * 4.0);\n  float arms = smoothstep(0.3, 1.0, spiral) * exp(-r * 1.8);\n  vec3 col = vec3(0.03, 0.01, 0.08);\n  col += vec3(0.35, 0.08, 0.7) * arms;\n  col += vec3(0.7, 0.25, 1.0) * pow(arms, 3.0) * 0.8;\n  float core = exp(-r * 8.0);\n  col = mix(col, vec3(0.01, 0.0, 0.02), core);\n  col += vec3(0.5, 0.2, 0.9) * exp(-r * 3.0) * 0.25;\n  vec2 gu = floor(uv * 40.0);\n  float star = step(0.97, hash(gu + floor(t)));\n  star *= smoothstep(0.5, 1.2, r);\n  col += vec3(0.9, 0.75, 1.0) * star * 0.7;\n  float dust = hash(uv * 30.0 + t);\n  col += vec3(0.6, 0.3, 1.0) * smoothstep(0.85, 1.0, dust) * exp(-r) * 0.2;\n  gl_FragColor = vec4(col, 1.0);\n}",
    "traits": [
      "violet",
      "abyss",
      "vortex",
      "void",
      "cosmic",
      "spiral",
      "sparse",
      "dust"
    ],
    "lote": 1
  },
  {
    "id": "data-stream",
    "name": "Data Stream",
    "mood": "hex cascade · terminal green · uplink flow",
    "keywords": [
      "data",
      "stream",
      "hex",
      "terminal",
      "cascade"
    ],
    "palette": [
      "#020805",
      "#00ff66",
      "#9dffc0",
      "#003318",
      "#d0ffe0"
    ],
    "motion": "Cascading columns of digital glyphs with brightness trails and occasional bright packets.",
    "performance": "Light — column hash + trail falloff.",
    "fragment": "precision mediump float;\nuniform float u_time;\nuniform vec2 u_resolution;\nvarying vec2 v_uv;\nfloat hash(float n){ return fract(sin(n) * 43758.5453); }\nfloat hash2(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }\nvoid main(){\n  vec2 uv = gl_FragCoord.xy / u_resolution.xy;\n  float t = u_time;\n  float cols = 28.0;\n  float colId = floor(uv.x * cols);\n  float x = fract(uv.x * cols);\n  float speed = 0.4 + 0.8 * hash(colId);\n  float y = fract(uv.y + t * speed + hash(colId * 3.1));\n  float glyph = step(0.55, hash2(vec2(colId, floor((uv.y + t * speed) * 28.0))));\n  float trail = pow(1.0 - y, 2.5);\n  float cell = smoothstep(0.35, 0.15, abs(x - 0.5)) * glyph;\n  vec3 col = vec3(0.01, 0.03, 0.02);\n  col += vec3(0.0, 0.7, 0.35) * cell * trail;\n  col += vec3(0.6, 1.0, 0.75) * cell * pow(1.0 - y, 8.0) * 1.5;\n  float packet = step(0.98, hash(colId + floor(t * 2.0)));\n  col += vec3(0.8, 1.0, 0.9) * packet * cell * 0.5;\n  float vig = smoothstep(0.95, 0.3, abs(uv.x - 0.5) * 2.0);\n  col *= 0.55 + 0.45 * vig;\n  gl_FragColor = vec4(col, 1.0);\n}",
    "traits": [
      "data",
      "stream",
      "hex",
      "terminal",
      "cascade",
      "green",
      "columns",
      "density-high"
    ],
    "lote": 1
  },
  {
    "id": "laser-aurora",
    "name": "Laser Aurora",
    "mood": "ribbon lasers · polar aurora · hot magenta edge",
    "keywords": [
      "laser",
      "aurora",
      "ribbon",
      "neon",
      "polar"
    ],
    "palette": [
      "#040610",
      "#ff2bd6",
      "#00f0ff",
      "#7a5cff",
      "#120818"
    ],
    "motion": "Layered sine ribbons sweeping like aurora sheets with laser-thin highlights.",
    "performance": "Light — stacked sine ribbons, no noise loops.",
    "fragment": "precision mediump float;\nuniform float u_time;\nuniform vec2 u_resolution;\nvarying vec2 v_uv;\nvoid main(){\n  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;\n  float t = u_time;\n  vec3 col = vec3(0.02, 0.03, 0.07);\n  for (int i = 0; i < 5; i++) {\n    float fi = float(i);\n    float y = uv.y + 0.18 * sin(uv.x * (2.5 + fi * 0.6) + t * (0.7 + fi * 0.15) + fi);\n    y += 0.08 * sin(uv.x * 5.0 - t + fi * 1.3);\n    float band = exp(-pow(y - (fi - 2.0) * 0.12, 2.0) * (40.0 + fi * 10.0));\n    vec3 c = mix(vec3(0.0, 0.9, 1.0), vec3(1.0, 0.15, 0.8), fi / 4.0);\n    c = mix(c, vec3(0.5, 0.3, 1.0), 0.35);\n    col += c * band * (0.45 - fi * 0.05);\n    col += c * exp(-abs(y - (fi - 2.0) * 0.12) * 120.0) * 0.35;\n  }\n  col += vec3(0.15, 0.05, 0.25) * exp(-length(uv + vec2(0.0, 0.2)) * 1.2);\n  float stars = step(0.998, fract(sin(dot(floor(uv * 80.0), vec2(12.1, 78.2))) * 43758.5));\n  col += vec3(0.8, 0.9, 1.0) * stars;\n  col *= smoothstep(1.4, 0.25, length(uv));\n  gl_FragColor = vec4(col, 1.0);\n}",
    "traits": [
      "laser",
      "aurora",
      "ribbon",
      "neon",
      "polar",
      "magenta",
      "cyan",
      "soft"
    ],
    "lote": 1
  }
];
