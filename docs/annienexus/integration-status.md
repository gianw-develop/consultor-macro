# AnnieNexus — base común de integración

## Refinamiento publicado — menor altura de mini tarjetas (01/10/2026)

Aplicación `7015fac`, Vercel Ready `dpl_CvY3xVuMP6QrR1J8Afd14nFEudQn`, https://consultormacro.com/annienexus. Cambio exclusivamente CSS de la cinta: padding vertical 10→5 px, separación vertical 6→2 px e interlineado de fechas 1,3→1,2. Mínimos CSS 110→92 px escritorio y 108→90 px móvil; el contenido determina una altura real aproximada de 118→99 px en escritorio y 113→94 px en móvil (comparación visual de capturas a escala 2×, cerca del 16 %). Anchos 255/240 px conservados, cifras digitales 26/23 px, variaciones 17/16 px y velocidad 100 s intactos. No se cambian otras tarjetas de la plataforma.

Compilación y TypeScript local/Vercel correctos. QA Chrome sobre producción, escritorio y móvil 390×844 a zoom normal: contenido sin recortes verticales, controles de pausa y ayuda conservados. Capturas: `produccion-cinta-altura-reducida-escritorio.jpg` y `produccion-cinta-altura-reducida-movil.jpg` en `output/annienexus/indicadores-ticker-2026-10-01/`. Datos y colores sin cambios. Sin push a GitHub.


## Refinamiento publicado — cifras digitales más grandes (01/10/2026)

Aplicación `3b5fec4`, Vercel Ready `dpl_EaEpAyUkQ6heg7TkjkQbHY4AX2Bk`, https://consultormacro.com/annienexus. Cifras principales de la cinta a 26 px en escritorio y 23 px en móvil; variaciones secundarias a 17/16 px. Tipografía digital monoespaciada de sistema (ui-monospace, SFMono, Menlo y alternativas), peso 500 y números tabulares. No se redistribuyen fuentes ni se cambia la tipografía del resto de la web. Nombres a 13 px, fechas a 11 px, comparaciones en la fuente común. Los niveles conservan blanco y las variaciones el color por signo; sin resplandores. Altura mínima de tarjeta 110/108 px, sin ampliar el ancho.

Lint, TypeScript y compilaciones local/Vercel correctos. QA visual Chrome a zoom normal en escritorio y emulación móvil 390×844; cifras, fechas y variaciones legibles. Botón pausa/reanudar conservado y comprobado. Evidencia nueva: `produccion-cifras-digitales-escritorio.jpg` y `produccion-cifras-digitales-movil.jpg` en `output/annienexus/indicadores-ticker-2026-10-01/`. Datos, cálculos e indicadores conservados; Dow pendiente de proveedor. Publicación desde local, sin push a GitHub.


## Refinamiento publicado — cinta en mini tarjetas (01/10/2026)

Última versión: `df8ccbe`, Vercel Ready `dpl_6tp8fkufKKmzg7digsWrm7JDejYx`, https://consultormacro.com/annienexus. Conserva todos los indicadores de la revisión anterior y presenta la cinta mediante mini tarjetas sobre fondo navy, bordes sutiles, nombres y niveles blancos, fechas azul gris. Solo las variaciones con signo usan verde (positivo) o rojo (negativo); cero/sin comparación no reciben esos colores. Solicitudes: nivel 197.000 blanco y −1.000 rojo frente al anterior revisado. ISM precios: 77,9 blanco y +6,8 puntos verde.

Ayuda «ⓘ Color»: «Color indica subida o bajada, no impacto favorable o desfavorable». Movimiento lento y controles de pausa conservados; sin colores de tarjeta saturados. Chrome de producción: escritorio y móvil 390×844, ayuda y pausa/reanudar verificados. Alternativa estática de mini tarjetas comprobada localmente con movimiento reducido. Lint, TypeScript y compilaciones local/Vercel correctos. Capturas adicionales `produccion-mini-tarjetas-escritorio.jpg`, `produccion-mini-tarjetas-movil-info.jpg` y `local-mini-tarjetas-movimiento-reducido.jpg` en la misma carpeta de evidencia. Dow sigue pendiente de proveedor; datos editoriales fechados, no en vivo. Sin push a GitHub.

