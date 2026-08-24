function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* ============================================================================
   NEGRO DE HUMO · Tablero de inspiración
   src/app.jsx — Código fuente
   ----------------------------------------------------------------------------
   Este es el archivo legible. El navegador corre app.js, que sale de
   compilar éste:

       node compilar.js

   Si se edita app.js directamente, el próximo compilado lo pisa.
   ============================================================================ */

const {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback
} = React;

/* ============================================================================
   1 · CONEXIÓN
   ============================================================================ */

const CFG = window.CONFIG || {};

/* Supabase renombró las claves en 2025: la que antes era "anon key" ahora se
   llama "Publishable key". Se acepta el nombre viejo por si alguna instalación
   quedó con un config.js anterior. */
const CLAVE = CFG.SUPABASE_PUBLISHABLE_KEY || CFG.SUPABASE_ANON_KEY;
const CONFIGURADO = CFG.SUPABASE_URL && !CFG.SUPABASE_URL.startsWith("PEGÁ") && CLAVE && !CLAVE.startsWith("PEGÁ");
const db = CONFIGURADO ? supabase.createClient(CFG.SUPABASE_URL, CLAVE) : null;
const AVATARES = window.AVATARES || {};

/* ============================================================================
   2 · LOS NUEVE TIPOS
   ----------------------------------------------------------------------------
   Cada uno con su consigna de comentario. No hay un copy genérico: la pregunta
   cambia según lo que se está publicando, porque eso es lo que hace que el
   comentario valga la pena escribirlo.
   ============================================================================ */

const TIPOS = [{
  id: "cita",
  nombre: "Cita",
  consigna: "¿Dónde la encontraste y qué te detuvo ahí?"
}, {
  id: "palabra",
  nombre: "Palabra",
  consigna: "¿Por qué esta palabra y no otra? ¿Dónde la escuchaste?"
}, {
  id: "pregunta",
  nombre: "Pregunta",
  consigna: "¿De dónde viene esta pregunta? ¿Qué la volvió urgente?"
}, {
  id: "texto",
  nombre: "Texto",
  consigna: "¿Qué estabas pensando cuando escribiste esto?"
}, {
  id: "enlace",
  nombre: "Enlace",
  consigna: "¿Qué hay ahí que valga el clic de las demás?"
}, {
  id: "imagen",
  nombre: "Imagen",
  consigna: "¿Qué está haciendo esta imagen que no sabés nombrar todavía?"
}, {
  id: "documento",
  nombre: "Documento",
  consigna: "¿Qué es este documento y cómo llegó a tus manos?"
}, {
  id: "video",
  nombre: "Video",
  consigna: "¿Qué mirar exactamente? Si es un momento, marcá el minuto."
}, {
  id: "audio",
  nombre: "Audio",
  consigna: "¿Qué se oye acá que no se lee en ningún lado?"
}];
const TIPO = Object.fromEntries(TIPOS.map(t => [t.id, t]));
const FUENTES = [["libro", "Libro"], ["pelicula", "Película"], ["entrevista", "Entrevista"], ["prensa", "Prensa"], ["conversacion", "Conversación"], ["cancion", "Canción"], ["otro", "Otro"]];
const FUENTE = Object.fromEntries(FUENTES);
const MIN_COMENTARIO = 120;
const MAX_ETIQUETAS = 8;

/* ============================================================================
   3 · GLIFOS
   ----------------------------------------------------------------------------
   Monocromos y de trazo, nunca rellenos: el color pertenece a las etiquetas.
   ============================================================================ */

function Glifo({
  n,
  t = 20
}) {
  const p = {
    width: t,
    height: t,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };
  const d = {
    cita: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M9 7c-2.5 0-4 1.8-4 4s1.4 3.4 3.2 3.4c.4 2 1.8 2.9 1.8 2.9C8 16 9.6 13.6 10 11.6 10.4 9 10 7 9 7z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M18 7c-2.5 0-4 1.8-4 4s1.4 3.4 3.2 3.4c.4 2 1.8 2.9 1.8 2.9-2-1.3-.4-3.7 0-5.7C19.4 9 19 7 18 7z"
    })),
    palabra: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 8V6h16v2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 6v12"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 18h6"
    })),
    pregunta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M9.2 9a2.9 2.9 0 1 1 4 2.7c-.8.4-1.2 1.1-1.2 2v.6"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "18",
      r: ".7",
      fill: "currentColor"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "9"
    })),
    texto: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M5 6h14M5 10h14M5 14h10M5 18h7"
    })),
    enlace: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M10.5 13.5a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 0 0-5.7-5.7l-1.3 1.3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M13.5 10.5a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 0 0 5.7 5.7l1.3-1.3"
    })),
    imagen: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3.5",
      y: "5",
      width: "17",
      height: "14",
      rx: "1.5"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "8.6",
      cy: "10",
      r: "1.4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m4 17 4.6-4.2 3.4 3 3-2.4L20 17"
    })),
    documento: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M6.5 3.5h7L18 8v12.5H6.5z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M13.5 3.5V8H18"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9.3 12.5h5.4M9.3 16h3.6"
    })),
    video: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "5.5",
      width: "18",
      height: "13",
      rx: "1.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m10.5 9.6 4.4 2.4-4.4 2.4z"
    })),
    audio: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M5 11v2M8.5 8.5v7M12 6v12M15.5 9v6M19 11.2v1.6"
    })),
    buscar: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "6.2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m16 16 4 4"
    })),
    filtro: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 6.5h16M7 12h10M10.5 17.5h3"
    })),
    paleta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "8.5"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "9.2",
      cy: "9.6",
      r: "1.1",
      fill: "currentColor",
      stroke: "none"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "14.6",
      cy: "9.9",
      r: "1.1",
      fill: "currentColor",
      stroke: "none"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "15",
      cy: "14.6",
      r: "1.1",
      fill: "currentColor",
      stroke: "none"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "9.6",
      cy: "14.4",
      r: "1.1",
      fill: "currentColor",
      stroke: "none"
    })),
    mas: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M12 5.5v13M5.5 12h13"
    })),
    cerrar: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "m6.5 6.5 11 11M17.5 6.5l-11 11"
    })),
    barajar: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M17 4.5 20 7l-3 2.5M17 14.5 20 17l-3 2.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M4 7h3.5c1.6 0 2.6 1 3.6 2.5S13 15 14.6 15H20"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M4 17h3.5c1.4 0 2.4-.8 3.3-2M20 7h-5.4c-1 0-1.8.3-2.5 1"
    })),
    papelera: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M5 7h14M10 7V5h4v2M6.5 7l.8 12.5h9.4L17.5 7"
    })),
    salir: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M15 4.5h3.5v15H15"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M11 12H3.5M7 8l-3.5 4L7 16"
    })),
    proyectar: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "5",
      width: "18",
      height: "12",
      rx: "1.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 20h6M12 17v3"
    })),
    lapiz: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4.5 19.5h4L19 9a2.2 2.2 0 0 0-3.1-3.1L5.5 16.5z"
    })),
    volver: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M15 5.5 8.5 12l6.5 6.5"
    }))
  }[n];
  return /*#__PURE__*/React.createElement("svg", _extends({}, p, {
    "aria-hidden": "true"
  }), d);
}

/* ============================================================================
   4 · TEXTO Y MEDIDAS
   ============================================================================ */

const sinTildes = s => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/* Escala inversa de la cita.
   El texto ocupa un área proporcional a los caracteres por el cuadrado del
   cuerpo, así que la relación correcta es inversa a la raíz. Aplicada pura
   queda agresiva; el exponente .31 es el ajuste. Se devuelve en unidades de
   contenedor (cqi) para que la escala se adapte sola al ancho de la card sin
   puntos de quiebre: en el celular la card mide 170 px y en escritorio 300. */
const cuerpoCita = n => 35.7 / Math.pow(Math.max(n, 12), 0.31);
const cuerpoPalabra = n => 170 / Math.max(n, 3);
const fecha = iso => new Date(iso).toLocaleDateString("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric"
});
const fechaCorta = iso => new Date(iso).toLocaleDateString("es-CO", {
  day: "numeric",
  month: "short"
});
const mesLargo = ym => new Date(ym + "T12:00:00").toLocaleDateString("es-CO", {
  month: "short",
  year: "2-digit"
});
const reloj = s => {
  const m = Math.floor(s / 60),
    r = s % 60;
  return m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
};
const dominio = u => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};

/* ============================================================================
   5 · MEDIOS
   ----------------------------------------------------------------------------
   Nunca se guarda código embed. Se reconoce la plataforma, se extrae el
   identificador, y la app arma la URL del reproductor. Guardar HTML de
   terceros y renderizarlo sería el agujero más grande de toda la aplicación.
   ============================================================================ */

