/* ============================================================
   chispas.js — chispitas de luz que salen del sobre al abrirse.
   Dibuja en un <canvas> encima del sobre: puntos y estrellitas de
   4 puntas en champaña, marfil y rosa, que suben, titilan y se apagan.
   ============================================================ */
(function () {
  "use strict";

  var canvas, c2d, parts = [], running = false, emitUntil = 0, dpr = 1;
  var COLORS = ["255,248,231", "247,227,176", "253,226,228", "255,255,255"];

  function setup() {
    canvas = document.getElementById("sparkles");
    if (!canvas) { return false; }
    c2d = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
    return true;
  }

  function resize() {
    if (!canvas) { return; }
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
  }

  function spawn(w, h) {
    // Nacen en el centro (donde se abre el sobre) y se abren en abanico
    var ang = Math.random() * Math.PI * 2;
    var speed = 0.6 + Math.random() * 2.6;
    var big = Math.random() < 0.22;
    parts.push({
      x: w * 0.5 + (Math.random() - 0.5) * w * 0.25,
      y: h * 0.5 + (Math.random() - 0.5) * h * 0.12,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed - 1.1,          // tienden a subir
      size: big ? 6 + Math.random() * 7 : 1.4 + Math.random() * 2.6,
      star: big,
      life: 0,
      max: 70 + Math.random() * 70,
      tw: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    });
  }

  function star(x, y, r, a) {
    c2d.beginPath();
    c2d.moveTo(x, y - r);
    c2d.quadraticCurveTo(x, y, x + r, y);
    c2d.quadraticCurveTo(x, y, x, y + r);
    c2d.quadraticCurveTo(x, y, x - r, y);
    c2d.quadraticCurveTo(x, y, x, y - r);
    c2d.fill();
  }

  function frame(now) {
    var w = canvas.width / dpr, h = canvas.height / dpr;
    c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    c2d.clearRect(0, 0, w, h);

    if (now < emitUntil) { for (var n = 0; n < 8; n++) { spawn(w, h); } }

    c2d.globalCompositeOperation = "lighter";
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.life++;
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.985; p.vy = p.vy * 0.985 - 0.012;
      var k = p.life / p.max;
      if (k >= 1) { parts.splice(i, 1); continue; }
      var fade = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
      var twinkle = 0.55 + 0.45 * Math.sin(p.tw + p.life * 0.35);
      var a = Math.max(0, fade * twinkle);
      // halo
      var g = c2d.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      g.addColorStop(0, "rgba(" + p.color + "," + (a * 0.55) + ")");
      g.addColorStop(1, "rgba(" + p.color + ",0)");
      c2d.fillStyle = g;
      c2d.beginPath(); c2d.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2); c2d.fill();
      // núcleo
      c2d.fillStyle = "rgba(" + p.color + "," + a + ")";
      if (p.star) { star(p.x, p.y, p.size * (0.7 + 0.3 * twinkle), a); }
      else { c2d.beginPath(); c2d.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2); c2d.fill(); }
    }
    c2d.globalCompositeOperation = "source-over";

    if (parts.length || now < emitUntil) { requestAnimationFrame(frame); }
    else { running = false; c2d.clearRect(0, 0, w, h); }
  }

  function burst(ms) {
    if (!canvas && !setup()) { return; }
    resize();
    emitUntil = performance.now() + (ms || 1800);
    if (!running) { running = true; requestAnimationFrame(frame); }
  }

  window.SOBRE_SPARKLES = { burst: burst };
})();
