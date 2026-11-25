/* ============================================================
   sobre.js — carga las imágenes desde config.js y corre la animación:
   sello → el sobre se desliza hacia arriba y deja ver el mapa
   → el avión sale desde abajo, hace un corazón y aterriza en Colombia
   → pase de abordar
   ============================================================ */
(function () {
  "use strict";

  var cfg = window.SOBRE_CONFIG;
  if (!cfg) { return; }

  var $ = function (id) { return document.getElementById(id); };
  var body = document.body;
  var root = document.documentElement;

  // ---------- 1) Textos e imágenes ----------
  document.title = cfg.pageTitle;
  $("hint").textContent = cfg.openHint;
  $("sealBtn").setAttribute("aria-label", cfg.openLabel);

  var imgs = Array.prototype.slice.call(document.querySelectorAll("[data-img]"));
  var loads = imgs.map(function (img) {
    img.src = cfg.images[img.getAttribute("data-img")];
    return img.decode ? img.decode().catch(function () {}) : Promise.resolve();
  });
  // Mostrar el sobre cuando todas las capas estén listas (sin parpadeos)
  Promise.all(loads).then(function () { body.classList.remove("is-loading"); });

  // El sello responde aunque algo del mapa falle más abajo
  $("sealBtn").addEventListener("click", function () { open(); });

  // ---------- Pase de abordar (se arma desde config.js) ----------
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text !== undefined) { n.textContent = text; }
    return n;
  }
  (function buildPass() {
    var p = cfg.pass;
    if (!p || !$("pass")) { return; }
    $("passBand").textContent = p.band;
    if ($("rotateText")) { $("rotateText").textContent = p.rotateHint; }
    $("passTitle").textContent = p.title;
    if (p.seal) { $("passSeal").src = p.seal; }
    p.fields.forEach(function (f) {
      var d = el("div", "pass__field");
      d.appendChild(el("dt", "", f.label));
      d.appendChild(el("dd", "", f.value));
      $("passFields").appendChild(d);
    });
    p.legs.forEach(function (leg) {
      var d = el("div", "pass__leg");
      d.appendChild(el("p", "pass__label", leg.label));
      d.appendChild(el("p", "pass__time", leg.time));
      d.appendChild(el("p", "pass__place", leg.place));
      d.appendChild(el("p", "pass__address", leg.address));
      var a = el("a", "pass__btn", p.mapsLabel);
      a.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(leg.mapsQuery);
      a.target = "_blank";
      a.rel = "noopener";
      a.setAttribute("aria-label", p.mapsLabel + ": " + leg.place);
      d.appendChild(a);
      $("passLegs").appendChild(d);
    });
    var stub = $("passStub");
    stub.style.backgroundImage = 'url("' + p.illustration + '")';
    stub.setAttribute("role", "img");
    stub.setAttribute("aria-label", p.illustrationAlt);
    var names = $("passNames");
    names.appendChild(document.createTextNode(p.names[0]));
    names.appendChild(el("span", "pass__amp", "&"));
    names.appendChild(document.createTextNode(p.names[1]));
    var pre = new Image(); pre.src = p.illustration;  // precargar
  })();

  // ---------- 2) Mapa ----------
  var map = cfg.map;
  var svg = $("mapSvg");
  var mapReady = !!(svg && $("trail") && $("plane") && $("coords") && $("reveal"));
  if (!mapReady && window.console) { console.warn("Falta parte del mapa en index.html: se salta el vuelo."); }
  var trail, reveal, plane, total, coords, land, planeSize = 1;

  // Prepara el mapa; si algo falla, el sobre igual abre y se salta el vuelo
  function setupMap() {
    $("mapImg").setAttribute("href", map.image);
    root.style.setProperty("--map-bg", map.background);
    root.style.setProperty("--fly", map.color);
    var pre = new Image(); pre.src = map.image;  // precargar el mapa

    fitMap();
    window.addEventListener("resize", fitMap);

    trail = $("trail"); reveal = $("trailReveal"); plane = $("plane");
    trail.setAttribute("d", map.flightPath);
    reveal.setAttribute("d", map.flightPath);
    total = trail.getTotalLength();
    reveal.style.strokeDasharray = total + " " + total;
    reveal.style.strokeDashoffset = total;

    coords = $("coords");
    placeCoords();
    $("revealTitle").textContent = map.title;
    $("revealSub").textContent = map.subtitle;

    land = $("landing");
    land.setAttribute("transform", "translate(" + map.landing[0] + " " + map.landing[1] + ")");
    placePlane(0, 1);
  }

  // Escritorio: mapa completo. Celular (vertical): recorte centrado en Colombia
  function fitMap() {
    var portrait = window.innerWidth < 700 || window.innerWidth / window.innerHeight < 0.9;
    planeSize = portrait ? 1 : 1.5;  // en el mapa completo el avión se ve más pequeño
    svg.setAttribute("viewBox", portrait ? map.viewMobile : map.viewDesktop);
    svg.setAttribute("preserveAspectRatio", portrait ? "xMidYMid slice" : "xMidYMid meet");
    placeCoords(portrait);
  }

  // Coordenadas: a la izquierda del punto, sobre el océano
  function placeCoords(portrait) {
    if (!coords) { return; }
    if (portrait === undefined) {
      portrait = window.innerWidth < 700 || window.innerWidth / window.innerHeight < 0.9;
    }
    coords.setAttribute("x", map.landing[0] - 16);   // a la izquierda, sobre el océano
    coords.setAttribute("y", map.landing[1] + 6);
    coords.setAttribute("text-anchor", "end");
  }

  // Escribe las coordenadas letra por letra, como una pantalla de aeropuerto
  function typeCoords(done) {
    var text = map.coords, i = 0;
    (function next() {
      coords.textContent = text.slice(0, ++i);
      if (i < text.length) { setTimeout(next, 45); } else if (done) { done(); }
    })();
  }

  // Arranca con impulso y frena suave al aterrizar
  function ease(t) {
    var sine = -(Math.cos(Math.PI * t) - 1) / 2;
    var out = 1 - Math.pow(1 - t, 2);
    return 0.45 * out + 0.55 * sine;
  }

  function placePlane(dist, scale) {
    var p = trail.getPointAtLength(dist);
    var q = trail.getPointAtLength(Math.min(dist + 2, total));
    var r = trail.getPointAtLength(Math.max(dist - 2, 0));
    var ang = Math.atan2(q.y - r.y, q.x - r.x) * 180 / Math.PI + 90;
    plane.setAttribute("transform",
      "translate(" + p.x + " " + p.y + ") rotate(" + ang + ") scale(" + scale * planeSize + ")");
  }

  function fly(duration, done) {
    var start = null;
    body.classList.add("is-flying");
    function frame(now) {
      if (start === null) { start = now; }
      var t = Math.min((now - start) / duration, 1);
      var d = ease(t) * total;
      reveal.style.strokeDashoffset = total - d;
      // Al final "aterriza": se achica un poco
      var scale = t > 0.85 ? 1 - (t - 0.85) / 0.15 * 0.4 : 1;
      placePlane(d, scale);
      if (t < 1) { requestAnimationFrame(frame); }
      else { done(); }
    }
    requestAnimationFrame(frame);
  }

  if (mapReady) {
    try { setupMap(); }
    catch (e) { mapReady = false; if (window.console) { console.warn("Error en el mapa:", e); } }
  }

  // ---------- 3) Secuencia ----------
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var started = false;

  function at(ms, fn) { setTimeout(fn, ms); }

  var sfx = window.SOBRE_SFX || null;
  function sound(name) {
    if (!sfx || !sfx[name]) { return; }
    try { sfx[name].apply(null, Array.prototype.slice.call(arguments, 1)); } catch (e) {}
  }

  function finish() {
    sound("startMusic");
    body.classList.add("is-done");
    $("next").setAttribute("aria-hidden", "false");
    body.classList.remove("is-locked");
  }

  function landed() {
    land.classList.add("is-on");        // puntito que late en Colombia
    plane.classList.add("is-landed");   // el avión se desvanece
    at(300, typeCoords);                                            // coordenadas
    at(900, function () { $("reveal").classList.add("is-on"); });   // título + subtítulo
    at(3400, finish);                                               // tiempo para leer
  }

  function open() {
    if (started) { return; }
    started = true;

    // Sonido: el toque del sello "despierta" el audio y arranca el avión
    sound("unlock");
    sound("showToggle");
    sound("plane");

    if (reduceMotion) { finish(); return; }

    // Tiempos en milisegundos (alineados con sobre.css)
    body.classList.add("is-sliding");                             // el sobre sube
    if (!mapReady) { at(1600, finish); return; }
    body.classList.add("is-map");                                 // el mapa ya está debajo
    at(1300, function () { fly(3200, landed); });                 // el avión despega cuando el sobre termina de abrir
  }

  // Pruebas: #mapa salta directo al vuelo
  // Pruebas: #pase muestra directo el pase de abordar
  if (location.hash === "#pase") {
    started = true;
    if (mapReady) {  // muestra el mapa con el vuelo ya terminado, como queda de fondo
      body.classList.add("is-map");
      reveal.style.strokeDashoffset = 0;
      placePlane(total, 0.6);
      plane.classList.add("is-landed");
      land.classList.add("is-on");
      coords.textContent = map.coords;
    }
    finish();
  }

  if (location.hash === "#mapa" && mapReady) {
    started = true;
    body.classList.add("is-map");
    at(100, function () { fly(3200, landed); });
  }
})();