function leerMedio(url) {
  const u = (url || "").trim();
  let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (m) {
    const t = u.match(/[?&#](?:t|start)=(\d+)/);
    return {
      tipo: "video",
      plataforma: "youtube",
      id: m[1],
      segundo: t ? +t[1] : null
    };
  }
  m = u.match(/vimeo\.com\/(?:video\/|channels\/[\w]+\/)?(\d{6,12})/);
  if (m) {
    const t = u.match(/[#?&]t=(\d+)/);
    return {
      tipo: "video",
      plataforma: "vimeo",
      id: m[1],
      segundo: t ? +t[1] : null
    };
  }
  m = u.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(episode|track|show|album)\/([A-Za-z0-9]{22})/);
  if (m) return {
    tipo: "audio",
    plataforma: "spotify",
    medio: m[1],
    id: m[2]
  };
  return null;
}
const miniatura = d => d.plataforma === "youtube" ? `https://i.ytimg.com/vi/${d.video_id}/hqdefault.jpg` : null;
function urlIncrustada(c) {
  const d = c.datos;
  if (c.tipo === "video" && d.plataforma === "youtube") return `https://www.youtube-nocookie.com/embed/${d.video_id}?rel=0${d.segundo_inicio ? "&start=" + d.segundo_inicio : ""}`;
  if (c.tipo === "video" && d.plataforma === "vimeo") return `https://player.vimeo.com/video/${d.video_id}${d.segundo_inicio ? "#t=" + d.segundo_inicio + "s" : ""}`;
  if (c.tipo === "audio") return `https://open.spotify.com/embed/${d.tipo_medio}/${d.medio_id}`;
  return null;
}

/* Comprimir antes de subir: una foto de celular pesa entre 3 y 8 MB y subirla
   así es lento, gasta la cuota y no aporta nada visible. */
async function comprimir(archivo, maxLado = 1600, calidad = 0.82) {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(bitmap.width * escala);
  lienzo.height = Math.round(bitmap.height * escala);
  lienzo.getContext("2d").drawImage(bitmap, 0, 0, lienzo.width, lienzo.height);
  const blob = await new Promise(r => lienzo.toBlob(r, "image/jpeg", calidad));
  return {
    blob,
    ancho: lienzo.width,
    alto: lienzo.height
  };
}

/* ============================================================================
   6 · DATOS
   ============================================================================ */

function useTablero() {
  const [sesion, setSesion] = useState(null);
  const [perfiles, setPerfiles] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [contenidos, setContenidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [fallo, setFallo] = useState(null);
  const cargar = useCallback(async () => {
    if (!db) {
      setCargando(false);
      return;
    }
    try {
      const [p, e, c] = await Promise.all([db.from("perfiles").select("*").order("orden"), db.from("vista_etiquetas_uso").select("*").order("nombre"), db.from("contenidos").select("*, contenido_etiquetas(etiqueta_id), ecos(perfil_id)").order("creado_en", {
        ascending: false
      })]);
      if (p.error) throw p.error;
      if (e.error) throw e.error;
      if (c.error) throw c.error;
      setPerfiles(p.data || []);
      setEtiquetas(e.data || []);
      setContenidos((c.data || []).map(x => ({
        ...x,
        etiquetaIds: (x.contenido_etiquetas || []).map(r => r.etiqueta_id),
        ecoIds: (x.ecos || []).map(r => r.perfil_id)
      })));
      setFallo(null);
    } catch (err) {
      setFallo(err.message || "No se pudo cargar el tablero.");
    } finally {
      setCargando(false);
    }
  }, []);
  useEffect(() => {
    if (!db) {
      setCargando(false);
      return;
    }
    db.auth.getSession().then(({
      data
    }) => setSesion(data.session));
    const {
      data: sub
    } = db.auth.onAuthStateChange((_e, s) => setSesion(s));
    cargar();
    return () => sub.subscription.unsubscribe();
  }, [cargar]);

  /* Al entrar o salir se recarga: con sesión, la consulta devuelve además la
     papelera propia. */
  const uid = sesion?.user?.id || null;
  useEffect(() => {
    if (db) cargar();
  }, [uid, cargar]);
  const yo = useMemo(() => perfiles.find(p => p.id === uid) || null, [perfiles, uid]);
  const porId = useMemo(() => Object.fromEntries(perfiles.map(p => [p.id, p])), [perfiles]);
  const etiquetaPorId = useMemo(() => Object.fromEntries(etiquetas.map(e => [e.id, e])), [etiquetas]);
  return {
    sesion,
    yo,
    perfiles,
    porId,
    etiquetas,
    etiquetaPorId,
    contenidos,
    cargando,
    fallo,
    cargar,
    setContenidos
  };
}

/* ============================================================================
   7 · PIEZAS SUELTAS
   ============================================================================ */

function Avatar({
  perfil,
  grande
}) {
  if (!perfil) return null;
  const src = AVATARES[perfil.avatar_clave];
  return src ? /*#__PURE__*/React.createElement("img", {
    className: "avatar" + (grande ? " grande" : ""),
    src: src,
    alt: ""
  }) : /*#__PURE__*/React.createElement("span", {
    className: "avatar" + (grande ? " grande" : ""),
    "aria-hidden": "true"
  });
}
function Etiqueta({
  etiqueta,
  puesta,
  onClick,
  chica
}) {
  if (!etiqueta) return null;
  return /*#__PURE__*/React.createElement("button", {
    className: "etiqueta" + (puesta ? " puesta" : ""),
    style: {
      "--c": `var(--e${etiqueta.color})`
    },
    onClick: onClick,
    type: "button"
  }, etiqueta.nombre);
}
function Cargando() {
  return /*#__PURE__*/React.createElement("div", {
    className: "cargando",
    role: "status",
    "aria-label": "Cargando"
  }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null));
}
function Nota({
  texto,
  onFin
}) {
  useEffect(() => {
    if (!texto) return;
    const t = setTimeout(onFin, 3600);
    return () => clearTimeout(t);
  }, [texto, onFin]);
  if (!texto) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "brindis",
    role: "status"
  }, texto);
}

/* Una hoja modal. En escritorio se centra; en el celular sube desde abajo.
   Cierra con Escape y con clic afuera, como corresponde. */
function Hoja({
  titulo,
  onCerrar,
  children,
  pie,
  ancha
}) {
  const ref = useRef(null);
  const cerrar = useRef(onCerrar);
  cerrar.current = onCerrar;

  /* Deps vacías a propósito: si el efecto dependiera de onCerrar —que llega
     como flecha nueva en cada render— la hoja se robaría el foco cada vez que
     se teclea una letra. */
  useEffect(() => {
    const esc = e => {
      if (e.key === "Escape") cerrar.current();
    };
    document.addEventListener("keydown", esc);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = antes;
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "velo",
    onMouseDown: e => {
      if (e.target === e.currentTarget) onCerrar();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hoja" + (ancha ? " ancha" : ""),
    role: "dialog",
    "aria-modal": "true",
    "aria-label": titulo,
    tabIndex: -1,
    ref: ref
  }, /*#__PURE__*/React.createElement("div", {
    className: "agarradera"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hoja-enc"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "hoja-titulo"
  }, titulo), /*#__PURE__*/React.createElement("button", {
    className: "boton fantasma",
    onClick: onCerrar,
    "aria-label": "Cerrar"
  }, /*#__PURE__*/React.createElement(Glifo, {
    n: "cerrar",
    t: 18
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hoja-cuerpo"
  }, children), pie && /*#__PURE__*/React.createElement("div", {
    className: "hoja-pie"
  }, pie)));
}

/* ============================================================================
   8 · LAS CARDS
   ----------------------------------------------------------------------------
   Nueve formas. La silueta se reconoce de reojo; el color no, porque la paleta
   de tiza es estrecha por diseño y ese rango le pertenece a las etiquetas.
   ============================================================================ */

function Cuerpo({
  c
}) {
  const d = c.datos || {};
  switch (c.tipo) {
    case "cita":
      {
        const n = (d.texto || "").length;
        return /*#__PURE__*/React.createElement("div", {
          className: "cuerpo",
          style: {
            "--cuerpo": cuerpoCita(n)
          }
        }, /*#__PURE__*/React.createElement("span", {
          className: "comilla",
          "aria-hidden": "true"
        }, "\u201C"), /*#__PURE__*/React.createElement("p", {
          className: "texto"
        }, d.texto), /*#__PURE__*/React.createElement("p", {
          className: "fuente"
        }, d.autor, d.titulo && /*#__PURE__*/React.createElement(React.Fragment, null, ", ", /*#__PURE__*/React.createElement("span", {
          className: "obra"
        }, d.titulo)), d.editorial && /*#__PURE__*/React.createElement(React.Fragment, null, ". ", d.editorial), d.anio && /*#__PURE__*/React.createElement(React.Fragment, null, " (", d.anio, ")"), d.pagina && /*#__PURE__*/React.createElement(React.Fragment, null, ", p.\xA0", d.pagina)));
      }
    case "palabra":
      return /*#__PURE__*/React.createElement("div", {
        className: "cuerpo",
        style: {
          "--cuerpo": cuerpoPalabra((d.texto || "").length)
        }
      }, /*#__PURE__*/React.createElement("p", {
        className: "texto"
      }, d.texto));
    case "pregunta":
      return /*#__PURE__*/React.createElement("div", {
        className: "cuerpo"
      }, /*#__PURE__*/React.createElement("p", {
        className: "texto"
      }, d.texto));
    case "texto":
      return /*#__PURE__*/React.createElement("div", {
        className: "cuerpo"
      }, d.titulo && /*#__PURE__*/React.createElement("p", {
        className: "titulillo"
      }, d.titulo), /*#__PURE__*/React.createElement("p", {
        className: "texto"
      }, d.texto));
    case "enlace":
      return /*#__PURE__*/React.createElement("div", {
        className: "cuerpo"
      }, /*#__PURE__*/React.createElement("p", {
        className: "dominio"
      }, /*#__PURE__*/React.createElement(Glifo, {
        n: "enlace",
        t: 13
      }), dominio(d.url)), /*#__PURE__*/React.createElement("p", {
        className: "texto"
      }, d.titulo || d.url));
    case "imagen":
    case "documento":
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "medio"
      }, /*#__PURE__*/React.createElement("img", {
        src: d.url,
        alt: d.alt || d.credito || "",
        loading: "lazy",
        width: d.ancho || undefined,
        height: d.alto || undefined
      })), /*#__PURE__*/React.createElement("div", {
        className: "cuerpo",
        style: {
          paddingTop: 13
        }
      }, /*#__PURE__*/React.createElement("p", {
        className: "fuente"
      }, d.credito, d.procedencia && /*#__PURE__*/React.createElement(React.Fragment, null, " \xB7 ", d.procedencia))));
    case "video":
      {
        const mini = miniatura(d);
        return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
          className: "medio"
        }, mini ? /*#__PURE__*/React.createElement("img", {
          src: mini,
          alt: "",
          loading: "lazy"
        }) : /*#__PURE__*/React.createElement("div", {
          style: {
            width: "100%",
            height: "100%",
            background: "var(--fondo-hondo)"
          }
        }), /*#__PURE__*/React.createElement("span", {
          className: "play"
        }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Glifo, {
          n: "video",
          t: 19
        }))), d.segundo_inicio != null && /*#__PURE__*/React.createElement("span", {
          className: "marca-tiempo"
        }, "desde ", reloj(d.segundo_inicio))), /*#__PURE__*/React.createElement("div", {
          className: "cuerpo",
          style: {
            paddingTop: 13
          }
        }, /*#__PURE__*/React.createElement("p", {
          className: "dominio",
          style: {
            marginBottom: d.titulo ? 6 : 0
          }
        }, d.plataforma === "youtube" ? "YouTube" : "Vimeo"), d.titulo && /*#__PURE__*/React.createElement("p", {
          className: "texto",
          style: {
            fontFamily: "var(--serif)",
            fontSize: 16,
            margin: 0
          }
        }, d.titulo)));
      }
    case "audio":
      {
        /* La onda no es un análisis del audio: es un trazo. Se genera del
           identificador, así que cada episodio tiene siempre la misma. */
        const semilla = (d.medio_id || "").split("").reduce((a, ch) => a + ch.charCodeAt(0), 0);
        const barras = Array.from({
          length: 34
        }, (_, i) => 22 + Math.abs(Math.sin((i + 1) * (semilla % 17 + 3) * 0.55)) * 78);
        return /*#__PURE__*/React.createElement("div", {
          className: "t-audio"
        }, /*#__PURE__*/React.createElement("div", {
          className: "onda",
          "aria-hidden": "true"
        }, barras.map((h, i) => /*#__PURE__*/React.createElement("i", {
          key: i,
          style: {
            height: h + "%"
          }
        }))), /*#__PURE__*/React.createElement("div", {
          className: "cuerpo",
          style: {
            paddingTop: 13
          }
        }, /*#__PURE__*/React.createElement("p", {
          className: "dominio"
        }, "Spotify \xB7 ", d.tipo_medio === "episode" ? "Episodio" : d.tipo_medio === "track" ? "Canción" : d.tipo_medio === "show" ? "Programa" : "Álbum"), d.titulo && /*#__PURE__*/React.createElement("p", {
          className: "texto",
          style: {
            fontFamily: "var(--serif)",
            fontSize: 16,
            margin: "6px 0 0"
          }
        }, d.titulo)));
      }
    default:
      return null;
  }
}
function Card({
  c,
  autor,
  etiquetas,
  onAbrir,
  onEtiqueta,
  onEco,
  puedeEco,
  tengoEco,
  indice
}) {
  return /*#__PURE__*/React.createElement("article", {
    className: "card t-" + c.tipo + (c.eliminado ? " borrada" : "") + (c.destacado ? " destacada" : ""),
    style: {
      animationDelay: Math.min(indice, 14) * 22 + "ms"
    }
  }, c.eliminado && /*#__PURE__*/React.createElement("span", {
    className: "papelera-marca"
  }, "En papelera"), /*#__PURE__*/React.createElement("div", {
    onClick: onAbrir,
    style: {
      cursor: "pointer"
    },
    role: "button",
    tabIndex: 0,
    onKeyDown: e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onAbrir();
      }
    }
  }, /*#__PURE__*/React.createElement(Cuerpo, {
    c: c
  }), /*#__PURE__*/React.createElement("div", {
    className: "cuerpo",
    style: {
      paddingTop: 0,
      paddingBottom: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "comentario"
  }, c.comentario))), etiquetas.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "etiquetas",
    style: {
      paddingTop: 13
    }
  }, etiquetas.map(e => /*#__PURE__*/React.createElement(Etiqueta, {
    key: e.id,
    etiqueta: e,
    onClick: () => onEtiqueta(e.id)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "pie"
  }, /*#__PURE__*/React.createElement(Avatar, {
    perfil: autor
  }), /*#__PURE__*/React.createElement("span", {
    className: "quien"
  }, autor?.nombre, " \xB7 ", fechaCorta(c.creado_en)), /*#__PURE__*/React.createElement("button", {
    className: "eco" + (tengoEco ? " mio" : ""),
    onClick: onEco,
    disabled: !puedeEco,
    title: puedeEco ? "Esto me resuena" : "El eco es para el contenido de las demás"
  }, /*#__PURE__*/React.createElement("span", {
    className: "anillos"
  }), c.ecoIds.length > 0 && c.ecoIds.length)));
}

