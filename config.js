/* ============================================================
   config.js — textos e imágenes del sobre.
   Para otro cliente solo cambias este archivo (y las imágenes).
   ============================================================ */
window.SOBRE_CONFIG = {
  pageTitle: "Karen & Juan · 18.12.2026",
  openHint: "Toca el sello para abrir",
  openLabel: "Abrir invitación",

  // Sonido: avión al abrir el sobre y, cuando termina, la canción
  sound: {
    enabled: true,
    // Sonido de avión: "Airplane fly by" de Pixabay (Pixabay Content License, gratis)
    plane: "audio/freesound_community-airplane-fly-by-26222.mp3",
    planeVolume: 0.8,
    planeStartAt: 1.6,             // empieza aquí: el rugido (seg. 4,5) cae justo en el corazón
    planeMaxSeconds: 4.2,          // aquí empieza el fundido cruzado avión → canción
    crossfadeSeconds: 2.4,         // cuánto tarda el avión en desvanecerse
    musicFadeSeconds: 3.5,         // cuánto tarda la canción en llegar a su volumen
    music: "audio/cancionkj.mp3",  // canción de la invitación
    musicVolume: 0.7
  },


  images: {
    closed: "assets/closed.webp",   // sobre cerrado (se parte en dos al abrir)
    seal: "assets/seal.webp"
  },

  // Mapa y vuelo (coordenadas del mapa: 1536 x 1024)
  map: {
    image: "assets/mapa.webp",
    background: "#ebd4d2",          // color del fondo del mapa
    viewDesktop: "0 0 1536 1024",   // mapa completo
    viewMobile: "148 0 520 1024",   // recorte centrado en Colombia
    // Sale desde abajo, da la vuelta en corazón y aterriza en Colombia
    flightPath: "M560 1110 C600 900 560 640 470 540 C430 500 380 470 382 430 C384 385 440 372 470 410 C500 372 556 385 558 430 C560 470 510 500 470 540 C445 570 428 584 415 596",
    landing: [415, 596],
    coords: "4°42′N · 74°04′W",                 // Bogotá
    title: "¡Coordenadas confirmadas!",
    subtitle: "Aquí está tu pase de abordar",
    color: "#6e4f49"
  },

  // Pase de abordar (zona 1: banda · zona 2: cuerpo · zona 3: talón)
  pass: {
    band: "K&J Airlines · Vuelo KJ1812",
    rotateHint: "Gira tu celular para ver tu pase",
    title: "Boarding pass",
    fields: [
      { label: "Pasajeros", value: "Familia y amigos" },
      { label: "Fecha", value: "18 dic 2026" },
      { label: "Destino", value: "Bogotá" }
    ],
    mapsLabel: "Cómo llegar",
    legs: [
      {
        label: "Escala 1 · Ceremonia",
        time: "4:00 PM",
        place: "Parroquia San Juan Eudes",
        address: "Tv. 73A #81C-05, Engativá",
        mapsQuery: "Parroquia San Juan Eudes Minuto de Dios, Tv. 73A #81C-05, Bogotá"
      },
      {
        label: "Escala 2 · Recepción",
        time: "7:00 PM",
        place: "Salón Comunal Tisquesusa",
        address: "Dg. 82B #79-10, Engativá",
        mapsQuery: "Salón Comunal Barrio Tisquesusa, Dg. 82B #79-10, Bogotá"
      }
    ],
    names: ["Karen", "Juan"],
    seal: "assets/sello-pase.svg",      // sello de la portada en malva
    illustration: "assets/ilustracion.webp",
    illustrationAlt: "Ilustración de Karen y Juan abrazados entre palmeras"
  }
};