## Publicación vigente — Mis indicadores adelantados y cinta (01/10/2026)

Publicado en https://consultormacro.com/annienexus. Aplicación `dab9bd7`, Vercel Ready `dpl_HD9dRsjbxiU8ETQWzJpeg4uiAcNh`. «Mis indicadores adelantados» agrupa solicitudes, ventas reales y crecimiento semestral de M1 real, con explicación breve y métodos plegables. Sin Gregory visible dentro del nuevo bloque; curso, biblioteca y Formación conservados. PIB/IPC debajo como contexto; CLI/LEI separados de CEI/NFP y etiquetados según su función.

Solicitudes: ocho valores visibles, azul para iniciales y amarillo para media. Ventas: últimos tres meses publicados (junio/julio/agosto), porcentajes mensuales y tabla; septiembre pendiente, sin marzo=100. M1: +1,16 % febrero→agosto frente a +1,71 % enero→julio, cálculo exacto con M1SL/CPIAUCSL, hueco de abril por IPC ausente y ruptura de definición de mayo de 2020 controlada. Corte revisado, no histórico en tiempo real.

«Qué cambió» sustituido por cinta «Últimos datos publicados · no en vivo», con fechas, pausa por botón/ratón/foco y presentación estática en movimiento reducido. Tipo objetivo Fed 3,75–4,00 %, dato diario del 1/10. Dow «Cotización pendiente»: falta proveedor con autorización de redistribución. No se inventa precio ni conexión en vivo.

Diez pruebas de cálculo/calendario, lint, TypeScript y builds local/Vercel correctos. QA real en Chrome sobre producción: escritorio y móvil 390×844; ocho etiquetas, meses únicos, tabla, gráfico M1 y apertura/cierre del método; botón pausa/reanudar comprobado. Movimiento reducido verificado localmente con emulación de Chrome y corrección de recorte. Evidencia: `output/annienexus/indicadores-ticker-2026-10-01/`, seis capturas de producción, una local y `production-checks.json`. Informe completo: `research/ANNIENEXUS-INDICADORES-TICKER-2026-10-01.md` (copia en docs/annienexus). Publicación desde local, sin push a GitHub. AWNexus/AWN, mínimo de contraseña 8 y curva ampliada preservados.

## Publicación vigente — pilares económicos y agenda compacta (01/10/2026)

Publicado en https://consultormacro.com/annienexus. Commit de aplicación `de940dd` (incluye `04dc55b` y `2ccc19c`), Vercel Ready `dpl_FvFNMKwAtbAUQ7d48s8sCcJPvAZy`. PIB conservado; nuevas tarjetas de IPC, ventas nominales y reales y solicitudes semanales de septiembre. Comparaciones, gráficos, fechas, revisiones, método y fuentes consultables. Agenda secundaria plegada por defecto: tres resultados verificados del 1/10 y dos publicaciones pendientes del 2/10. Qué cambió muestra 197.000 solicitudes, anterior revisado 198.000, diferencia −1.000; media de cuatro semanas 200.000. No sustituye el empleo mensual.

Ventas de agosto: +1,13 % nominal y +0,73 % real calculado. Se usan RSAFS revisado tras el 28/09 y CPIAUCSL del mismo mes, ambos ajustados por estacionalidad; división exacta, no resta de porcentajes. La serie RRSFS antigua no se mezcla con las cifras revisadas. IPC general como deflactor aproximado, datos faltantes sin rellenar y lecturas condicionales. Fuentes consultadas el 1/10 a las 17:01 Madrid; actualización editorial, no en vivo. Detalles y límites en el informe de pilares del 1/10.