/* ============================================================================
   9 · SELECTOR DE ETIQUETAS
   ----------------------------------------------------------------------------
   Antes de crear una etiqueta nueva, la app muestra las parecidas. Es lo único
   que evita que el banco se fragmente en "cine", "Cine" y "cine colombiano" en
   cuestión de semanas.
   ============================================================================ */

function SelectorEtiquetas({
  banco,
  puestas,
  setPuestas
}) {
  const [texto, setTexto] = useState("");
  const [parecidas, setParecidas] = useState([]);
  const activas = banco.filter(e => !e.archivada);
  const buscadas = texto.trim() ? activas.filter(e => sinTildes(e.nombre).includes(sinTildes(texto)) && !puestas.includes(e.nombre)) : [];
  useEffect(() => {
    const t = texto.trim();
    if (t.length < 3 || !db) {
      setParecidas([]);
      return;
    }
    const id = setTimeout(async () => {
      const {
        data
      } = await db.rpc("etiquetas_parecidas", {
        p_nombre: t
      });
      setParecidas((data || []).filter(e => sinTildes(e.nombre) !== sinTildes(t)));
    }, 260);
    return () => clearTimeout(id);
  }, [texto]);
  const agregar = nombre => {
    const n = nombre.trim();
    if (!n || puestas.length >= MAX_ETIQUETAS) return;
    if (!puestas.some(p => sinTildes(p) === sinTildes(n))) setPuestas([...puestas, n]);
    setTexto("");
    setParecidas([]);
  };
  const exacta = activas.some(e => sinTildes(e.nombre) === sinTildes(texto.trim()));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "fila-chips",
    style: {
      marginBottom: puestas.length ? 11 : 0
    }
  }, puestas.map(n => {
    const e = activas.find(x => sinTildes(x.nombre) === sinTildes(n));
    return /*#__PURE__*/React.createElement("button", {
      key: n,
      className: "etiqueta puesta",
      style: {
        "--c": e ? `var(--e${e.color})` : "var(--tiza)"
      },
      onClick: () => setPuestas(puestas.filter(p => p !== n))
    }, n, " \xD7");
  })), /*#__PURE__*/React.createElement("input", {
    className: "entrada",
    value: texto,
    placeholder: puestas.length >= MAX_ETIQUETAS ? "Ya son ocho, el máximo" : "Escribí una etiqueta y elegila de la lista",
    disabled: puestas.length >= MAX_ETIQUETAS,
    onChange: e => setTexto(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") {
        e.preventDefault();
        agregar(texto);
      }
    }
  }), texto.trim() && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fila-chips"
  }, buscadas.slice(0, 10).map(e => /*#__PURE__*/React.createElement(Etiqueta, {
    key: e.id,
    etiqueta: e,
    onClick: () => agregar(e.nombre)
  }))), !exacta && texto.trim().length >= 2 && /*#__PURE__*/React.createElement("button", {
    className: "boton chica",
    style: {
      marginTop: 9
    },
    onClick: () => agregar(texto)
  }, /*#__PURE__*/React.createElement(Glifo, {
    n: "mas",
    t: 13
  }), " Crear \xAB", texto.trim(), "\xBB"), parecidas.length > 0 && !exacta && /*#__PURE__*/React.createElement("p", {
    className: "pista",
    style: {
      marginTop: 9
    }
  }, "Ya existen parecidas: ", parecidas.map((e, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: e.id
  }, i > 0 && ", ", /*#__PURE__*/React.createElement("button", {
    className: "boton fantasma chica",
    style: {
      padding: "1px 5px"
    },
    onClick: () => agregar(e.nombre)
  }, e.nombre))), ". Si es lo mismo, us\xE1 la que ya est\xE1.")));
}

/* ============================================================================
   10 · PUBLICAR Y EDITAR
   ============================================================================ */

