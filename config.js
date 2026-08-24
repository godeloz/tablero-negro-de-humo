/* ============================================================================
   NEGRO DE HUMO · Tablero de inspiración
   config.js — Configuración
   ----------------------------------------------------------------------------
   Este es el ÚNICO archivo que hay que editar.
   No hace falta abrir ningún otro.
   ============================================================================ */
 
window.CONFIG = {
 
  /* 1 · URL del proyecto de Supabase.
        Supabase → Project Settings → Data API → Project URL
        Se ve así:  https://abcdefghijk.supabase.co                          */
  SUPABASE_URL: "https://excvqsjonnccgheqggpc.supabase.co",
 
  /* 2 · Clave pública (Publishable key).
        Supabase → Project Settings → API Keys
                 → "Publishable and secret API keys"
                 → sección "Publishable key" → fila "default"
        Empieza con  sb_publishable_...
 
        Usá el botón de copiar, no la selecciones a mano: en pantalla aparece
        cortada con … y se copia incompleta.
 
        Esta clave ESTÁ PENSADA para ser pública. Que quede visible en el
        repositorio de GitHub no es un problema.
        La "Secret key" (sb_secret_...) NO va acá jamás.                     */
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_qNZuj1AC4vJdoTPM7tXi6g_l77rM9q-",
 
  /* 3 · Identidad. Es lo único de la interfaz que se cambia desde acá.       */
  EDITORIAL: "Negro de Humo",
  SUBTITULO: "Tablero de inspiración"
 
};
 