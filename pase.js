/* ============================================================
   pase.js — arma los pases con config.js y maneja la apertura
   ============================================================ */
(function () {
  "use strict";

  var cfg = window.PASE_CONFIG;
  if (!cfg) { return; }

  var $ = function (id) { return document.getElementById(id); };

  // Crea un elemento con clase y texto (sin innerHTML)
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text !== undefined) { node.textContent = text; }
    return node;
  }

  function field(label, value, small) {
    var wrap = el("div", "info__item");
    wrap.appendChild(el("dt", "", label));
    var dd = el("dd", "", value);
    if (small) { dd.appendChild(el("small", "", small)); }
    wrap.appendChild(dd);
    return wrap;
  }

  function heading(text) {
    var h = el("h2", "heading");
    var parts = text.split("&");
    if (parts.length === 2) {
      h.appendChild(document.createTextNode(parts[0].trim() + " "));
      h.appendChild(el("span", "heading__amp", "&"));
      h.appendChild(document.createTextNode(" " + parts[1].trim()));
    } else {
      h.textContent = text;
    }
    return h;
  }

  // ---------- 1) Sobre ----------
  document.title = cfg.pageTitle;
  $("envStamp").src = cfg.stamp;
  $("sealImg").src = cfg.seal;
  $("sealBtn").setAttribute("aria-label", cfg.openLabel);
  $("introHint").textContent = cfg.openHint;
  $("cardNames").textContent = cfg.names.first + " & " + cfg.names.second;

  // ---------- 2) Un pase por cada vuelo ----------
  var box = $("tickets");
  cfg.legs.forEach(function (leg) {
    var t = el("article", "ticket");

    // Banda superior
    var band = el("header", "ticket__band");
    var route = el("span", "band__route");
    route.appendChild(el("span", "", cfg.bandRoute));
    var plane = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    plane.setAttribute("class", "band__plane");
    plane.setAttribute("aria-hidden", "true");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#i-plane");
    use.setAttribute("href", "#i-plane");
    plane.appendChild(use);
    route.appendChild(plane);
    route.appendChild(el("span", "", cfg.bandDate));
    band.appendChild(route);
    band.appendChild(el("span", "band__label", cfg.bandLabel));
    t.appendChild(band);

    // Cuerpo
    var body = el("section", "ticket__body");
    body.appendChild(el("p", "eyebrow", leg.eyebrow));
    body.appendChild(heading(leg.heading));
    var dl = el("dl", "info");
    dl.appendChild(field(cfg.labels.passengers, cfg.passengers));
    dl.appendChild(field(cfg.labels.time, leg.time));
    var place = field(cfg.labels.place, leg.placeName, leg.placeAddress);
    place.classList.add("info__item--full");
    dl.appendChild(place);
    body.appendChild(dl);
    t.appendChild(body);

    // Foto (talón) + botón de mapa
    var fig = el("figure", "ticket__photo");
    var img = el("img");
    img.src = leg.photo;
    img.alt = leg.photoAlt || "";
    img.loading = "lazy";
    fig.appendChild(img);
    var map = el("a", "ticket__map", cfg.labels.map);
    map.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(leg.mapsQuery);
    map.target = "_blank";
    map.rel = "noopener";
    map.setAttribute("aria-label", cfg.labels.map + ": " + leg.placeName);
    fig.appendChild(map);
    t.appendChild(fig);

    // Muescas de la línea de corte
    t.appendChild(el("i", "notch notch--top"));
    t.appendChild(el("i", "notch notch--bottom"));

    box.appendChild(t);
  });

  // ---------- 3) Animación de apertura ----------
  var body = document.body;
  var intro = $("intro");
  var page = $("page");
  var sealBtn = $("sealBtn");
  var opened = false;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function showPass() {
    intro.classList.add("is-gone");
    page.classList.add("is-visible");
    page.setAttribute("aria-hidden", "false");
    body.classList.remove("is-locked");
    window.scrollTo(0, 0);
    setTimeout(function () { intro.style.display = "none"; }, 1000);
  }

  function open() {
    if (opened) { return; }
    opened = true;

    if (reduceMotion) { showPass(); return; }

    body.classList.add("is-opening");
    // Tiempos (ms) alineados con pase.css:
    // sello 0–600 · solapa 500–1450 · tarjeta sube 1300–2400 · cambio al pase 2500
    setTimeout(showPass, 2500);
  }

  sealBtn.addEventListener("click", open);

  // Pruebas: abrir directo el pase con #pase (útil al diseñar)
  if (location.hash === "#pase") { opened = true; showPass(); }
})();