Seis pruebas de calendario/cálculo, lint, TypeScript y compilaciones local/Vercel correctos. QA visual real en Chrome sobre producción: escritorio, móvil 390 × 844 (cuatro tarjetas y agenda), intermedio 900 × 844 (IPC y ventas). Detalles de ventas, ISM y construcción abiertos y verificados; gráficos y cifras legibles sin solapamientos observados. Evidencia: `output/annienexus/pilares-2026-10-01/`, once capturas y `production-checks.json`. AWNexus/AWN, mínimo de contraseña de 8 y curva de cinco plazos ampliada conservados. Publicación local sin push al repositorio público. Historial anterior a continuación.

## Publicación vigente — curva ampliada hacia la derecha (01/10/2026)

Publicado en https://consultormacro.com/annienexus. Commit `0a7d432`, Vercel Ready `dpl_xodkc9khBRqHbXwcBKTzJD5J7kkT`. Margen derecho del SVG reducido de 32 a 12 unidades; separación entre gráfico y panel lateral de 16 a 10 px en escritorio. Último porcentaje alineado por su extremo derecho para evitar recortes. El espacio entre 30A y el separador baja aproximadamente de 48 a 22 px. Se conservan los cinco plazos, porcentajes, fuente, fecha y cálculos; ajuste exclusivamente de presentación.

Lint, TypeScript y compilaciones local/Vercel correctos. Verificación visual real en Google Chrome sobre producción: escritorio, tableta 900 × 844 y móvil 390 × 844, sin etiquetas recortadas ni solapamientos; también comprobado localmente a 320 px. Evidencia en `output/annienexus/curva-margen-derecho-2026-10-01/`: tres capturas publicadas y `production-checks.json`. Marca AWNexus, icono AWN y mínimo de contraseña de 8 caracteres conservados. Publicación desde local, sin push al repositorio público. Las publicaciones anteriores se conservan a continuación como historial.

## Publicación vigente — curva única con cinco plazos (01/10/2026)

Decisión final del usuario, transmitida por Master: mostrar exclusivamente **2A, 5A, 10A, 20A y 30A**, una sola curva y porcentajes permanentes junto a cada punto. Sustituye las peticiones intermedias de diez plazos y comparación mensual. Selector, segunda curva y segunda leyenda retirados. Datos completos y cálculos internos conservados; no se modificó la fuente ni se implementó comparación mensual.

Publicado en https://consultormacro.com/annienexus, commit `d660814`, Vercel Ready `dpl_6zHKyRuuJ7W375vUcRhxxj7mFvk4`. Último corte cargado: 30/09/2026; porcentajes mostrados 4,88 %, 5,09 %, 5,29 %, 5,68 % y 5,64 %. No se actualizó el corte ni se afirmó dato en vivo. Diferencial 10A − 2A preservado en +0,41 pp. Avisos de fuente, antigüedad y ejemplo hipotético conservados. Logo reducido del acceso y contraseña mínima 8 conservados.

Lint, TypeScript y compilaciones local/Vercel correctos. Comprobación de HTML local: exactamente cinco puntos/etiquetas, valores coincidentes con fuente, una serie, sin selector. QA visual REAL en Google Chrome sobre el dominio con sesión existente: escritorio, tableta 900 × 1000 y móvil 390 × 844. Cinco porcentajes visibles a la vez, sin solapamientos ni desplazamiento horizontal. Evidencia en `output/annienexus/curva-cinco-plazos-2026-10-01/`: tres capturas publicadas, `local-checks.json` y `production-checks.json`. Acceso anónimo a apuntes sigue dando 401. Sin crear cuentas, cambiar credenciales ni publicar código en GitHub.

## Ajuste publicado — tamaño del logo de acceso (01/10/2026)