function HojaPublicar({
  banco,
  onCerrar,
  onListo,
  editando,
  avisar
}) {
  const [tipo, setTipo] = useState(editando?.tipo || null);
  const [d, setD] = useState(editando?.datos || {});
  const [comentario, setComentario] = useState(editando?.comentario || "");
  const [puestas, setPuestas] = useState(editando ? editando.etiquetaIds.map(id => banco.find(e => e.id === id)?.nombre).filter(Boolean) : []);
  const [pegado, setPegado] = useState("");
  const [error, setError] = useState(null);
  const [duplicado, setDuplicado] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const set = (k, v) => setD(p => ({
    ...p,
    [k]: v
  }));

  /* Un solo campo para todo lo que sea un enlace: la app reconoce la
     plataforma y elige el tipo sola. */
  const reconocer = async url => {
    setPegado(url);
    const m = leerMedio(url);
    if (m && m.tipo === "video") {
      setTipo("video");
      setD({
        url,
        plataforma: m.plataforma,
        video_id: m.id,
        ...(m.segundo != null ? {
          segundo_inicio: m.segundo
        } : {})
      });
    } else if (m && m.tipo === "audio") {
      setTipo("audio");
      setD({
        url,
        plataforma: "spotify",
        tipo_medio: m.medio,
        medio_id: m.id
      });
    } else if (/^https?:\/\//i.test(url.trim())) {
      setTipo("enlace");
      setD({
        url: url.trim()
      });
    }
  };

  /* Aviso de duplicado. Lejos de ser un estorbo, "esto ya lo había publicado
     Laura hace cuatro meses" es la señal más interesante que puede dar el
     sistema. */
  useEffect(() => {
    if (editando || !db) return;
    if (!["enlace", "video", "audio"].includes(tipo)) {
      setDuplicado(null);
      return;
    }
    const t = setTimeout(async () => {
      const {
        data
      } = await db.rpc("buscar_duplicado", {
        p_tipo: tipo,
        p_datos: d
      });
      setDuplicado(data && data.length ? data[0] : null);
    }, 400);
    return () => clearTimeout(t);
  }, [tipo, d, editando]);
  const subirArchivo = async archivo => {
    if (!archivo) return;
    if (archivo.size > 12 * 1024 * 1024) {
      setError("La imagen pesa demasiado. Máximo 12 MB antes de comprimir.");
      return;
    }
    setSubiendo(true);
    setError(null);
    try {
      const {
        blob,
        ancho,
        alto
      } = await comprimir(archivo);
      const {
        data: s
      } = await db.auth.getSession();
      const carpeta = s.session.user.id;
      const ruta = `${carpeta}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.jpg`;
      const {
        error: e1
      } = await db.storage.from("contenidos").upload(ruta, blob, {
        contentType: "image/jpeg"
      });
      if (e1) throw e1;
      const {
        data: pub
      } = db.storage.from("contenidos").getPublicUrl(ruta);
      setD(p => ({
        ...p,
        ruta,
        url: pub.publicUrl,
        ancho,
        alto
      }));
    } catch (err) {
      setError(err.message || "No se pudo subir la imagen.");
    } finally {
      setSubiendo(false);
    }
  };
  const guardar = async () => {
    setGuardando(true);
    setError(null);
    const datos = {
      ...d
    };
    if (datos.segundo_inicio === "" || datos.segundo_inicio == null) delete datos.segundo_inicio;else datos.segundo_inicio = String(parseInt(datos.segundo_inicio, 10));
    try {
      const {
        error: e1
      } = editando ? await db.rpc("actualizar_contenido", {
        p_id: editando.id,
        p_datos: datos,
        p_comentario: comentario,
        p_etiquetas: puestas
      }) : await db.rpc("crear_contenido", {
        p_tipo: tipo,
        p_datos: datos,
        p_comentario: comentario,
        p_etiquetas: puestas
      });
      if (e1) throw e1;
      avisar(editando ? "Cambios guardados" : "Publicado en el muro");
      onListo();
    } catch (err) {
      setError(err.message || "No se pudo publicar.");
      setGuardando(false);
    }
  };
  const largo = comentario.trim().length;
  const listo = tipo && largo >= MIN_COMENTARIO && puestas.length > 0 && !subiendo;

  /* --- Paso 1: elegir el tipo --- */
  if (!tipo) return /*#__PURE__*/React.createElement(Hoja, {
    titulo: "Agregar contenido",
    onCerrar: onCerrar
  }, /*#__PURE__*/React.createElement("div", {
    className: "campo"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "pegar"
  }, "Peg\xE1 un enlace"), /*#__PURE__*/React.createElement("input", {
    id: "pegar",
    className: "entrada",
    value: pegado,
    placeholder: "YouTube, Vimeo, Spotify o cualquier p\xE1gina",
    onChange: e => reconocer(e.target.value)
  }), /*#__PURE__*/React.createElement("p", {
    className: "pista"
  }, "Se reconoce la plataforma sola. Si no es un enlace, eleg\xED abajo qu\xE9 quer\xE9s publicar.")), /*#__PURE__*/React.createElement("div", {
    className: "campo"
  }, /*#__PURE__*/React.createElement("label", null, "O eleg\xED el tipo"), /*#__PURE__*/React.createElement("div", {
    className: "tipos"
  }, TIPOS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    className: "tipo-op",
    onClick: () => {
      setTipo(t.id);
      setD({});
    }
  }, /*#__PURE__*/React.createElement(Glifo, {
    n: t.id,
    t: 21
  }), /*#__PURE__*/React.createElement("b", null, t.nombre))))));

  /* --- Paso 2: el formulario del tipo --- */
  return /*#__PURE__*/React.createElement(Hoja, {
    titulo: (editando ? "Editar " : "Nueva ") + TIPO[tipo].nombre.toLowerCase(),
    onCerrar: onCerrar,
    pie: /*#__PURE__*/React.createElement(React.Fragment, null, !editando && /*#__PURE__*/React.createElement("button", {
      className: "boton fantasma",
      onClick: () => {
        setTipo(null);
        setD({});
        setPegado("");
      }
    }, /*#__PURE__*/React.createElement(Glifo, {
      n: "volver",
      t: 15
    }), " Cambiar tipo"), /*#__PURE__*/React.createElement("button", {
      className: "boton viva",
      onClick: guardar,
      disabled: !listo || guardando
    }, guardando ? "Guardando…" : editando ? "Guardar cambios" : "Publicar"))
  }, error && /*#__PURE__*/React.createElement("div", {
    className: "aviso error"
  }, error), duplicado && /*#__PURE__*/React.createElement("div", {
    className: "aviso ojo"
  }, "Esto ya est\xE1 en el muro: lo public\xF3 ", duplicado.autor, " el ", fecha(duplicado.creado_en), ". Pod\xE9s publicarlo igual \u2014que vuelva a aparecer tambi\xE9n dice algo\u2014, pero val\xEDa la pena avisarte."), /*#__PURE__*/React.createElement(CamposDelTipo, {
    tipo: tipo,
    d: d,
    set: set,
    subirArchivo: subirArchivo,
    subiendo: subiendo
  }), /*#__PURE__*/React.createElement("div", {
    className: "campo"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "com"
  }, "Comentario"), /*#__PURE__*/React.createElement("textarea", {
    id: "com",
    className: "entrada",
    value: comentario,
    rows: 4,
    placeholder: TIPO[tipo].consigna,
    onChange: e => setComentario(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    className: "medidor" + (largo >= MIN_COMENTARIO ? " listo" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "riel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lleno",
    style: {
      width: Math.min(100, largo / MIN_COMENTARIO * 100) + "%"
    }
  })), /*#__PURE__*/React.createElement("small", null, largo < MIN_COMENTARIO ? `faltan ${MIN_COMENTARIO - largo}` : "listo")), /*#__PURE__*/React.createElement("p", {
    className: "pista"
  }, TIPO[tipo].consigna, " Es lo que separa esto de un tablero de recortes.")), /*#__PURE__*/React.createElement("div", {
    className: "campo"
  }, /*#__PURE__*/React.createElement("label", null, "Etiquetas"), /*#__PURE__*/React.createElement(SelectorEtiquetas, {
    banco: banco,
    puestas: puestas,
    setPuestas: setPuestas
  })));
}
function CamposDelTipo({
  tipo,
  d,
  set,
  subirArchivo,
  subiendo
}) {
  const campo = (k, etiqueta, extra = {}) => /*#__PURE__*/React.createElement("div", {
    className: "campo"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: k
  }, etiqueta), /*#__PURE__*/React.createElement("input", _extends({
    id: k,
    className: "entrada",
    value: d[k] ?? "",
    onChange: e => set(k, e.target.value)
  }, extra)));
  switch (tipo) {
    case "cita":
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "campo"
      }, /*#__PURE__*/React.createElement("label", {
        htmlFor: "q"
      }, "La cita"), /*#__PURE__*/React.createElement("textarea", {
        id: "q",
        className: "entrada",
        rows: 4,
        value: d.texto ?? "",
        onChange: e => set("texto", e.target.value),
        placeholder: "Copiala tal cual, sin comillas"
      }), /*#__PURE__*/React.createElement("p", {
        className: "pista"
      }, "Cuanto m\xE1s breve, m\xE1s grande se ve en el muro.")), /*#__PURE__*/React.createElement("div", {
        className: "campo"
      }, /*#__PURE__*/React.createElement("label", {
        htmlFor: "tf"
      }, "De d\xF3nde viene"), /*#__PURE__*/React.createElement("select", {
        id: "tf",
        className: "entrada",
        value: d.tipo_fuente ?? "",
        onChange: e => set("tipo_fuente", e.target.value)
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "Eleg\xED una"), FUENTES.map(([v, n]) => /*#__PURE__*/React.createElement("option", {
        key: v,
        value: v
      }, n)))), campo("autor", "Quién lo dijo o lo escribió"), campo("titulo", d.tipo_fuente === "pelicula" ? "Película" : d.tipo_fuente === "cancion" ? "Canción" : "Obra o publicación"), /*#__PURE__*/React.createElement("div", {
        className: "rejilla2"
      }, campo("editorial", "Editorial o medio"), campo("anio", "Año", {
        inputMode: "numeric",
        maxLength: 4
      })), campo("pagina", "Página o minuto"));
    case "palabra":
      return /*#__PURE__*/React.createElement("div", {
        className: "campo"
      }, /*#__PURE__*/React.createElement("label", {
        htmlFor: "p"
      }, "La palabra"), /*#__PURE__*/React.createElement("input", {
        id: "p",
        className: "entrada",
        maxLength: 24,
        value: d.texto ?? "",
        onChange: e => set("texto", e.target.value.replace(/[\n\r]/g, ""))
      }), /*#__PURE__*/React.createElement("p", {
        className: "pista"
      }, "Una palabra o una expresi\xF3n breve, hasta 24 caracteres. Si necesit\xE1s una frase, es una cita. Quedan ", 24 - (d.texto || "").length, "."));
    case "pregunta":
      return /*#__PURE__*/React.createElement("div", {
        className: "campo"
      }, /*#__PURE__*/React.createElement("label", {
        htmlFor: "pr"
      }, "La pregunta"), /*#__PURE__*/React.createElement("textarea", {
        id: "pr",
        className: "entrada",
        rows: 2,
        value: d.texto ?? "",
        onChange: e => set("texto", e.target.value),
        placeholder: "Algo que la editorial est\xE9 persiguiendo"
      }), /*#__PURE__*/React.createElement("p", {
        className: "pista"
      }, "No todo el muro es hallazgo. Tambi\xE9n hay b\xFAsqueda declarada."));
    case "texto":
      return /*#__PURE__*/React.createElement(React.Fragment, null, campo("titulo", "Título (opcional)"), /*#__PURE__*/React.createElement("div", {
        className: "campo"
      }, /*#__PURE__*/React.createElement("label", {
        htmlFor: "tx"
      }, "El texto"), /*#__PURE__*/React.createElement("textarea", {
        id: "tx",
        className: "entrada",
        rows: 7,
        value: d.texto ?? "",
        onChange: e => set("texto", e.target.value)
      })));
    case "enlace":
      return /*#__PURE__*/React.createElement(React.Fragment, null, campo("url", "Enlace", {
        placeholder: "https://…",
        inputMode: "url"
      }), campo("titulo", "Título (opcional)"));
    case "imagen":
    case "documento":
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "campo"
      }, /*#__PURE__*/React.createElement("label", null, tipo === "documento" ? "Foto del documento" : "Imagen"), d.url ? /*#__PURE__*/React.createElement("div", {
        style: {
          position: "relative"
        }
      }, /*#__PURE__*/React.createElement("img", {
        src: d.url,
        alt: "",
        style: {
          borderRadius: 4,
          border: "1px solid var(--linea)"
        }
      }), /*#__PURE__*/React.createElement("button", {
        className: "boton chica",
        style: {
          marginTop: 9
        },
        onClick: () => {
          set("url", "");
          set("ruta", "");
        }
      }, "Cambiar imagen")) : /*#__PURE__*/React.createElement("input", {
        type: "file",
        className: "entrada",
        accept: "image/jpeg,image/png,image/webp",
        onChange: e => subirArchivo(e.target.files?.[0]),
        disabled: subiendo
      }), subiendo && /*#__PURE__*/React.createElement("p", {
        className: "pista"
      }, "Comprimiendo y subiendo\u2026"), /*#__PURE__*/React.createElement("p", {
        className: "pista"
      }, "Se comprime en el navegador antes de subir. La imagen queda p\xFAblica.")), campo("credito", "Crédito", {
        placeholder: "Fotógrafo, archivo o fuente"
      }), /*#__PURE__*/React.createElement("p", {
        className: "pista",
        style: {
          marginTop: -11,
          marginBottom: 17
        }
      }, "Obligatorio. Si algo de este muro termina en un libro, este campo es la diferencia entre poder usar la imagen y no poder."), campo("procedencia", tipo === "documento" ? "Procedencia" : "Procedencia (opcional)"), campo("alt", "Descripción para lectores de pantalla"));
    case "video":
      return /*#__PURE__*/React.createElement(React.Fragment, null, campo("url", "Enlace de YouTube o Vimeo", {
        placeholder: "https://…",
        inputMode: "url",
        onChange: e => {
          const m = leerMedio(e.target.value);
          set("url", e.target.value);
          if (m && m.tipo === "video") {
            set("plataforma", m.plataforma);
            set("video_id", m.id);
            if (m.segundo != null) set("segundo_inicio", m.segundo);
          }
        }
      }), d.video_id ? /*#__PURE__*/React.createElement("p", {
        className: "pista",
        style: {
          marginTop: -11,
          marginBottom: 17
        }
      }, "Reconocido: ", d.plataforma === "youtube" ? "YouTube" : "Vimeo", " \xB7 ", d.video_id) : /*#__PURE__*/React.createElement("p", {
        className: "pista",
        style: {
          marginTop: -11,
          marginBottom: 17
        }
      }, "Peg\xE1 el enlace normal. La app arma el reproductor sola."), campo("titulo", "Título (opcional)"), campo("segundo_inicio", "Empezar en el segundo (opcional)", {
        inputMode: "numeric",
        placeholder: "Por ejemplo 2040 para el minuto 34"
      }), /*#__PURE__*/React.createElement("p", {
        className: "pista",
        style: {
          marginTop: -11
        }
      }, "Poder decir \xABel minuto 34, no la pel\xEDcula\xBB es exactamente lo que hace un editor."));
    case "audio":
      return /*#__PURE__*/React.createElement(React.Fragment, null, campo("url", "Enlace de Spotify", {
        placeholder: "https://open.spotify.com/…",
        inputMode: "url",
        onChange: e => {
          const m = leerMedio(e.target.value);
          set("url", e.target.value);
          if (m && m.tipo === "audio") {
            set("plataforma", "spotify");
            set("tipo_medio", m.medio);
            set("medio_id", m.id);
          }
        }
      }), d.medio_id && /*#__PURE__*/React.createElement("p", {
        className: "pista",
        style: {
          marginTop: -11,
          marginBottom: 17
        }
      }, "Reconocido: ", d.tipo_medio, " \xB7 ", d.medio_id), campo("titulo", "Título (opcional)"));
    default:
      return null;
  }
}

/* ============================================================================
   11 · FICHA AMPLIADA
   ============================================================================ */

