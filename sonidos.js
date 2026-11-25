/* ============================================================
   sonidos.js — sonido del avión (archivo) y, al terminar, la canción.
   El navegador solo deja sonar audio después de un toque: por eso
   todo arranca al tocar el sello.
   ============================================================ */
(function () {
  "use strict";

  var cfg = (window.SOBRE_CONFIG && window.SOBRE_CONFIG.sound) || {};
  var planeAudio = null, music = null;
  var muted = false, musicStarted = false, fadeTimer = null;

  function vol(v, d) { return v == null ? d : v; }

  // Se llama con el toque del sello
  function unlock() {
    if (cfg.enabled === false) { return; }
    // La canción arranca en silencio con el toque (si no, el celular la bloquea luego)
    if (cfg.music && !music) {
      music = new Audio(cfg.music);
      music.loop = true;
      music.preload = "auto";
      music.muted = true;
      safePlay(music);
    }
  }

  function safePlay(a) {
    var p = a.play();
    if (p && p.catch) { p.catch(function () {}); }
  }

  // ---------- Avión ----------
  function plane() {
    if (cfg.enabled === false || !cfg.plane) { startMusic(); return; }
    planeAudio = new Audio(cfg.plane);
    planeAudio.volume = vol(cfg.planeVolume, 0.8);
    planeAudio.muted = muted;
    planeAudio.addEventListener("ended", startMusic);   // por si el archivo termina antes
    planeAudio.addEventListener("error", startMusic);   // si falta el archivo, pasa directo a la canción
    var from = vol(cfg.planeStartAt, 0);
    if (from) {
      planeAudio.addEventListener("loadedmetadata", function () {
        try { planeAudio.currentTime = from; } catch (e) {}
      }, { once: true });
    }
    safePlay(planeAudio);
    // Si el sonido es largo, se apaga suave a los planeMaxSeconds
    var max = vol(cfg.planeMaxSeconds, 6) * 1000;
    setTimeout(function () { fadeOutPlane(); }, max);
  }

  // Fundido cruzado: el avión se aleja mientras la canción va subiendo
  function fadeOutPlane() {
    if (!planeAudio || planeAudio.paused) { startMusic(); return; }
    startMusic();                                  // la canción empieza a subir ya
    var secs = vol(cfg.crossfadeSeconds, 2.2);
    var steps = Math.round(secs * 20), step = planeAudio.volume / steps;
    var t = setInterval(function () {
      planeAudio.volume = Math.max(0, planeAudio.volume - step);
      if (planeAudio.volume <= 0.001) { clearInterval(t); planeAudio.pause(); }
    }, 50);
  }

  // ---------- Canción: entra suave cuando termina el avión ----------
  function startMusic() {
    if (musicStarted || !music) { return; }
    musicStarted = true;
    var target = vol(cfg.musicVolume, 0.7);
    try { music.currentTime = 0; } catch (e) {}
    music.volume = 0;
    music.muted = muted;
    safePlay(music);
    clearInterval(fadeTimer);
    // Subida gradual (curva suave: empieza muy bajito y crece)
    var secs = vol(cfg.musicFadeSeconds, 3.5), start = Date.now();
    fadeTimer = setInterval(function () {
      var k = Math.min(1, (Date.now() - start) / (secs * 1000));
      music.volume = target * k * k;
      if (k >= 1) { clearInterval(fadeTimer); }
    }, 50);
  }

  // ---------- Pausar al salir de la página (otra pestaña, app o pantalla apagada) ----------
  var pausedByHide = [];
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      pausedByHide = [planeAudio, music].filter(function (a) { return a && !a.paused; });
      pausedByHide.forEach(function (a) { a.pause(); });
    } else {
      pausedByHide.forEach(function (a) { safePlay(a); });  // retoma donde iba
      pausedByHide = [];
    }
  });
  // Al cerrar o cambiar de página (incluye volver atrás en iPhone)
  window.addEventListener("pagehide", function () {
    [planeAudio, music].forEach(function (a) { if (a) { a.pause(); } });
  });

  // ---------- Botón para silenciar ----------
  var btn = null;
  function showToggle() { if (btn) { btn.classList.add("is-visible"); } }
  function setMuted(m) {
    muted = m;
    if (planeAudio) { planeAudio.muted = m; }
    if (music && musicStarted) { music.muted = m; }
    if (btn) {
      btn.textContent = m ? "♪" : "♫";
      btn.setAttribute("aria-pressed", m ? "true" : "false");
      btn.setAttribute("aria-label", m ? "Activar sonido" : "Silenciar");
      btn.classList.toggle("is-muted", m);
    }
  }
  function init() {
    if (btn) { return; }
    btn = document.getElementById("soundToggle");
    if (!btn) { return; }
    setMuted(false);
    btn.addEventListener("click", function () { setMuted(!muted); });
  }
  if (document.readyState !== "loading") { init(); }
  else { document.addEventListener("DOMContentLoaded", init); }

  window.SOBRE_SFX = {
    unlock: unlock, plane: plane, startMusic: startMusic, showToggle: showToggle
  };
})();