Commit `20ec7a0`, producción Ready `dpl_CQosF3NGZ2enL8oKZjKTe1sV659J`, https://consultormacro.com/acceso. Logo de acceso a 215 px en escritorio/tableta y 180 px en móvil, alineado a la izquierda y con separación del título conservada. Antes se midieron 429,969 px en Chrome; la hoja publicada anterior no incluía las reglas de marca. Publicación reconstruida sin caché; hoja nueva `15g_p70x1mh1z.css` comprobada con ambas anchuras. Solo se editaron las dos anchuras de acceso; geometría, colores, favicon AWN y mínimo de contraseña de 8 caracteres conservados.

Lint y compilación local/Vercel correctos. Revisión visual real con Google Chrome en escritorio y simulación de tableta (900 × 1000) y móvil (390 × 844): marca sin recortes, proporciones y alineación correctas. Evidencia: `output/annienexus/logo-acceso-reducido-2026-10-01/` (tres capturas y `production-checks.json`). Sin push al repositorio público; sin cambios de cuentas ni credenciales.

## Publicación vigente — AWNexus y mínimo de 8 caracteres (01/10/2026, 15:43 Madrid)

Ambos cambios solicitados publicados en https://consultormacro.com/acceso. Commit de aplicación `6875e8d`, despliegue Ready `dpl_4DGfBCkV2Vig35sVuT768Jq4qH6S`. Marca vectorial AWNexus con AW entrelazado, cian, Nexus fino e icono AWN; componente común en acceso, navegación y pie, metadatos/favicon actualizados. No cambian nombres técnicos, rutas, cuentas ni datos. Cuatro variantes SVG clara/oscura publicadas y comprobadas por igualdad binaria.

Parche password-minimo-8 aplicado en formulario y API, con ayuda visible. Producción rechaza 7 caracteres; JavaScript servido usa mínimo 8. Frontera 7/8 probada con proveedor simulado, sin crear cuenta ni contraseña real. Biblioteca y apuntes conservan autorización (401 sin sesión). Cinco pruebas de autenticación, lint, TypeScript y compilaciones local/Vercel correctos.

Revisión visual REAL de producción completada en Google Chrome mediante controles nativos; la conexión de extensión seguía fallando. Captura de registro, logo y mínimo 8: `output/annienexus/awnexus-publicacion-2026-10-01/registro-publicado.png`. Pruebas HTTP: `production-checks.json` en esa carpeta. No afirmar registro real ni lectura/guardado de cuenta personal: esos pasos siguen a cargo del usuario. La revisión anterior pendiente de la pantalla de acceso queda superada por esta comprobación.

## Antecedentes

## Producción vigente — 1 de octubre de 2026, 14:23 (Madrid)

**Publicada en https://consultormacro.com/acceso.** Vercel Ready, dominio resuelve al despliegue `dpl_6SUc6dvijjK52SvKi6FFV8j7ACHU`, commit de aplicación `80f5890` (incluye curva ampliada `87584ff` y acceso/tipografía `1af56fd`). Publicada desde local; sin push al remoto público. Proyecto existente consultor-macro, sin nuevos servicios.

Correo inicial indicado por el usuario configurado en ANNIENEXUS_ALLOWED_EMAILS local y Production, junto con las dos variables públicas de Supabase. No hay ANNIENEXUS_LOCAL_PREVIEW en Vercel. SITE_PASSWORD histórica preservada pero no concede acceso.

Verificación en el dominio real: acceso 200 con formulario; páginas privadas 307 hacia acceso; apuntes, biblioteca, imágenes y optimizador 401 sin sesión, incluso con cookies antiguas/cabeceras arbitrarias. Solicitud inválida o correo fuera de lista 400; origen externo 403. Respuestas privadas sin caché. Supabase email activo, confirmación requerida y registro habilitado. No se creó ninguna cuenta ni contraseña, ni se confirmó un correo manualmente.

**Pendiente del usuario:** abrir el enlace en Chrome, elegir «Primer acceso · crear mi cuenta», introducir su correo autorizado y una contraseña propia de al menos 12 caracteres, confirmar el mensaje recibido y entrar. Pendiente verificar entrega del correo, flujo completo de sesión y guardar/recargar un apunte con su cuenta real. La conexión de control con Chrome dejó de responder (tres intentos agotados); no hay captura nueva ni QA visual de producción. Las capturas anteriores son locales, no pruebas del dominio.