function Ficha({
  c,
  autor,
  banco,
  contenidos,
  porId,
  yo,
  onCerrar,
  onEtiqueta,
  onAbrir,
  onEditar,
  onPapelera,
  onDestacar,
  onEco
}) {
  const d = c.datos || {};
  const mias = c.etiquetaIds;
  const embed = urlIncrustada(c);

  /* Afines: los cinco contenidos con más etiquetas en común. Cero pantallas
     nuevas, y es donde el muro empieza a leerse como una red. */
  const afines = useMemo(() => contenidos.filter(x => x.id !== c.id && !x.eliminado).map(x => ({
    x,
    n: x.etiquetaIds.filter(i => mias.includes(i)).length
  })).filter(o => o.n > 0).sort((a, b) => b.n - a.n || new Date(b.x.creado_en) - new Date(a.x.creado_en)).slice(0, 5), [contenidos, c.id, mias]);
  const resumen = x => {
    const y = x.datos || {};
    return y.texto || y.titulo || y.credito || dominio(y.url || "") || TIPO[x.tipo].nombre;
  };
  const mio = yo && c.autor_id === yo.id;
  return /*#__PURE__*/React.createElement(Hoja, {
    titulo: TIPO[c.tipo].nombre,
    onCerrar: onCerrar,
    ancha: true,
    pie: mio ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "boton fantasma",
      onClick: () => onDestacar(c)
    }, c.destacado ? "Quitar de destacados" : "Destacar"), /*#__PURE__*/React.createElement("button", {
      className: "boton fantasma",
      onClick: () => onPapelera(c)
    }, /*#__PURE__*/React.createElement(Glifo, {
      n: "papelera",
      t: 15
    }), " A la papelera"), /*#__PURE__*/React.createElement("button", {
      className: "boton",
      onClick: () => onEditar(c)
    }, /*#__PURE__*/React.createElement(Glifo, {
      n: "lapiz",
      t: 15
    }), " Editar")) : null
  }, embed && /*#__PURE__*/React.createElement("div", {
    className: "marco-embed" + (c.tipo === "audio" ? " audio" : "")
  }, /*#__PURE__*/React.createElement("iframe", {
    src: embed,
    title: d.titulo || TIPO[c.tipo].nombre,
    loading: "lazy",
    allow: "accelerometer; clipboard-write; encrypted-media; picture-in-picture",
    allowFullScreen: true,
    referrerPolicy: "strict-origin-when-cross-origin"
  })), (c.tipo === "imagen" || c.tipo === "documento") && /*#__PURE__*/React.createElement("img", {
    src: d.url,
    alt: d.alt || "",
    style: {
      borderRadius: 3,
      marginBottom: 18,
      border: "1px solid var(--linea)"
    }
  }), ["cita", "palabra", "pregunta", "texto"].includes(c.tipo) && /*#__PURE__*/React.createElement("p", {
    className: "ficha-texto",
    style: c.tipo === "pregunta" ? {
      fontStyle: "italic"
    } : null
  }, c.tipo === "cita" && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--tiza-borrada)"
    }
  }, "\u201C"), d.texto, c.tipo === "cita" && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--tiza-borrada)"
    }
  }, "\u201D")), c.tipo === "cita" && /*#__PURE__*/React.createElement("p", {
    className: "fuente",
    style: {
      fontSize: 13,
      marginTop: -6
    }
  }, d.autor, d.titulo && /*#__PURE__*/React.createElement(React.Fragment, null, ", ", /*#__PURE__*/React.createElement("span", {
    className: "obra"
  }, d.titulo)), d.editorial && /*#__PURE__*/React.createElement(React.Fragment, null, ". ", d.editorial), d.anio && /*#__PURE__*/React.createElement(React.Fragment, null, " (", d.anio, ")"), d.pagina && /*#__PURE__*/React.createElement(React.Fragment, null, ", p. ", d.pagina), d.tipo_fuente && /*#__PURE__*/React.createElement(React.Fragment, null, " \xB7 ", FUENTE[d.tipo_fuente])), (c.tipo === "imagen" || c.tipo === "documento") && /*#__PURE__*/React.createElement("p", {
    className: "fuente",
    style: {
      fontSize: 13
    }
  }, d.credito, d.procedencia && /*#__PURE__*/React.createElement(React.Fragment, null, " \xB7 ", d.procedencia)), c.tipo === "enlace" && /*#__PURE__*/React.createElement("p", {
    className: "ficha-texto",
    style: {
      fontSize: 22
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: d.url,
    target: "_blank",
    rel: "noopener noreferrer"
  }, d.titulo || d.url)), (c.tipo === "enlace" || c.tipo === "video" || c.tipo === "audio") && /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("a", {
    className: "boton chica",
    href: d.url,
    target: "_blank",
    rel: "noopener noreferrer"
  }, "Abrir en ", c.tipo === "audio" ? "Spotify" : d.plataforma === "vimeo" ? "Vimeo" : d.plataforma === "youtube" ? "YouTube" : dominio(d.url))), /*#__PURE__*/React.createElement("p", {
    className: "ficha-comentario"
  }, c.comentario), /*#__PURE__*/React.createElement("div", {
    className: "fila-chips",
    style: {
      marginBottom: 20
    }
  }, mias.map(id => /*#__PURE__*/React.createElement(Etiqueta, {
    key: id,
    etiqueta: banco.find(e => e.id === id),
    onClick: () => {
      onEtiqueta(id);
      onCerrar();
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "pie",
    style: {
      padding: "13px 0",
      borderTop: "1px solid var(--linea)"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    perfil: autor,
    grande: true
  }), /*#__PURE__*/React.createElement("span", {
    className: "quien"
  }, autor?.nombre, " \xB7 ", fecha(c.creado_en), c.editado_en && /*#__PURE__*/React.createElement(React.Fragment, null, " \xB7 editado")), /*#__PURE__*/React.createElement("button", {
    className: "eco" + (yo && c.ecoIds.includes(yo.id) ? " mio" : ""),
    onClick: () => onEco(c),
    disabled: !yo || mio
  }, /*#__PURE__*/React.createElement("span", {
    className: "anillos"
  }), c.ecoIds.length > 0 ? `${c.ecoIds.length} eco${c.ecoIds.length > 1 ? "s" : ""}` : "Eco")), c.ecoIds.length > 0 && /*#__PURE__*/React.createElement("p", {
    className: "pista"
  }, "Le resuena a ", c.ecoIds.map(i => porId[i]?.nombre).filter(Boolean).join(", "), "."), afines.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h3", {
    className: "titulillo",
    style: {
      margin: "26px 0 11px"
    }
  }, "Cerca de esto"), /*#__PURE__*/React.createElement("div", {
    className: "afines"
  }, afines.map(({
    x,
    n
  }) => /*#__PURE__*/React.createElement("button", {
    key: x.id,
    className: "afin",
    onClick: () => onAbrir(x)
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      color: "var(--tiza-baja)",
      fontSize: 11,
      marginBottom: 5
    }
  }, TIPO[x.tipo].nombre, " \xB7 ", n, " etiqueta", n > 1 ? "s" : "", " en com\xFAn"), String(resumen(x)).slice(0, 78))))));
}

/* ============================================================================
   12 · PALETA DE AFINIDADES
   ----------------------------------------------------------------------------
   Si cada etiqueta tiene un color, el conjunto del muro ES una paleta. Tres
   lecturas de la misma idea, más una vista derivada que suele ser la más útil.
   ============================================================================ */

function Franja({
  partes,
  total
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "franja"
  }, partes.map((p, i) => /*#__PURE__*/React.createElement("i", {
    key: i,
    style: {
      flex: p.n,
      background: `var(--e${p.color})`
    },
    title: `${p.nombre} · ${p.n}`
  })), total === 0 && /*#__PURE__*/React.createElement("i", {
    style: {
      flex: 1,
      background: "var(--superficie)"
    }
  }));
}
function HojaPaleta({
  contenidos,
  banco,
  perfiles,
  onCerrar,
  onEtiqueta
}) {
  const [vista, setVista] = useState("temporal");
  const vivos = useMemo(() => contenidos.filter(c => !c.eliminado), [contenidos]);
  const eti = id => banco.find(e => e.id === id);

  /* Paleta temporal: una franja por mes. Puestas una debajo de otra dan la
     deriva temática de la editorial: cómo un color entra, domina tres meses
     y se apaga. */
  const porMes = useMemo(() => {
    const m = {};
    vivos.forEach(c => {
      const k = c.creado_en.slice(0, 7);
      m[k] = m[k] || {};
      c.etiquetaIds.forEach(id => {
        m[k][id] = (m[k][id] || 0) + 1;
      });
    });
    return Object.entries(m).sort((a, b) => b[0].localeCompare(a[0])).map(([mes, cuenta]) => ({
      mes,
      partes: Object.entries(cuenta).map(([id, n]) => ({
        ...eti(id),
        n
      })).filter(p => p.color).sort((a, b) => b.n - a.n),
      total: Object.values(cuenta).reduce((a, b) => a + b, 0)
    }));
  }, [vivos, banco]);

  /* Paleta por editor: cada persona tiene una firma cromática. Lo interesante
     no son los colores compartidos sino los que aparecen en una sola franja. */
  const porEditor = useMemo(() => perfiles.map(p => {
    const cuenta = {};
    vivos.filter(c => c.autor_id === p.id).forEach(c => c.etiquetaIds.forEach(id => {
      cuenta[id] = (cuenta[id] || 0) + 1;
    }));
    return {
      perfil: p,
      partes: Object.entries(cuenta).map(([id, n]) => ({
        ...eti(id),
        n
      })).filter(x => x.color).sort((a, b) => b.n - a.n),
      total: Object.values(cuenta).reduce((a, b) => a + b, 0)
    };
  }), [vivos, perfiles, banco]);

  /* Suelo común y territorio propio. Para una editorial que está definiendo
     su línea, esto es un diagnóstico. */
  const territorio = useMemo(() => {
    const uso = {};
    vivos.forEach(c => c.etiquetaIds.forEach(id => {
      uso[id] = uso[id] || {
        n: 0,
        quienes: new Set()
      };
      uso[id].n++;
      uso[id].quienes.add(c.autor_id);
    }));
    const filas = Object.entries(uso).map(([id, u]) => ({
      e: eti(id),
      n: u.n,
      editores: u.quienes.size,
      quienes: [...u.quienes]
    })).filter(f => f.e);
    return {
      comun: filas.filter(f => f.editores >= 3).sort((a, b) => b.n - a.n),
      propio: filas.filter(f => f.editores === 1).sort((a, b) => b.n - a.n)
    };
  }, [vivos, banco]);

  /* Constelación: cada etiqueta es un nodo del tamaño de su frecuencia, las
     líneas son coocurrencias. Los racimos densos son las obsesiones reales de
     la editorial, que casi nunca coinciden con las declaradas.
     Disposición radial estable: ordenada por frecuencia, sin simulación
     física, para que se vea igual cada vez que se abre. */
  const constelacionDatos = useMemo(() => {
    const uso = {};
    vivos.forEach(c => c.etiquetaIds.forEach(id => {
      uso[id] = (uso[id] || 0) + 1;
    }));
    const nodos = Object.entries(uso).map(([id, n]) => ({
      id,
      n,
      e: eti(id)
    })).filter(x => x.e).sort((a, b) => b.n - a.n).slice(0, 26);
    const max = nodos[0]?.n || 1;
    const N = nodos.length;
    nodos.forEach((nd, i) => {
      /* Espiral: las más frecuentes hacia el centro. */
      const t = N > 1 ? i / (N - 1) : 0;
      const ang = i * 2.399; // ángulo áureo: reparte parejo
      const rad = 34 + t * 150;
      nd.x = 250 + Math.cos(ang) * rad * 1.55;
      nd.y = 210 + Math.sin(ang) * rad;
      nd.r = 4 + nd.n / max * 15;
    });
    const idx = Object.fromEntries(nodos.map(n => [n.id, n]));
    const pares = {};
    vivos.forEach(c => {
      const l = c.etiquetaIds.filter(i => idx[i]);
      for (let a = 0; a < l.length; a++) for (let b = a + 1; b < l.length; b++) {
        const k = [l[a], l[b]].sort().join("|");
        pares[k] = (pares[k] || 0) + 1;
      }
    });
    const lineas = Object.entries(pares).map(([k, n]) => {
      const [a, b] = k.split("|");
      return {
        a: idx[a],
        b: idx[b],
        n
      };
    }).sort((x, y) => y.n - x.n).slice(0, 60);
    return {
      nodos,
      lineas
    };
  }, [vivos, banco]);
  return /*#__PURE__*/React.createElement(Hoja, {
    titulo: "Paleta de afinidades",
    onCerrar: onCerrar,
    ancha: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "pestanas"
  }, [["temporal", "Deriva por mes"], ["editor", "Por editora"], ["constelacion", "Constelación"], ["territorio", "Suelo común"]].map(([v, n]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    className: vista === v ? "puesta" : "",
    onClick: () => setVista(v)
  }, n))), vivos.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "centrado"
  }, /*#__PURE__*/React.createElement("p", null, "Todav\xEDa no hay nada que leer. La paleta se arma sola a medida que el muro crece.")), vista === "temporal" && porMes.map(f => /*#__PURE__*/React.createElement("div", {
    className: "fila-franja",
    key: f.mes
  }, /*#__PURE__*/React.createElement("span", null, mesLargo(f.mes + "-01")), /*#__PURE__*/React.createElement(Franja, {
    partes: f.partes,
    total: f.total
  }))), vista === "temporal" && vivos.length > 0 && /*#__PURE__*/React.createElement("p", {
    className: "pista",
    style: {
      marginTop: 16
    }
  }, "Cada franja es un mes. El ancho de cada color es cu\xE1ntas veces se us\xF3 esa etiqueta. Le\xEDdas de arriba abajo se ve c\xF3mo un tema entra, domina y se apaga."), vista === "editor" && /*#__PURE__*/React.createElement(React.Fragment, null, porEditor.map(f => /*#__PURE__*/React.createElement("div", {
    className: "fila-franja",
    key: f.perfil.id
  }, /*#__PURE__*/React.createElement("span", {
    className: "con-avatar"
  }, /*#__PURE__*/React.createElement(Avatar, {
    perfil: f.perfil
  })), /*#__PURE__*/React.createElement(Franja, {
    partes: f.partes,
    total: f.total
  }))), /*#__PURE__*/React.createElement("p", {
    className: "pista",
    style: {
      marginTop: 16
    }
  }, "Cada una tiene su firma crom\xE1tica. Lo interesante no son los colores compartidos sino los que aparecen en una sola franja: eso es lo que trae cada una y nadie m\xE1s ve.")), vista === "constelacion" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("svg", {
    className: "constelacion",
    viewBox: "0 0 500 420",
    role: "img",
    "aria-label": "Mapa de etiquetas que aparecen juntas"
  }, constelacionDatos.lineas.map((l, i) => /*#__PURE__*/React.createElement("line", {
    key: i,
    x1: l.a.x,
    y1: l.a.y,
    x2: l.b.x,
    y2: l.b.y,
    strokeWidth: Math.min(2.4, .4 + l.n * .35),
    opacity: Math.min(.55, .12 + l.n * .1)
  })), constelacionDatos.nodos.map(n => /*#__PURE__*/React.createElement("g", {
    key: n.id
  }, /*#__PURE__*/React.createElement("circle", {
    cx: n.x,
    cy: n.y,
    r: n.r,
    fill: `var(--e${n.e.color})`,
    opacity: ".8",
    onClick: () => {
      onEtiqueta(n.id);
      onCerrar();
    }
  }, /*#__PURE__*/React.createElement("title", null, n.e.nombre, " \xB7 ", n.n)), n.r > 8 && /*#__PURE__*/React.createElement("text", {
    x: n.x,
    y: n.y + n.r + 11,
    textAnchor: "middle"
  }, n.e.nombre)))), /*#__PURE__*/React.createElement("p", {
    className: "pista"
  }, "El tama\xF1o es la frecuencia; las l\xEDneas, cu\xE1ntas veces dos etiquetas aparecieron en el mismo contenido. Los racimos densos son las obsesiones reales de la editorial. Toc\xE1 un nodo para filtrar el muro por esa etiqueta.")), vista === "territorio" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "dos-columnas"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "titulillo"
  }, "Suelo com\xFAn \xB7 tres o cuatro editoras"), /*#__PURE__*/React.createElement("div", {
    className: "lista-etiquetas"
  }, territorio.comun.map(f => /*#__PURE__*/React.createElement("button", {
    key: f.e.id,
    className: "linea-etiqueta",
    onClick: () => {
      onEtiqueta(f.e.id);
      onCerrar();
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "punto",
    style: {
      "--c": `var(--e${f.e.color})`
    }
  }), /*#__PURE__*/React.createElement("b", null, f.e.nombre), /*#__PURE__*/React.createElement("small", null, f.n))), !territorio.comun.length && /*#__PURE__*/React.createElement("p", {
    className: "pista"
  }, "Todav\xEDa no hay vocabulario compartido."))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "titulillo"
  }, "Territorio propio \xB7 una sola"), /*#__PURE__*/React.createElement("div", {
    className: "lista-etiquetas"
  }, territorio.propio.map(f => /*#__PURE__*/React.createElement("button", {
    key: f.e.id,
    className: "linea-etiqueta",
    onClick: () => {
      onEtiqueta(f.e.id);
      onCerrar();
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "punto",
    style: {
      "--c": `var(--e${f.e.color})`
    }
  }), /*#__PURE__*/React.createElement("b", null, f.e.nombre), /*#__PURE__*/React.createElement("small", null, f.n))), !territorio.propio.length && /*#__PURE__*/React.createElement("p", {
    className: "pista"
  }, "Todo el vocabulario es compartido.")))), /*#__PURE__*/React.createElement("p", {
    className: "pista",
    style: {
      marginTop: 18
    }
  }, "A la izquierda, lo que la editorial ya comparte. A la derecha, lo que todav\xEDa trae una sola persona. Para una editorial que est\xE1 definiendo su l\xEDnea, la columna derecha suele ser la m\xE1s interesante.")));
}

