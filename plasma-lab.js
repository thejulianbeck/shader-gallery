/* Plasma Veins · Lab — live-tuning page. WebGL1 / GLSL ES 1.00, mediump. */
(function () {
  "use strict";
  var STORE_KEY = "plasmaLab.config.v1";

  // ---- Parameter definitions (defaults = original Plasma Veins look) ----
  var COLORS = [
    { k: "colA", label: "Color A (venas)", def: "#e61a8c" },
    { k: "colB", label: "Color B (capa)", def: "#590de6" },
    { k: "colH", label: "Color brillo", def: "#ff80d9" },
    { k: "colBg", label: "Color de fondo", def: "#0a0314" }
  ];
  var PARAMS = [
    { g: "Luz" },
    { k: "intensity", label: "Intensidad / brillo", min: 0.2, max: 1.6, step: 0.01, def: 1.0 },
    { k: "contrast", label: "Contraste", min: 0.4, max: 1.6, step: 0.01, def: 1.0 },
    { k: "saturation", label: "Saturación", min: 0.0, max: 1.5, step: 0.01, def: 1.0 },
    { k: "glow", label: "Glow / bloom", min: 0.0, max: 1.6, step: 0.01, def: 0.8 },
    { k: "layerB", label: "Capa color B", min: 0.0, max: 1.2, step: 0.01, def: 0.55 },
    { g: "Movimiento" },
    { k: "speed", label: "Velocidad", min: 0.0, max: 1.2, step: 0.01, def: 0.35 },
    { k: "pulseAmp", label: "Oscilación · amplitud", min: 0.0, max: 0.6, step: 0.01, def: 0.3 },
    { k: "pulseFreq", label: "Oscilación · frecuencia", min: 0.0, max: 10.0, step: 0.1, def: 4.0 },
    { g: "Forma" },
    { k: "scale", label: "Escala / densidad de venas", min: 0.6, max: 6.0, step: 0.01, def: 2.2 },
    { k: "thickness", label: "Grosor de venas", min: 0.3, max: 3.0, step: 0.01, def: 1.0 },
    { k: "warp", label: "Turbulencia / distorsión", min: 0.0, max: 2.0, step: 0.01, def: 1.0 },
    { k: "octaves", label: "Octavas de ruido", min: 1, max: 6, step: 1, def: 4 },
    { g: "Acabado" },
    { k: "grain", label: "Grano", min: 0.0, max: 0.15, step: 0.001, def: 0.0 },
    { k: "vignette", label: "Viñeta", min: 0.0, max: 1.0, step: 0.01, def: 1.0 }
  ];
  var SLIDERS = PARAMS.filter(function (p) { return p.k; });

  function defaults() {
    var o = {};
    COLORS.forEach(function (c) { o[c.k] = c.def; });
    SLIDERS.forEach(function (p) { o[p.k] = p.def; });
    return o;
  }
  var DEFAULTS = defaults();

  var PRESETS = {
    "Original": {},
    "Sutil para fondo": { intensity: 0.55, contrast: 0.75, saturation: 0.7, glow: 0.25, layerB: 0.4, speed: 0.15, pulseAmp: 0.1, pulseFreq: 2.0, scale: 1.6, thickness: 1.4, warp: 0.8, octaves: 3, grain: 0.02, vignette: 0.6, colBg: "#08030f" },
    "Profundo": { colA: "#a0156b", colB: "#3a0fb0", colH: "#d96bc0", colBg: "#050109", intensity: 0.8, contrast: 1.2, saturation: 0.9, glow: 0.5, layerB: 0.8, speed: 0.22, pulseAmp: 0.2, pulseFreq: 3.0, scale: 2.6, thickness: 0.8, warp: 1.3, octaves: 5, grain: 0.015, vignette: 1.0 },
    "Cálido": { colA: "#e8455a", colB: "#b0306a", colH: "#ffb48a", colBg: "#120508", intensity: 0.85, contrast: 0.95, saturation: 0.85, glow: 0.55, layerB: 0.5, speed: 0.25, pulseAmp: 0.18, pulseFreq: 3.0, scale: 2.0, thickness: 1.15, warp: 1.0, octaves: 4, grain: 0.02, vignette: 0.8 },
    "Niebla magenta": { intensity: 0.5, contrast: 0.6, saturation: 0.6, glow: 0.15, layerB: 0.9, speed: 0.12, pulseAmp: 0.05, pulseFreq: 1.5, scale: 1.2, thickness: 2.2, warp: 0.6, octaves: 3, grain: 0.03, vignette: 0.5 }
  };

  // Tasteful ranges for "Aleatorio suave"
  var SOFT = {
    intensity: [0.45, 0.95], contrast: [0.65, 1.05], saturation: [0.55, 1.0], glow: [0.15, 0.7],
    layerB: [0.3, 0.8], speed: [0.1, 0.35], pulseAmp: [0.05, 0.25], pulseFreq: [1.5, 4.0],
    scale: [1.3, 3.0], thickness: [0.9, 1.8], warp: [0.6, 1.3], octaves: [3, 5], grain: [0.0, 0.03], vignette: [0.5, 1.0]
  };

  // ---- Shader ----
  var VERT = "attribute vec2 a_pos;\nvarying vec2 v_uv;\nvoid main(){ v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }";
  var FRAG_BODY = [
    "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }",
    "float noise(vec2 p){",
    "  vec2 i = floor(p); vec2 f = fract(p);",
    "  float a = hash(i); float b = hash(i + vec2(1.0, 0.0));",
    "  float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));",
    "  vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;",
    "}",
    "float fbm(vec2 p){",
    "  float v = 0.0; float a = 0.5;",
    "  for (int i = 0; i < 6; i++) { if (float(i) >= u_octaves) break; v += a * noise(p); p *= 2.02; a *= 0.5; }",
    "  return v;",
    "}",
    "void main(){",
    "  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;",
    "  float t = u_time * u_speed;",
    "  vec2 p = uv * u_scale;",
    "  vec2 q = vec2(fbm(p + t), fbm(p + vec2(2.3, 1.1) - t));",
    "  vec2 r = vec2(fbm(p + 2.0 * u_warp * q + vec2(1.7, 9.2) + t * 0.6), fbm(p + 2.0 * u_warp * q + vec2(8.3, 2.8) - t * 0.4));",
    "  float f = fbm(p + 2.5 * u_warp * r);",
    "  float veins = pow(max(1.0 - abs(f * 2.0 - 1.0), 0.0), 3.5 / u_thickness);",
    "  vec3 col = u_colBg;",
    "  col += u_colA * veins * u_intensity;",
    "  col += u_colB * pow(f, 2.0) * u_layerB * u_intensity;",
    "  col += u_colH * pow(veins, 4.0) * u_glow * u_intensity;",
    "  float pulse = (1.0 - u_pulseAmp) + u_pulseAmp * sin(t * u_pulseFreq + f * 6.0);",
    "  col *= pulse;",
    "  col *= mix(1.0, smoothstep(1.35, 0.2, length(uv)), u_vignette);",
    "  float l = dot(col, vec3(0.299, 0.587, 0.114));",
    "  col = mix(vec3(l), col, u_saturation);",
    "  col = (col - 0.15) * u_contrast + 0.15;",
    "  col += (hash(gl_FragCoord.xy + fract(u_time) * 91.7) - 0.5) * u_grain;",
    "  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);",
    "}"
  ].join("\n");
  var UNIF_FLOATS = SLIDERS.map(function (p) { return p.k; });
  var UNIF_COLORS = COLORS.map(function (c) { return c.k; });
  var FRAG_LIVE = "precision mediump float;\nuniform float u_time;\nuniform vec2 u_resolution;\nvarying vec2 v_uv;\n" +
    UNIF_FLOATS.map(function (k) { return "uniform float u_" + k + ";"; }).join("\n") + "\n" +
    UNIF_COLORS.map(function (k) { return "uniform vec3 u_" + k + ";"; }).join("\n") + "\n" + FRAG_BODY;

  function hexToRgb(h) {
    var n = parseInt(h.slice(1), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  function f(x) { var s = (+x).toFixed(4).replace(/0+$/, ""); return /\.$/.test(s) ? s + "0" : (s.indexOf(".") < 0 ? s + ".0" : s); }
  function bakedFrag(cfg) {
    return "precision mediump float;\nuniform float u_time;\nuniform vec2 u_resolution;\nvarying vec2 v_uv;\n" +
      "// Plasma Veins (tuned) — valores fijados como constantes\n" +
      UNIF_FLOATS.map(function (k) { return "const float u_" + k + " = " + f(cfg[k]) + ";"; }).join("\n") + "\n" +
      UNIF_COLORS.map(function (k) { var c = hexToRgb(cfg[k]); return "const vec3 u_" + k + " = vec3(" + c.map(f).join(", ") + "); // " + cfg[k]; }).join("\n") + "\n" + FRAG_BODY;
  }

  // ---- State ----
  function sanitize(o) {
    var c = defaults();
    if (!o || typeof o !== "object") return c;
    COLORS.forEach(function (d) { if (typeof o[d.k] === "string" && /^#[0-9a-fA-F]{6}$/.test(o[d.k])) c[d.k] = o[d.k].toLowerCase(); });
    SLIDERS.forEach(function (p) { var v = parseFloat(o[p.k]); if (isFinite(v)) c[p.k] = Math.min(p.max, Math.max(p.min, v)); });
    return c;
  }
  function readHash() {
    var m = location.hash.match(/c=([^&]+)/);
    if (!m) return null;
    try { return JSON.parse(decodeURIComponent(m[1])); } catch (e) { return null; }
  }
  function readStore() { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { return null; } }
  var cfg = sanitize(readHash() || readStore() || null);
  var saveTimer = 0;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      var json = JSON.stringify(cfg);
      try { localStorage.setItem(STORE_KEY, json); } catch (e) {}
      try { history.replaceState(null, "", "#c=" + encodeURIComponent(json)); } catch (e) {}
    }, 200);
  }

  // ---- UI ----
  var controlsEl = document.getElementById("controls");
  var inputs = {};
  var colorWrap = document.createElement("div");
  colorWrap.className = "colors";
  COLORS.forEach(function (c) {
    var lab = document.createElement("label");
    var inp = document.createElement("input");
    inp.type = "color"; inp.value = cfg[c.k];
    inp.addEventListener("input", function () { cfg[c.k] = inp.value; persist(); markPreset(); });
    lab.appendChild(inp); lab.appendChild(document.createTextNode(c.label));
    colorWrap.appendChild(lab); inputs[c.k] = { inp: inp };
  });
  var cg = document.createElement("div"); cg.className = "grp"; cg.textContent = "Colores";
  controlsEl.appendChild(cg); controlsEl.appendChild(colorWrap);
  PARAMS.forEach(function (p) {
    if (p.g) { var g = document.createElement("div"); g.className = "grp"; g.textContent = p.g; controlsEl.appendChild(g); return; }
    var wrap = document.createElement("div"); wrap.className = "ctl";
    var lab = document.createElement("label");
    var name = document.createElement("span"); name.textContent = p.label;
    var out = document.createElement("output");
    lab.appendChild(name); lab.appendChild(out);
    var inp = document.createElement("input");
    inp.type = "range"; inp.min = p.min; inp.max = p.max; inp.step = p.step; inp.value = cfg[p.k];
    inp.setAttribute("aria-label", p.label);
    inp.addEventListener("input", function () { cfg[p.k] = parseFloat(inp.value); out.textContent = fmt(p, cfg[p.k]); persist(); markPreset(); });
    inp.addEventListener("dblclick", function () { cfg[p.k] = p.def; syncUI(); persist(); });
    wrap.appendChild(lab); wrap.appendChild(inp); controlsEl.appendChild(wrap);
    inputs[p.k] = { inp: inp, out: out, p: p };
  });
  function fmt(p, v) { return p.step >= 1 ? String(Math.round(v)) : (+v).toFixed(p.step < 0.01 ? 3 : 2); }
  function syncUI() {
    COLORS.forEach(function (c) { inputs[c.k].inp.value = cfg[c.k]; });
    SLIDERS.forEach(function (p) { var o = inputs[p.k]; o.inp.value = cfg[p.k]; o.out.textContent = fmt(p, cfg[p.k]); });
    markPreset();
  }
  var presetBtns = {};
  var presetsEl = document.getElementById("presets");
  Object.keys(PRESETS).forEach(function (name) {
    var b = document.createElement("button"); b.textContent = name;
    b.addEventListener("click", function () { cfg = sanitize(Object.assign(defaults(), PRESETS[name])); syncUI(); persist(); toast("Preset: " + name); });
    presetsEl.appendChild(b); presetBtns[name] = b;
  });
  function markPreset() {
    Object.keys(PRESETS).forEach(function (name) {
      var p = sanitize(Object.assign(defaults(), PRESETS[name]));
      var same = Object.keys(p).every(function (k) { return typeof p[k] === "number" ? Math.abs(p[k] - cfg[k]) < 1e-6 : p[k] === cfg[k]; });
      presetBtns[name].classList.toggle("on", same);
    });
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function hsl(h, s, l) {
    var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l);
    var fn = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); };
    return "#" + [fn(0), fn(8), fn(4)].map(function (x) { return ("0" + Math.round(x * 255).toString(16)).slice(-2); }).join("");
  }
  document.getElementById("random").addEventListener("click", function () {
    var n = {};
    Object.keys(SOFT).forEach(function (k) { var r = SOFT[k]; n[k] = k === "octaves" ? Math.round(rnd(r[0], r[1])) : rnd(r[0], r[1]); });
    var h = (300 + rnd(-50, 50) + 360) % 360; // stay near magenta/violet family
    n.colA = hsl(h, rnd(0.55, 0.85), rnd(0.4, 0.55));
    n.colB = hsl((h + rnd(-60, -20) + 360) % 360, rnd(0.5, 0.8), rnd(0.3, 0.45));
    n.colH = hsl(h, rnd(0.5, 0.9), rnd(0.65, 0.8));
    n.colBg = hsl((h + rnd(-30, 30) + 360) % 360, rnd(0.4, 0.7), rnd(0.02, 0.05));
    cfg = sanitize(n); syncUI(); persist(); toast("Aleatorio suave");
  });
  document.getElementById("reset").addEventListener("click", function () { cfg = defaults(); syncUI(); persist(); toast("Original restaurado"); });

  var panel = document.getElementById("panel");
  var toggle = document.getElementById("togglePanel");
  toggle.addEventListener("click", function () {
    var hid = panel.classList.toggle("hidden");
    toggle.textContent = hid ? "Mostrar panel" : "Ocultar panel";
    toggle.setAttribute("aria-expanded", String(!hid));
  });
  var collapse = document.getElementById("collapse");
  collapse.addEventListener("click", function () {
    var c = panel.classList.toggle("collapsed"); collapse.textContent = c ? "+" : "–";
  });
  document.addEventListener("keydown", function (e) {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName) && e.target.type !== "range") return;
    if (e.key === "h" || e.key === "H") toggle.click();
    if (e.key === "Escape") closeExport();
  });

  var toastEl = document.getElementById("toast"), toastT = 0;
  function toast(msg) { toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { toastEl.hidden = true; }, 1600); }
  function copyText(text, okMsg) {
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta);
      ta.select(); ta.setSelectionRange(0, text.length);
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); toast(ok ? okMsg : "No se pudo copiar; selecciona el texto a mano");
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { toast(okMsg); }, fallback);
    else fallback();
  }
  function cfgJSON() {
    var o = { shader: "plasma-veins", version: 1 };
    Object.keys(cfg).forEach(function (k) { o[k] = typeof cfg[k] === "number" ? +(+cfg[k]).toFixed(4) : cfg[k]; });
    return JSON.stringify(o, null, 2);
  }
  document.getElementById("copy").addEventListener("click", function () { copyText(cfgJSON(), "Configuración copiada"); });

  // ---- EXPORT ----
  function buildExport() {
    var frag = bakedFrag(cfg);
    var html = [
      "<!DOCTYPE html>", "<html lang=\"en\">", "<head>", "  <meta charset=\"utf-8\" />",
      "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />",
      "  <title>Plasma Veins (tuned) — Ignara shader</title>",
      "  <style>html,body{margin:0;height:100%;background:" + cfg.colBg + ";overflow:hidden}canvas{display:block;width:100%;height:100%}</style>",
      "</head>", "<body>", "<canvas id=\"c\"></canvas>", "<script>", "(function () {",
      "  var VERT = " + JSON.stringify(VERT) + ";",
      "  var FRAG = " + JSON.stringify(frag) + ";",
      "  var c = document.getElementById('c');",
      "  var gl = c.getContext('webgl', { antialias: false }) || c.getContext('experimental-webgl');",
      "  if (!gl) { return; } // body background color acts as fallback",
      "  function compile(type, src) { var sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);",
      "    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(sh)); } return sh; }",
      "  var prog = gl.createProgram();",
      "  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));",
      "  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));",
      "  gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;",
      "  gl.useProgram(prog);",
      "  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);",
      "  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);",
      "  var a = gl.getAttribLocation(prog, 'a_pos'); gl.enableVertexAttribArray(a);",
      "  gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);",
      "  var uT = gl.getUniformLocation(prog, 'u_time'), uR = gl.getUniformLocation(prog, 'u_resolution');",
      "  var t0 = performance.now(), raf = 0;",
      "  function frame(now) {",
      "    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);",
      "    var w = Math.floor(c.clientWidth * dpr), h = Math.floor(c.clientHeight * dpr);",
      "    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; gl.viewport(0, 0, w, h); }",
      "    gl.uniform1f(uT, ((now - t0) * 0.001) % 3600.0); gl.uniform2f(uR, w, h);",
      "    gl.drawArrays(gl.TRIANGLES, 0, 6); raf = requestAnimationFrame(frame);",
      "  }",
      "  document.addEventListener('visibilitychange', function () { if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame); });",
      "  raf = requestAnimationFrame(frame);",
      "})();", "</" + "script>", "</body>", "</html>"
    ].join("\n");
    var pal = [cfg.colBg, cfg.colA, cfg.colH, cfg.colB];
    return [
      "=== IGNARA UNIVERSE · SHADER EXPORT ===",
      "Name: Plasma Veins (tuned)", "ID: plasma-veins-tuned", "Base: plasma-veins · Lote 1", "",
      "Mood / keywords:", "  organic energy · magenta flow · living neon (afinado como fondo de sección)",
      "  plasma, veins, organic, magenta, flow", "",
      "Color palette:", "  " + pal.join(" · "), "",
      "Tuned parameters (JSON):", cfgJSON(), "",
      "Motion notes:", "  Domain-warped FBM veins; speed " + f(cfg.speed) + ", pulse amp " + f(cfg.pulseAmp) + " @ freq " + f(cfg.pulseFreq) + ".", "",
      "Performance notes:",
      "  " + cfg.octaves + " octavas × 5 fbm por pixel. Menos octavas = más liviano en móvil.",
      "  WebGL1 / GLSL ES 1.00 · precision mediump float · DPR cap 1.5 · pausa en pestaña oculta",
      "  Uniforms: u_time (float seconds), u_resolution (vec2 pixels); resto como const", "",
      "--- VERTEX SHADER ---", VERT, "",
      "--- FRAGMENT SHADER ---", frag, "",
      "--- SELF-CONTAINED HTML SNIPPET ---", html, "",
      "=== END EXPORT ==="
    ].join("\n");
  }
  var exportPanel = document.getElementById("exportPanel"), exportBody = document.getElementById("exportBody");
  document.getElementById("export").addEventListener("click", function () { exportBody.textContent = buildExport(); exportPanel.hidden = false; });
  function closeExport() { exportPanel.hidden = true; }
  document.getElementById("closeExport").addEventListener("click", closeExport);
  exportPanel.addEventListener("click", function (e) { if (e.target === exportPanel) closeExport(); });
  document.getElementById("copyExport").addEventListener("click", function () { copyText(exportBody.textContent, "EXPORT copiado"); });

  syncUI();
  window.PlasmaLab = { get config() { return cfg; }, buildExport: buildExport, bakedFrag: bakedFrag, VERT: VERT, FRAG_LIVE: FRAG_LIVE, status: "init" };

  // ---- WebGL ----
  var canvas = document.getElementById("c");
  function fail(msg) {
    canvas.style.display = "none";
    document.body.style.background = cfg.colBg;
    var fb = document.getElementById("fallback"); fb.hidden = false;
    if (msg) fb.textContent += " (" + msg + ")";
    window.PlasmaLab.status = "fallback";
  }
  var gl = null;
  try { gl = canvas.getContext("webgl", { antialias: false, alpha: false, preserveDrawingBuffer: false }) || canvas.getContext("experimental-webgl"); } catch (e) {}
  if (!gl) { fail(); return; }
  function compile(type, src) {
    var sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS) && !gl.isContextLost()) { throw new Error(gl.getShaderInfoLog(sh) || "compile error"); }
    return sh;
  }
  var prog, U = {};
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG_LIVE));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link error");
  } catch (e) { console.error(e); fail("error de shader"); return; }
  gl.useProgram(prog);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, "a_pos"); gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  ["time", "resolution"].concat(UNIF_FLOATS, UNIF_COLORS).forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
  window.PlasmaLab.status = "ok";

  var t0 = performance.now(), raf = 0, pausedAt = 0;
  function frame(now) {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = Math.max(1, Math.floor(canvas.clientWidth * dpr)), h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    gl.uniform1f(U.time, ((now - t0) * 0.001) % 3600);
    gl.uniform2f(U.resolution, w, h);
    UNIF_FLOATS.forEach(function (k) { gl.uniform1f(U[k], cfg[k]); });
    UNIF_COLORS.forEach(function (k) { var c = hexToRgb(cfg[k]); gl.uniform3f(U[k], c[0], c[1], c[2]); });
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    window.PlasmaLab.frames = (window.PlasmaLab.frames || 0) + 1;
    raf = requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { cancelAnimationFrame(raf); pausedAt = performance.now(); }
    else { if (pausedAt) t0 += performance.now() - pausedAt; raf = requestAnimationFrame(frame); }
  });
  canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); cancelAnimationFrame(raf); fail("contexto perdido, recarga la página"); });
  raf = requestAnimationFrame(frame);
})();