Agenda expresamente fechada: horarios revisados el 01/10 a las 10:02 Madrid, resultados posteriores sin incorporar. El reloj solo cambia a «Resultado por verificar»; no confirma publicación. PIB con carga directa autenticada, sin optimizador que pierda cookies. Compilación local y Vercel, TypeScript y lint correctos.

Evidencia técnica: `output/annienexus/cierre-2026-10-01/production-http.json`, `production-auth-checks.json` y `deployment.json`. Recuperación anterior: `dpl_J7VkzKF1VdgwSQCUNA84wgmHuxjN`, tag local `recovery/consultormacro-production-20261001`. Mantener el acceso privado; no cambiar permisos para completar QA.

## Historial anterior al despliegue

## Actualización vigente — acceso privado y tipografía, 1 de octubre

**No publicado. Único dato pendiente del usuario: correo para ANNIENEXUS_ALLOWED_EMAILS.** La pregunta ya está enviada; no se inventa ni se obtiene de otras cuentas. La primera contraseña y confirmación de correo las completará el usuario. No existe aún un inicio de sesión real validado de extremo a extremo.

- Supabase ConsultorMacro `dqvhztcmusoecbacyfge` accesible. Se inspeccionó vacío: 0 usuarios, 0 tablas públicas, 0 buckets. Migración `supabase/migrations/202610010001_annienexus_notes.sql` aplicada: notas por propietario, acceso anónimo denegado, máximo 50, sin permiso UPDATE. Pruebas SQL de aislamiento y capacidad/importación atómica correctas; transacciones revertidas, 0 usuarios y 0 apuntes después. Evidencia `supabase-isolation.*` y `supabase-capacity.*`.
- URL de sitio `https://consultormacro.com`; único retorno `https://consultormacro.com/auth/callback`. No comodines. Conexión local con clave publicable, sin clave administrativa. Cookies HttpOnly, Secure en producción, SameSite=Lax; verificación del usuario en servidor y correo confirmado + lista explícita. Origen canónico de producción usado para solicitudes y retornos.
- Vercel CLI ya autenticada como `breanw-8303`. Checkout vinculado al proyecto existente `prj_2kaPqUN5oHjlQTzFl28JCoAke4yx`. Guardadas únicamente NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en Production. SITE_PASSWORD preservada. Falta ANNIENEXUS_ALLOWED_EMAILS. No despliegue ni push.
- Biblioteca: 16 recursos trasladados de public a private/learning; entrega mediante ruta autenticada sin caché. Manifiesto de compilación incluye los 16 archivos únicos. Igualdad binaria del recurso servido comprobada. Los 12 documentos se entregan desde servidor. El repositorio sigue siendo público: no subir esta rama ni su historial.
- Tipografía solicitada: Roboto Condensed, títulos de peso 300 y menor tamaño, sin estiramiento artificial. Source Sans 3 para texto. Licencias locales. Aplicada a Principal, Cerebro, Formación, Radar y acceso. Comprobada en Chrome a 1728, 900 y 390 px; sin desbordamiento global. Tabla Radar conserva desplazamiento interno horizontal en móvil.
- Compilación, TypeScript y lint correctos. 58 pruebas acumuladas (54 previas + 4 autenticación); las 12 de acceso/contratos/apuntes repetidas tras corregir adaptación de petición y origen interno de Next.js. Prueba HTTP `scripts/check-private-access.mjs`: páginas privadas redirigen al acceso, API/recursos/optimizador devuelven 401, orígenes ajenos 403, cuerpos inválidos 400; cookies antiguas/cabeceras arbitrarias no autorizan. Con VERCEL=1 el flag local no abre acceso. Evidencia `auth-runtime.json`.