/* ============================================================================
   13 · CURADURÍA DEL BANCO DE ETIQUETAS
   ----------------------------------------------------------------------------
   Solo para quien tiene curador = true. Sin esto, el banco solo crece.
   ============================================================================ */

function HojaCuraduria({
  banco,
  onCerrar,
  recargar,
  avisar
}) {
  const [editando, setEditando] = useState(null);
  const [nombre, setNombre] = useState("");
  const [fusionando, setFusionando] = useState(null);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const correr = async (fn, mensaje) => {
    setOcupado(true);
    setError(null);
    try {
      const {
        error: e
      } = await fn();
      if (e) throw e;
      await recargar();
      avisar(mensaje);
      setEditando(null);
      setFusionando(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado(false);
    }
  };
  const activas = banco.filter(e => !e.archivada).sort((a, b) => b.usos - a.usos);
  const guardadas = banco.filter(e => e.archivada);
  return /*#__PURE__*/React.createElement(Hoja, {
    titulo: "Banco de etiquetas",
    onCerrar: onCerrar,
    ancha: true
  }, error && /*#__PURE__*/React.createElement("div", {
    className: "aviso error"
  }, error), /*#__PURE__*/React.createElement("p", {
    className: "pista",
    style: {
      marginBottom: 20
    }
  }, "Doce colores es el tope antes de que se repitan. Cuando eso pase, conviene fusionar en vez de seguir agregando: la escasez de la paleta es lo que mantiene el vocabulario ordenado."), fusionando && /*#__PURE__*/React.createElement("div", {
    className: "aviso ojo"
  }, /*#__PURE__*/React.createElement("b", null, "Fusionar \xAB", fusionando.nombre, "\xBB"), " \u2014 eleg\xED abajo con cu\xE1l se junta. Todo lo etiquetado con \xAB", fusionando.nombre, "\xBB pasa a la otra, y \xE9sta desaparece.", /*#__PURE__*/React.createElement("button", {
    className: "boton fantasma chica",
    style: {
      marginLeft: 8
    },
    onClick: () => setFusionando(null)
  }, "Cancelar")), /*#__PURE__*/React.createElement("div", {
    className: "lista-etiquetas"
  }, activas.map(e => /*#__PURE__*/React.createElement("div", {
    key: e.id,
    className: "linea-etiqueta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "punto",
    style: {
      "--c": `var(--e${e.color})`
    }
  }), editando === e.id ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
    className: "entrada",
    style: {
      flex: 1,
      padding: "5px 9px"
    },
    value: nombre,
    onChange: ev => setNombre(ev.target.value),
    autoFocus: true,
    onKeyDown: ev => {
      if (ev.key === "Enter") correr(() => db.rpc("renombrar_etiqueta", {
        p_id: e.id,
        p_nombre: nombre
      }), "Etiqueta renombrada");
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "boton chica",
    disabled: ocupado,
    onClick: () => correr(() => db.rpc("renombrar_etiqueta", {
      p_id: e.id,
      p_nombre: nombre
    }), "Etiqueta renombrada")
  }, "Guardar"), /*#__PURE__*/React.createElement("button", {
    className: "boton fantasma chica",
    onClick: () => setEditando(null)
  }, "Cancelar")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, e.nombre), /*#__PURE__*/React.createElement("small", null, e.usos, " \xB7 ", e.editores, " editora", e.editores === 1 ? "" : "s"), fusionando && fusionando.id !== e.id ? /*#__PURE__*/React.createElement("button", {
    className: "boton chica",
    disabled: ocupado,
    onClick: () => correr(() => db.rpc("fusionar_etiquetas", {
      p_origen: fusionando.id,
      p_destino: e.id
    }), `«${fusionando.nombre}» ahora es «${e.nombre}»`)
  }, "Juntar ac\xE1") : !fusionando && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "boton fantasma chica",
    onClick: () => {
      setEditando(e.id);
      setNombre(e.nombre);
    }
  }, "Renombrar"), /*#__PURE__*/React.createElement("button", {
    className: "boton fantasma chica",
    onClick: () => setFusionando(e)
  }, "Fusionar"), /*#__PURE__*/React.createElement("button", {
    className: "boton fantasma chica",
    disabled: ocupado,
    onClick: () => correr(() => db.rpc("archivar_etiqueta", {
      p_id: e.id,
      p_archivar: true
    }), "Etiqueta archivada")
  }, "Archivar"))))), !activas.length && /*#__PURE__*/React.createElement("p", {
    className: "pista"
  }, "El banco est\xE1 vac\xEDo. Se llena al publicar.")), guardadas.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h4", {
    className: "titulillo",
    style: {
      margin: "26px 0 11px"
    }
  }, "Archivadas"), /*#__PURE__*/React.createElement("div", {
    className: "lista-etiquetas"
  }, guardadas.map(e => /*#__PURE__*/React.createElement("div", {
    key: e.id,
    className: "linea-etiqueta",
    style: {
      opacity: .6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "punto",
    style: {
      "--c": `var(--e${e.color})`
    }
  }), /*#__PURE__*/React.createElement("b", null, e.nombre), /*#__PURE__*/React.createElement("small", null, e.usos), /*#__PURE__*/React.createElement("button", {
    className: "boton fantasma chica",
    disabled: ocupado,
    onClick: () => correr(() => db.rpc("archivar_etiqueta", {
      p_id: e.id,
      p_archivar: false
    }), "Etiqueta reactivada")
  }, "Reactivar")))), /*#__PURE__*/React.createElement("p", {
    className: "pista",
    style: {
      marginTop: 11
    }
  }, "Archivar no borra nada: la etiqueta deja de ofrecerse al publicar, pero sigue en el contenido que ya la ten\xEDa. Si alguien la vuelve a escribir, se reactiva sola.")));
}

/* ============================================================================
   14 · PAPELERA
   ============================================================================ */

function HojaPapelera({
  mios,
  banco,
  porId,
  onCerrar,
  recargar,
  avisar
}) {
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState(null);
  const restaurar = async c => {
    setOcupado(true);
    const {
      error: e
    } = await db.rpc("restaurar_contenido", {
      p_id: c.id
    });
    if (e) setError(e.message);else {
      await recargar();
      avisar("Vuelve al muro");
    }
    setOcupado(false);
  };

  /* Al eliminar definitivamente hay que borrar también el archivo del Storage,
     o el bucket se llena de huérfanos. La función devuelve la ruta justamente
     para eso. */
  const eliminar = async c => {
    if (!confirm("Esto no se puede deshacer. ¿Eliminar definitivamente?")) return;
    setOcupado(true);
    const {
      data: ruta,
      error: e
    } = await db.rpc("eliminar_definitivo", {
      p_id: c.id
    });
    if (e) setError(e.message);else {
      if (ruta) await db.storage.from("contenidos").remove([ruta]);
      await recargar();
      avisar("Eliminado para siempre");
    }
    setOcupado(false);
  };
  return /*#__PURE__*/React.createElement(Hoja, {
    titulo: "Tu papelera",
    onCerrar: onCerrar
  }, error && /*#__PURE__*/React.createElement("div", {
    className: "aviso error"
  }, error), /*#__PURE__*/React.createElement("p", {
    className: "pista",
    style: {
      marginBottom: 18
    }
  }, "Solo vos ves esto. Lo que borr\xE1s no desaparece hasta que lo elimin\xE1s desde ac\xE1."), !mios.length && /*#__PURE__*/React.createElement("div", {
    className: "centrado",
    style: {
      padding: "40px 0"
    }
  }, /*#__PURE__*/React.createElement("p", null, "No hay nada ac\xE1.")), mios.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    className: "linea-etiqueta",
    style: {
      alignItems: "flex-start",
      padding: "11px 0",
      borderBottom: "1px solid var(--linea)"
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      lineHeight: 1.45
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--tiza-baja)",
      fontSize: 11,
      display: "block"
    }
  }, TIPO[c.tipo].nombre, " \xB7 ", fechaCorta(c.creado_en)), String(c.datos.texto || c.datos.titulo || c.datos.credito || c.comentario).slice(0, 100)), /*#__PURE__*/React.createElement("button", {
    className: "boton chica",
    disabled: ocupado,
    onClick: () => restaurar(c)
  }, "Restaurar"), /*#__PURE__*/React.createElement("button", {
    className: "boton fantasma chica",
    disabled: ocupado,
    onClick: () => eliminar(c)
  }, "Eliminar"))));
}

