(function () {
  "use strict";

  var VERT = [
    "attribute vec2 a_pos;",
    "varying vec2 v_uv;",
    "void main(){",
    "  v_uv = a_pos * 0.5 + 0.5;",
    "  gl_Position = vec4(a_pos, 0.0, 1.0);",
    "}"
  ].join("\n");

  var shaders = (window.SHADER_LOTE_1 || []).concat(window.SHADER_LOTE_2 || []);
  var canvas = document.getElementById("gl");
  var fallback = document.getElementById("fallback");
  var chrome = document.getElementById("chrome");
  var nameEl = document.getElementById("shaderName");
  var moodEl = document.getElementById("shaderMood");
  var counterEl = document.getElementById("counter");
  var dotsEl = document.getElementById("dots");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var exportBtn = document.getElementById("exportBtn");
  var exportPanel = document.getElementById("exportPanel");
  var exportBody = document.getElementById("exportBody");
  var closeExport = document.getElementById("closeExport");
  var copyExport = document.getElementById("copyExport");
  var copyStatus = document.getElementById("copyStatus");

  var gl = null;
  var programs = [];
  var buffer = null;
  var index = 0;
  var startTime = performance.now();
  var raf = 0;
  var running = true;
  var dprCap = 2;

  function showFallback() {
    if (fallback) fallback.hidden = false;
    if (chrome) chrome.style.display = "none";
    if (canvas) canvas.style.display = "none";
  }

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function linkProgram(fragSrc) {
    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return null;
    var p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(p));
      gl.deleteProgram(p);
      return null;
    }
    return {
      program: p,
      aPos: gl.getAttribLocation(p, "a_pos"),
      uTime: gl.getUniformLocation(p, "u_time"),
      uRes: gl.getUniformLocation(p, "u_resolution")
    };
  }

  function detectWeakDevice() {
    var cores = navigator.hardwareConcurrency || 4;
    var mem = navigator.deviceMemory || 4;
    var touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (mem <= 2 || cores <= 2) return true;
    if (touch && cores <= 4 && mem <= 4) return true;
    return false;
  }

  function initGL() {
    var opts = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: "high-performance" };
    gl = canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts);
    if (!gl) {
      showFallback();
      return false;
    }
    if (detectWeakDevice()) dprCap = 1.25;

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    programs = [];
    for (var i = 0; i < shaders.length; i++) {
      var prog = linkProgram(shaders[i].fragment);
      if (!prog) {
        console.error("Failed shader:", shaders[i].id);
        programs.push(null);
      } else {
        programs.push(prog);
      }
    }
    if (!programs.some(function (p) { return p; })) {
      showFallback();
      return false;
    }
    return true;
  }

  function resize() {
    if (!gl) return;
    var dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    var w = Math.floor(window.innerWidth * dpr);
    var h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function draw(now) {
    if (!running) return;
    raf = requestAnimationFrame(draw);
    resize();
    var prog = programs[index];
    if (!prog) return;
    var t = (now - startTime) * 0.001;
    gl.useProgram(prog.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(prog.aPos);
    gl.vertexAttribPointer(prog.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1f(prog.uTime, t);
    gl.uniform2f(prog.uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function updateUI() {
    var s = shaders[index];
    if (!s) return;
    nameEl.textContent = s.name;
    moodEl.textContent = s.mood;
    counterEl.textContent = pad(index + 1) + " / " + pad(shaders.length);
    var dots = dotsEl.querySelectorAll(".dot");
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle("active", i === index);
      dots[i].setAttribute("aria-selected", i === index ? "true" : "false");
    }
  }

  function buildDots() {
    dotsEl.innerHTML = "";
    for (var i = 0; i < shaders.length; i++) {
      (function (i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "dot" + (i === index ? " active" : "");
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", "Shader " + (i + 1) + ": " + shaders[i].name);
        b.addEventListener("click", function () { goTo(i); });
        dotsEl.appendChild(b);
      })(i);
    }
  }

  function goTo(i) {
    if (!shaders.length) return;
    index = (i + shaders.length) % shaders.length;
    updateUI();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function buildExportText(s) {
    var htmlSnippet = [
      "<!DOCTYPE html>",
      "<html lang=\"en\">",
      "<head>",
      "  <meta charset=\"utf-8\" />",
      "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />",
      "  <title>" + s.name + " — Ignara shader</title>",
      "  <style>html,body{margin:0;height:100%;background:#000;overflow:hidden}canvas{display:block;width:100%;height:100%}</style>",
      "</head>",
      "<body>",
      "<canvas id=\"c\"></canvas>",
      "<script>",
      "(function () {",
      "  var VERT = " + JSON.stringify(VERT) + ";",
      "  var FRAG = " + JSON.stringify(s.fragment) + ";",
      "  var c = document.getElementById('c');",
      "  var gl = c.getContext('webgl') || c.getContext('experimental-webgl');",
      "  if (!gl) { document.body.textContent = 'WebGL unavailable'; return; }",
      "  function compile(type, src) {",
      "    var sh = gl.createShader(type);",
      "    gl.shaderSource(sh, src);",
      "    gl.compileShader(sh);",
      "    return sh;",
      "  }",
      "  var prog = gl.createProgram();",
      "  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));",
      "  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));",
      "  gl.linkProgram(prog);",
      "  gl.useProgram(prog);",
      "  var buf = gl.createBuffer();",
      "  gl.bindBuffer(gl.ARRAY_BUFFER, buf);",
      "  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);",
      "  var a = gl.getAttribLocation(prog, 'a_pos');",
      "  gl.enableVertexAttribArray(a);",
      "  gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);",
      "  var uT = gl.getUniformLocation(prog, 'u_time');",
      "  var uR = gl.getUniformLocation(prog, 'u_resolution');",
      "  var t0 = performance.now();",
      "  function frame(now) {",
      "    var dpr = Math.min(window.devicePixelRatio || 1, 2);",
      "    var w = Math.floor(c.clientWidth * dpr);",
      "    var h = Math.floor(c.clientHeight * dpr);",
      "    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; gl.viewport(0, 0, w, h); }",
      "    gl.uniform1f(uT, (now - t0) * 0.001);",
      "    gl.uniform2f(uR, w, h);",
      "    gl.drawArrays(gl.TRIANGLES, 0, 6);",
      "    requestAnimationFrame(frame);",
      "  }",
      "  requestAnimationFrame(frame);",
      "})();",
      "</" + "script>",
      "</body>",
      "</html>"
    ].join("\n");

    return [
      "=== IGNARA UNIVERSE · SHADER EXPORT ===",
      "Name: " + s.name,
      "ID: " + s.id,
      "Lote: " + (s.lote || 1),
      "",
      "Mood / keywords:",
      "  " + s.mood,
      "  " + s.keywords.join(", "),
      "",
      "Traits:",
      "  " + (s.traits && s.traits.length ? s.traits.join(", ") : s.keywords.join(", ")),
      "",
      "Color palette:",
      "  " + s.palette.join(" · "),
      "",
      "Motion notes:",
      "  " + s.motion,
      "",
      "Performance notes:",
      "  " + s.performance,
      "  WebGL1 / GLSL ES 1.00 · precision mediump float",
      "  Uniforms: u_time (float seconds), u_resolution (vec2 pixels)",
      "  Varying: v_uv (from fullscreen quad)",
      "",
      "--- VERTEX SHADER ---",
      VERT,
      "",
      "--- FRAGMENT SHADER ---",
      s.fragment,
      "",
      "--- SELF-CONTAINED HTML SNIPPET ---",
      htmlSnippet,
      "",
      "=== END EXPORT ==="
    ].join("\n");
  }

  function openExport() {
    var s = shaders[index];
    if (!s) return;
    exportBody.textContent = buildExportText(s);
    copyStatus.textContent = "";
    exportPanel.hidden = false;
  }

  function closeExportPanel() {
    exportPanel.hidden = true;
  }

  function copyToClipboard() {
    var text = exportBody.textContent;
    function ok() {
      copyStatus.textContent = "Copied";
      setTimeout(function () { copyStatus.textContent = ""; }, 1800);
    }
    function fail() {
      copyStatus.textContent = "Select text and copy manually";
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok).catch(fail);
    } else {
      try {
        var range = document.createRange();
        range.selectNodeContents(exportBody);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand("copy");
        ok();
      } catch (e) {
        fail();
      }
    }
  }

  var touchX = 0;
  var touchY = 0;
  var touching = false;

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    if (!exportPanel.hidden) return;
    touching = true;
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }

  function onTouchMove(e) {
    if (!touching) return;
    var dx = e.touches[0].clientX - touchX;
    var dy = e.touches[0].clientY - touchY;
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
    }
  }

  function onTouchEnd(e) {
    if (!touching) return;
    touching = false;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchX;
    var dy = t.clientY - touchY;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) next();
      else prev();
    }
  }

  function onKey(e) {
    if (!exportPanel.hidden) {
      if (e.key === "Escape") closeExportPanel();
      return;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); prev(); }
    else if (e.key === "e" || e.key === "E") openExport();
  }

  function onVisibility() {
    if (document.hidden) {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else if (!running) {
      running = true;
      raf = requestAnimationFrame(draw);
    }
  }

  function boot() {
    if (!shaders.length) {
      showFallback();
      return;
    }
    if (!initGL()) return;
    buildDots();
    updateUI();
    prevBtn.addEventListener("click", prev);
    nextBtn.addEventListener("click", next);
    exportBtn.addEventListener("click", openExport);
    closeExport.addEventListener("click", closeExportPanel);
    copyExport.addEventListener("click", copyToClipboard);
    exportPanel.addEventListener("click", function (e) {
      if (e.target === exportPanel) closeExportPanel();
    });
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });
    chrome.addEventListener("touchstart", onTouchStart, { passive: true });
    chrome.addEventListener("touchmove", onTouchMove, { passive: false });
    chrome.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("resize", resize);
    resize();
    raf = requestAnimationFrame(draw);
  }

  boot();
})();