La integración en código y las políticas de base están verificadas por separado. Falta la prueba real registro → confirmación → entrada → guardar/recargar apuntes → salida, y comprobación del dominio tras publicar. No confundir la vista previa local con producción.

## Antecedente del 1 de octubre — antes de conectar Supabase

PIB/agenda integrados, actualización oficial del Tesoro hasta 30/09. Lint/build y 54 pruebas correctas. Acceso Vercel en Chrome comprobado; Supabase sin sesión/proyecto identificado y sin base vinculada. No se ha desplegado. El remoto es público: no hacer push de la biblioteca privada. Detalle y recuperación en `release-2026-10-01.md`.

## Estado vigente: datos y recursos locales (30/09/2026)

Principal consume cortes oficiales mediante `macro-loader.ts`: conectores OCDE/BLS/Tesoro y lectura manual LEI/CEI. `npm run data:refresh` archiva originales, fechas, hashes y revisiones; no hay actualización recurrente. Default real; ejemplos separados. Cuadrante aprobado intacto con corte independiente. Ver `macro-data.md`.

Formación resuelve 21 enlaces y 16 recursos con procedencia, muestra imágenes bajo demanda y reinicia el lector al cambiar documento. Copia/restauración local de apuntes verificada; no hay nube. Biblioteca entregada desde página de servidor, no importada por el módulo cliente.

Cerebro: misma geometría, 15,7 MB de búfer frente a 47,3; descarga 11% menor; pausa/visibilidad y límite 30 fps. Canales siempre educativos y condicionales.

`src/proxy.ts` cierra todas las rutas y recursos con 503 salvo `ANNIENEXUS_LOCAL_PREVIEW=1`; `npm run preview` lo activa ligado a 127.0.0.1. No usarlo en producción. Las API conservan además autorización real cerrada por defecto incluso en preview. Supabase, proveedor de bolsa, derechos de distribución y validación del motor siguen pendientes; no hay despliegue.

## Historial anterior (las descripciones inferiores pueden estar sustituidas)

30/09/2026. Rama local `codex/annienexus-rebuild-20260930`; base anterior recuperable `7d26dc8`. La vista previa combina Principal, Cerebro, Formación y Radar con una única instancia de AppShell en el layout raíz. No hay push ni publicación.

## Contrato 0.2.0

UTC ISO para fechas. `generatedAt` es la creación de respuesta; `dataAsOf` es el corte real de datos. Un corte desconocido es null. `unavailable` no equivale a neutral ni a mercado mixto; una tesis sin evaluar usa `not_evaluated`. Fuentes y advertencias siempre presentes. Observación, hipótesis y demostración son categorías distintas.

- `GET /api/annienexus/context?horizon=today|week|one_to_three_months|three_to_six_months`
- `GET /api/radar/observations?assetClass=stocks|crypto&horizon=today|week|one_to_three_months|three_to_six_months` — resultados descriptivos
- `GET /api/radar/opportunities?assetClass=stocks|crypto` — hipótesis de investigación
- `GET /api/radar/health`

Las cuatro rutas responden 503 sin datos privados hasta conectar un proveedor de sesión real. No aceptan SITE_PASSWORD ni la cookie antigua. Un proveedor fallido cierra con 503, usuario anónimo o sesión caducada con 401 y falta de permiso con 403. Los usuarios de pruebas no se usan en el servidor.

## Radar

La página `src/app/radar/page.tsx` usa `RadarWorkspace` dentro del marco común. La entrega de Radar `22ea6a3` está integrada como `b1e0183`; sus módulos `observations.ts`, `coinbase.ts` y `service.ts` producen observaciones descriptivas conforme al contrato 0.2.0.

La ruta de observaciones autentica antes de validar parámetros y ejecutar el colector. En el estado actual no llama a fuentes porque el proveedor de identidad no está configurado. Cuando se configure con permisos, el adaptador consultará BTC/ETH/SOL en Coinbase, tres peticiones acotadas de velas diarias completas sin claves ni órdenes. Bolsa devuelve registros no disponibles. `context` sigue siendo null hasta disponer de contexto macro verificado.