/* ============================================================================
   15 · ENTRAR
   ============================================================================ */

function HojaEntrar({
  onCerrar,
  avisar
}) {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const entrar = async () => {
    setOcupado(true);
    setError(null);
    const {
      error: e
    } = await db.auth.signInWithPassword({
      email: correo.trim(),
      password: clave
    });
    if (e) {
      setError("El correo o la contraseña no coinciden.");
      setOcupado(false);
    } else {
      avisar("Ya estás dentro");
      onCerrar();
    }
  };
  return /*#__PURE__*/React.createElement(Hoja, {
    titulo: "Entrar",
    onCerrar: onCerrar,
    pie: /*#__PURE__*/React.createElement("button", {
      className: "boton viva",
      onClick: entrar,
      disabled: ocupado || !correo || !clave
    }, ocupado ? "Entrando…" : "Entrar")
  }, error && /*#__PURE__*/React.createElement("div", {
    className: "aviso error"
  }, error), /*#__PURE__*/React.createElement("p", {
    className: "pista",
    style: {
      marginBottom: 18
    }
  }, "El tablero lo puede leer cualquiera. Publicar es solo para el equipo editorial."), /*#__PURE__*/React.createElement("div", {
    className: "campo"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "c"
  }, "Correo"), /*#__PURE__*/React.createElement("input", {
    id: "c",
    className: "entrada",
    type: "email",
    autoComplete: "username",
    value: correo,
    onChange: e => setCorreo(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "campo"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "k"
  }, "Contrase\xF1a"), /*#__PURE__*/React.createElement("input", {
    id: "k",
    className: "entrada",
    type: "password",
    autoComplete: "current-password",
    value: clave,
    onChange: e => setClave(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter" && correo && clave) entrar();
    }
  })));
}

/* ============================================================================
   16 · MODO PROYECCIÓN
   ----------------------------------------------------------------------------
   Pantalla completa, una ficha a la vez, orden aleatorio. Para poner en la
   pared en una reunión editorial.
   ============================================================================ */

function Proyeccion({
  lista,
  porId,
  onCerrar
}) {
  const [i, setI] = useState(0);
  const orden = useMemo(() => {
    const l = [...lista];
    for (let k = l.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [l[k], l[j]] = [l[j], l[k]];
    }
    return l;
  }, [lista]);
  const avanzar = useCallback(p => setI(v => (v + p + orden.length) % orden.length), [orden.length]);
  useEffect(() => {
    const t = setInterval(() => avanzar(1), 11000);
    const tecla = e => {
      if (e.key === "Escape") onCerrar();
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        avanzar(1);
      }
      if (e.key === "ArrowLeft") avanzar(-1);
    };
    document.addEventListener("keydown", tecla);
    return () => {
      clearInterval(t);
      document.removeEventListener("keydown", tecla);
    };
  }, [avanzar, onCerrar]);
  if (!orden.length) return null;
  const c = orden[i],
    d = c.datos || {};
  const texto = d.texto || d.titulo || c.comentario;
  return /*#__PURE__*/React.createElement("div", {
    className: "proyeccion",
    onClick: () => avanzar(1)
  }, /*#__PURE__*/React.createElement("button", {
    className: "boton fantasma",
    style: {
      position: "absolute",
      top: 22,
      right: 22
    },
    onClick: e => {
      e.stopPropagation();
      onCerrar();
    }
  }, /*#__PURE__*/React.createElement(Glifo, {
    n: "cerrar",
    t: 18
  }), " Salir"), /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      animation: "dibujar 600ms var(--suave) both"
    }
  }, c.tipo === "imagen" || c.tipo === "documento" ? /*#__PURE__*/React.createElement("img", {
    className: "medio-p",
    src: d.url,
    alt: d.alt || ""
  }) : /*#__PURE__*/React.createElement("p", {
    className: "texto-p",
    style: c.tipo === "pregunta" ? {
      fontStyle: "italic"
    } : null
  }, texto)), /*#__PURE__*/React.createElement("div", {
    className: "pie-p"
  }, porId[c.autor_id]?.nombre, " \xB7 ", fecha(c.creado_en), " \xB7 ", i + 1, " de ", orden.length));
}

/* ============================================================================
   17 · FILTROS
   ============================================================================ */

const ORDENES = [["reciente", "Más reciente"], ["antiguo", "Más antiguo"], ["barajado", "Barajar"], ["enlazado", "Más enlazado"], ["eco", "Más eco"]];
function HojaFiltros({
  f,
  setF,
  perfiles,
  banco,
  onCerrar,
  onLimpiar
}) {
  const alternar = (clave, v) => setF(p => ({
    ...p,
    [clave]: p[clave].includes(v) ? p[clave].filter(x => x !== v) : [...p[clave], v]
  }));
  const activas = banco.filter(e => !e.archivada).sort((a, b) => b.usos - a.usos);
  return /*#__PURE__*/React.createElement(Hoja, {
    titulo: "Filtrar el muro",
    onCerrar: onCerrar,
    pie: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "boton fantasma",
      onClick: onLimpiar
    }, "Quitar todos"), /*#__PURE__*/React.createElement("button", {
      className: "boton viva",
      onClick: onCerrar
    }, "Ver el muro"))
  }, /*#__PURE__*/React.createElement("div", {
    className: "grupo-filtro"
  }, /*#__PURE__*/React.createElement("h4", null, "Qui\xE9n lo public\xF3"), /*#__PURE__*/React.createElement("div", {
    className: "fila-chips"
  }, perfiles.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    className: "chip" + (f.autores.includes(p.id) ? " puesto" : ""),
    onClick: () => alternar("autores", p.id)
  }, /*#__PURE__*/React.createElement(Avatar, {
    perfil: p
  }), p.nombre)))), /*#__PURE__*/React.createElement("div", {
    className: "grupo-filtro"
  }, /*#__PURE__*/React.createElement("h4", null, "Tipo de contenido"), /*#__PURE__*/React.createElement("div", {
    className: "fila-chips"
  }, TIPOS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    className: "chip sin-icono" + (f.tipos.includes(t.id) ? " puesto" : ""),
    onClick: () => alternar("tipos", t.id)
  }, /*#__PURE__*/React.createElement(Glifo, {
    n: t.id,
    t: 15
  }), t.nombre)))), /*#__PURE__*/React.createElement("div", {
    className: "grupo-filtro"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0
    }
  }, "Etiquetas"), /*#__PURE__*/React.createElement("div", {
    className: "interruptor"
  }, /*#__PURE__*/React.createElement("button", {
    className: f.modo === "cualquiera" ? "puesto" : "",
    onClick: () => setF(p => ({
      ...p,
      modo: "cualquiera"
    }))
  }, "Cualquiera"), /*#__PURE__*/React.createElement("button", {
    className: f.modo === "todas" ? "puesto" : "",
    onClick: () => setF(p => ({
      ...p,
      modo: "todas"
    }))
  }, "Todas"))), /*#__PURE__*/React.createElement("p", {
    className: "pista",
    style: {
      margin: "0 0 10px"
    }
  }, "\xABCualquiera\xBB es para explorar. \xABTodas\xBB es para buscar algo preciso."), /*#__PURE__*/React.createElement("div", {
    className: "fila-chips"
  }, activas.map(e => /*#__PURE__*/React.createElement(Etiqueta, {
    key: e.id,
    etiqueta: e,
    puesta: f.etiquetas.includes(e.id),
    onClick: () => alternar("etiquetas", e.id)
  })), !activas.length && /*#__PURE__*/React.createElement("p", {
    className: "pista"
  }, "Todav\xEDa no hay etiquetas."))), /*#__PURE__*/React.createElement("div", {
    className: "grupo-filtro"
  }, /*#__PURE__*/React.createElement("h4", null, "Cu\xE1ndo"), /*#__PURE__*/React.createElement("div", {
    className: "fila-chips"
  }, [["", "Siempre"], ["30", "Último mes"], ["90", "Tres meses"], ["365", "Un año"]].map(([v, n]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    className: "chip sin-icono" + (f.periodo === v ? " puesto" : ""),
    onClick: () => setF(p => ({
      ...p,
      periodo: v
    }))
  }, n)))), /*#__PURE__*/React.createElement("div", {
    className: "grupo-filtro"
  }, /*#__PURE__*/React.createElement("h4", null, "Ordenar por"), /*#__PURE__*/React.createElement("div", {
    className: "fila-chips"
  }, ORDENES.map(([v, n]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    className: "chip sin-icono" + (f.orden === v ? " puesto" : ""),
    onClick: () => setF(p => ({
      ...p,
      orden: v,
      semilla: Math.random()
    }))
  }, n))), /*#__PURE__*/React.createElement("p", {
    className: "pista",
    style: {
      marginTop: 10
    }
  }, "Un muro ordenado por fecha condena todo lo viejo. Barajar hace que material de hace ocho meses vuelva a la superficie: en un tablero de inspiraci\xF3n eso no es un capricho, es la funci\xF3n.")));
}

/* ============================================================================
   18 · LA APLICACIÓN
   ============================================================================ */