La interfaz separa ejemplos didácticos de la petición real, cancela peticiones al cambiar mercado/horizonte y muestra el 503 como indisponibilidad. Lista, mapa, filtros, hipótesis condicionales y apuntes funcionan localmente. No hay oportunidades calculadas ni backtest. La ruta de oportunidades permanece reservada; health informa disponibilidad degradada tras autenticar.

El motor describe variación de cierre a 1, 7, 30 o 90 días naturales según el horizonte. No son rentabilidades ajustadas por dividendos, costes o desdoblamientos ni una tesis macro. `asOf` y `availableAt` se conservan separados y no se rellenan con fechas inventadas. Calidad y antigüedad se mantienen por registro.

## Contenido y almacenamiento

Formación importa 12 documentos como copias de lectura; el manifiesto conserva rutas, fechas y hashes. No existe sincronización automática con Master ni Course Lab. Las agujas, curva e historias siguen siendo DEMO. `indicator-readiness.md` conserva la matriz documental y los diez requisitos para datos reales.

El cuadrante incluye un **corte manual provisional del 30/09/2026, 15:02 CEST**, independiente del contexto API y de DEMO. Es una interpretación cualitativa con fuentes, no una conexión en vivo: ambos ejes mixtos, sin coordenadas ni cruce confirmado. El encabezado común indica «Vista previa · sin datos en vivo»; cada módulo muestra su procedencia. No se envía esta interpretación automáticamente al Radar ni al motor central. Ver `quadrant.md`.

Apuntes en localStorage, clave `annienexus.notes.v1`, límite 50 apuntes y 5000 caracteres por apunte. Al alcanzar el límite se rechaza el nuevo apunte con mensaje y se conserva el borrador; no se eliminan apuntes antiguos automáticamente. No hay aislamiento por usuario ni recuperación en nube. Supabase permanece como esquema lógico, sin migración ejecutada.

## Antes de publicar

Configurar identidad real y acceso a toda la biblioteca, revisar derechos de distribución de apuntes/recursos, conectar datos con sus licencias/fechas/revisiones, validar datos de bolsa e historia del motor, optimizar el recurso 3D y verificar copia de seguridad y recuperación. El cierre de las API no protege por sí solo las páginas locales ni los documentos incluidos en sus archivos JavaScript. No publicar esta vista previa como plataforma terminada.


## Verificación y base técnica

Next y eslint-config-next 16.3.7. Último npm audit: 0 vulnerabilidades conocidas. Lint, TypeScript y compilación correctos. Foundation 4/4; Radar 24/24, incluidas ausencia de datos, calidad, cronología y contrato. El modelo 3D usa conexiones pregeneradas sobre geometría HRA y carga bajo demanda. La fidelidad se compara mediante capturas normales del viewport, no fullPage, a 1536 × 1024 y se prueba adaptación a 900 y 390 px.

Cuadrante vigente: mapa completo de `gregory-mentoria-8-resumen-final.pdf`, página 3, sustituyendo las composiciones previas. Cuatro zonas con características, activos, explicaciones y curvas visibles; brújula central con círculo, punto en el borde y giro didáctico único de cinco segundos. Pausa, reanudación, repetición manual, vuelta a fecha y movimiento reducido (sistema + control persistente). La composición aprobada ahora usa el tema oscuro común. Debajo del cuadrante no quedan bloques de contenido. El indicador abre evidencia en un diálogo. Una proyección descriptiva de CLI de EE. UU. e IPC sitúa un punto sectorial estimado, con ventana de tres meses y datos hasta agosto consultados el 30/09 a las 17:28 CEST. Es independiente del corte editorial mixto; no confirma régimen ni cruce y no anima una trayectoria real. Once pruebas correctas; cálculo, fuentes, contradicciones y límites en `quadrant.md`.