const FILTROS_VACIOS = {
  autores: [],
  tipos: [],
  etiquetas: [],
  modo: "cualquiera",
  periodo: "",
  orden: "reciente",
  semilla: 1
};
function App() {
  const T = useTablero();
  const [busqueda, setBusqueda] = useState("");
  const [f, setF] = useState(FILTROS_VACIOS);
  const [capa, setCapa] = useState(null); // filtros | publicar | paleta | curaduria | papelera | entrar | proyeccion
  const [abierto, setAbierto] = useState(null);
  const [editando, setEditando] = useState(null);
  const [nota, setNota] = useState(null);
  const [condensada, setCondensada] = useState(false);
  const avisar = useCallback(t => setNota(t), []);
  useEffect(() => {
    const s = () => setCondensada(window.scrollY > 90);
    window.addEventListener("scroll", s, {
      passive: true
    });
    return () => window.removeEventListener("scroll", s);
  }, []);
  const vivos = T.contenidos.filter(c => !c.eliminado);
  const enPapelera = T.yo ? T.contenidos.filter(c => c.eliminado && c.autor_id === T.yo.id) : [];

  /* --- Filtrado y orden --- */
  const lista = useMemo(() => {
    const q = sinTildes(busqueda.trim());
    let l = vivos;
    if (f.autores.length) l = l.filter(c => f.autores.includes(c.autor_id));
    if (f.tipos.length) l = l.filter(c => f.tipos.includes(c.tipo));
    if (f.etiquetas.length) l = l.filter(c => f.modo === "todas" ? f.etiquetas.every(id => c.etiquetaIds.includes(id)) : f.etiquetas.some(id => c.etiquetaIds.includes(id)));
    if (f.periodo) {
      const corte = Date.now() - +f.periodo * 86400000;
      l = l.filter(c => new Date(c.creado_en).getTime() >= corte);
    }
    if (q) l = l.filter(c => {
      const d = c.datos || {};
      const heno = sinTildes([d.texto, d.titulo, d.autor, d.editorial, d.credito, d.procedencia, d.url, c.comentario].filter(Boolean).join(" "));
      const etq = sinTildes(c.etiquetaIds.map(i => T.etiquetaPorId[i]?.nombre || "").join(" "));
      return heno.includes(q) || etq.includes(q);
    });

    /* Cuántas etiquetas comparte cada contenido con el resto del muro: es lo
       que está en el centro de la conversación, no lo que gustó más. */
    const enlace = c => {
      const otros = vivos.filter(x => x.id !== c.id);
      return otros.reduce((a, x) => a + x.etiquetaIds.filter(i => c.etiquetaIds.includes(i)).length, 0);
    };
    const l2 = [...l];
    switch (f.orden) {
      case "antiguo":
        l2.sort((a, b) => new Date(a.creado_en) - new Date(b.creado_en));
        break;
      case "eco":
        l2.sort((a, b) => b.ecoIds.length - a.ecoIds.length || new Date(b.creado_en) - new Date(a.creado_en));
        break;
      case "enlazado":
        l2.sort((a, b) => enlace(b) - enlace(a));
        break;
      case "barajado":
        {
          /* Barajado estable: la misma semilla da siempre el mismo orden, así el
             muro no se reordena solo cada vez que React vuelve a dibujar. */
          const clave = c => {
            let h = 0;
            const s = c.id + f.semilla;
            for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1e9;
            return h;
          };
          l2.sort((a, b) => clave(a) - clave(b));
          break;
        }
      default:
        l2.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
    }
    /* Lo destacado sube, salvo cuando se pidió barajar: ahí manda el azar. */
    if (f.orden !== "barajado") l2.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
    return l2;
  }, [vivos, f, busqueda, T.etiquetaPorId]);
  const hayFiltro = f.autores.length || f.tipos.length || f.etiquetas.length || f.periodo || busqueda.trim();

  /* --- Acciones --- */
  const eco = async c => {
    if (!T.yo) {
      setCapa("entrar");
      return;
    }
    const {
      error
    } = await db.rpc("alternar_eco", {
      p_contenido_id: c.id
    });
    if (error) avisar(error.message);else T.cargar();
  };
  const papelera = async c => {
    const {
      error
    } = await db.rpc("enviar_a_papelera", {
      p_id: c.id
    });
    if (error) avisar(error.message);else {
      setAbierto(null);
      await T.cargar();
      avisar("A la papelera. Podés recuperarlo.");
    }
  };
  const destacar = async c => {
    const {
      error
    } = await db.from("contenidos").update({
      destacado: !c.destacado
    }).eq("id", c.id);
    if (error) avisar(error.message);else {
      setAbierto(null);
      await T.cargar();
      avisar(c.destacado ? "Ya no está destacado" : "Destacado");
    }
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("header", {
    className: "enc" + (condensada ? " condensada" : "")
  }, /*#__PURE__*/React.createElement("h1", {
    className: "marca"
  }, CFG.EDITORIAL), /*#__PURE__*/React.createElement("p", {
    className: "subtitulo"
  }, CFG.SUBTITULO), !condensada && /*#__PURE__*/React.createElement("hr", {
    className: "trazo"
  })), /*#__PURE__*/React.createElement("div", {
    className: "barra"
  }, /*#__PURE__*/React.createElement("div", {
    className: "buscador"
  }, /*#__PURE__*/React.createElement(Glifo, {
    n: "buscar",
    t: 16
  }), /*#__PURE__*/React.createElement("input", {
    value: busqueda,
    onChange: e => setBusqueda(e.target.value),
    placeholder: "Buscar en citas, comentarios y etiquetas",
    "aria-label": "Buscar en el tablero"
  })), /*#__PURE__*/React.createElement("button", {
    className: "boton" + (hayFiltro ? " activa" : ""),
    onClick: () => setCapa("filtros")
  }, /*#__PURE__*/React.createElement(Glifo, {
    n: "filtro",
    t: 16
  }), /*#__PURE__*/React.createElement("span", {
    className: "solo-lectores"
  }, "Filtrar")), /*#__PURE__*/React.createElement("button", {
    className: "boton",
    onClick: () => setF(p => ({
      ...p,
      orden: "barajado",
      semilla: Math.random()
    })),
    title: "Barajar el muro"
  }, /*#__PURE__*/React.createElement(Glifo, {
    n: "barajar",
    t: 16
  })), /*#__PURE__*/React.createElement("button", {
    className: "boton",
    onClick: () => setCapa("paleta"),
    title: "Paleta de afinidades"
  }, /*#__PURE__*/React.createElement(Glifo, {
    n: "paleta",
    t: 16
  })), lista.length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "boton",
    onClick: () => setCapa("proyeccion"),
    title: "Modo proyecci\xF3n"
  }, /*#__PURE__*/React.createElement(Glifo, {
    n: "proyectar",
    t: 16
  })), T.yo ? /*#__PURE__*/React.createElement(React.Fragment, null, T.yo.curador && /*#__PURE__*/React.createElement("button", {
    className: "boton",
    onClick: () => setCapa("curaduria"),
    title: "Banco de etiquetas"
  }, /*#__PURE__*/React.createElement(Glifo, {
    n: "lapiz",
    t: 16
  })), enPapelera.length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "boton",
    onClick: () => setCapa("papelera"),
    title: "Tu papelera"
  }, /*#__PURE__*/React.createElement(Glifo, {
    n: "papelera",
    t: 16
  })), /*#__PURE__*/React.createElement("button", {
    className: "boton fantasma",
    onClick: () => db.auth.signOut(),
    title: "Salir"
  }, /*#__PURE__*/React.createElement(Avatar, {
    perfil: T.yo
  }))) : /*#__PURE__*/React.createElement("button", {
    className: "boton",
    onClick: () => setCapa("entrar")
  }, "Entrar")), hayFiltro && /*#__PURE__*/React.createElement("div", {
    className: "barra",
    style: {
      paddingTop: 0,
      background: "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "contador"
  }, lista.length, " de ", vivos.length, f.orden !== "reciente" && " · " + ORDENES.find(o => o[0] === f.orden)[1].toLowerCase()), /*#__PURE__*/React.createElement("button", {
    className: "boton fantasma chica",
    onClick: () => {
      setF(FILTROS_VACIOS);
      setBusqueda("");
    }
  }, "Quitar filtros")), T.fallo && /*#__PURE__*/React.createElement("div", {
    className: "centrado"
  }, /*#__PURE__*/React.createElement("h3", null, "No se pudo cargar el tablero"), /*#__PURE__*/React.createElement("p", null, T.fallo), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "boton",
    onClick: T.cargar
  }, "Volver a intentar"))), T.cargando && /*#__PURE__*/React.createElement(Cargando, null), !T.cargando && !T.fallo && lista.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "centrado"
  }, /*#__PURE__*/React.createElement("h3", null, hayFiltro ? "Nada con esos filtros" : "El tablero está en blanco"), /*#__PURE__*/React.createElement("p", null, hayFiltro ? "Probá quitando alguno, o cambiá «Todas» por «Cualquiera» en las etiquetas." : "Acá van a ir las citas, imágenes, videos y hallazgos que vayan armando la línea de la editorial. Alguien tiene que poner el primero.")), !T.cargando && lista.length > 0 && /*#__PURE__*/React.createElement("main", {
    className: "muro"
  }, lista.map((c, i) => /*#__PURE__*/React.createElement(Card, {
    key: c.id,
    c: c,
    indice: i,
    autor: T.porId[c.autor_id],
    etiquetas: c.etiquetaIds.map(id => T.etiquetaPorId[id]).filter(Boolean),
    onAbrir: () => setAbierto(c),
    onEtiqueta: id => {
      setF(p => ({
        ...p,
        etiquetas: p.etiquetas.includes(id) ? p.etiquetas : [...p.etiquetas, id]
      }));
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    },
    onEco: () => eco(c),
    puedeEco: !!T.yo && T.yo.id !== c.autor_id,
    tengoEco: !!T.yo && c.ecoIds.includes(T.yo.id)
  }))), T.yo && /*#__PURE__*/React.createElement("button", {
    className: "flotante",
    onClick: () => {
      setEditando(null);
      setCapa("publicar");
    }
  }, /*#__PURE__*/React.createElement(Glifo, {
    n: "mas",
    t: 17
  }), " Agregar contenido"), capa === "filtros" && /*#__PURE__*/React.createElement(HojaFiltros, {
    f: f,
    setF: setF,
    perfiles: T.perfiles,
    banco: T.etiquetas,
    onCerrar: () => setCapa(null),
    onLimpiar: () => {
      setF(FILTROS_VACIOS);
      setBusqueda("");
    }
  }), capa === "entrar" && /*#__PURE__*/React.createElement(HojaEntrar, {
    onCerrar: () => setCapa(null),
    avisar: avisar
  }), capa === "publicar" && /*#__PURE__*/React.createElement(HojaPublicar, {
    banco: T.etiquetas,
    editando: editando,
    avisar: avisar,
    onCerrar: () => {
      setCapa(null);
      setEditando(null);
    },
    onListo: async () => {
      setCapa(null);
      setEditando(null);
      setAbierto(null);
      await T.cargar();
    }
  }), capa === "paleta" && /*#__PURE__*/React.createElement(HojaPaleta, {
    contenidos: T.contenidos,
    banco: T.etiquetas,
    perfiles: T.perfiles,
    onCerrar: () => setCapa(null),
    onEtiqueta: id => setF(p => ({
      ...p,
      etiquetas: [id]
    }))
  }), capa === "curaduria" && /*#__PURE__*/React.createElement(HojaCuraduria, {
    banco: T.etiquetas,
    onCerrar: () => setCapa(null),
    recargar: T.cargar,
    avisar: avisar
  }), capa === "papelera" && /*#__PURE__*/React.createElement(HojaPapelera, {
    mios: enPapelera,
    banco: T.etiquetas,
    porId: T.porId,
    onCerrar: () => setCapa(null),
    recargar: T.cargar,
    avisar: avisar
  }), capa === "proyeccion" && /*#__PURE__*/React.createElement(Proyeccion, {
    lista: lista,
    porId: T.porId,
    onCerrar: () => setCapa(null)
  }), abierto && /*#__PURE__*/React.createElement(Ficha, {
    c: T.contenidos.find(x => x.id === abierto.id) || abierto,
    autor: T.porId[abierto.autor_id],
    banco: T.etiquetas,
    contenidos: T.contenidos,
    porId: T.porId,
    yo: T.yo,
    onCerrar: () => setAbierto(null),
    onAbrir: x => setAbierto(x),
    onEtiqueta: id => setF(p => ({
      ...p,
      etiquetas: [id]
    })),
    onEditar: c => {
      setEditando(c);
      setCapa("publicar");
    },
    onPapelera: papelera,
    onDestacar: destacar,
    onEco: eco
  }), /*#__PURE__*/React.createElement(Nota, {
    texto: nota,
    onFin: () => setNota(null)
  }));
}

/* Es el error de instalación más frecuente, y sin este aviso la página queda
   en blanco sin explicar por qué. Va fuera de App para no alterar el orden de
   los hooks. */
function SinConfigurar() {
  return /*#__PURE__*/React.createElement("div", {
    className: "centrado"
  }, /*#__PURE__*/React.createElement("h3", null, "Falta un paso de configuraci\xF3n"), /*#__PURE__*/React.createElement("p", null, "El archivo ", /*#__PURE__*/React.createElement("code", null, "config.js"), " todav\xEDa tiene los textos de ejemplo. Hay que reemplazarlos por la URL del proyecto de Supabase y la clave Publishable. Est\xE1 explicado en la gu\xEDa de instalaci\xF3n, en la Parte 1."));
}
ReactDOM.createRoot(document.getElementById("raiz")).render(CONFIGURADO ? /*#__PURE__*/React.createElement(App, null) : /*#__PURE__*/React.createElement(SinConfigurar, null));