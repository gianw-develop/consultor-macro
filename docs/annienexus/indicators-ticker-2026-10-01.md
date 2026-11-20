# AWNexus — indicadores adelantados y cinta, 1 de octubre de 2026

## Refinamiento publicado — menor altura de mini tarjetas (01/10/2026)

Aplicación `7015fac`, Vercel Ready `dpl_CvY3xVuMP6QrR1J8Afd14nFEudQn`, https://consultormacro.com/annienexus. Cambio exclusivamente CSS de la cinta: padding vertical 10→5 px, separación vertical 6→2 px e interlineado de fechas 1,3→1,2. Mínimos CSS 110→92 px escritorio y 108→90 px móvil; el contenido determina una altura real aproximada de 118→99 px en escritorio y 113→94 px en móvil (comparación visual de capturas a escala 2×, cerca del 16 %). Anchos 255/240 px conservados, cifras digitales 26/23 px, variaciones 17/16 px y velocidad 100 s intactos. No se cambian otras tarjetas de la plataforma.

Compilación y TypeScript local/Vercel correctos. QA Chrome sobre producción, escritorio y móvil 390×844 a zoom normal: contenido sin recortes verticales, controles de pausa y ayuda conservados. Capturas: `produccion-cinta-altura-reducida-escritorio.jpg` y `produccion-cinta-altura-reducida-movil.jpg` en `output/annienexus/indicadores-ticker-2026-10-01/`. Datos y colores sin cambios. Sin push a GitHub.


## Refinamiento publicado — cifras digitales más grandes (01/10/2026)

Aplicación `3b5fec4`, Vercel Ready `dpl_EaEpAyUkQ6heg7TkjkQbHY4AX2Bk`, https://consultormacro.com/annienexus. Cifras principales de la cinta a 26 px en escritorio y 23 px en móvil; variaciones secundarias a 17/16 px. Tipografía digital monoespaciada de sistema (ui-monospace, SFMono, Menlo y alternativas), peso 500 y números tabulares. No se redistribuyen fuentes ni se cambia la tipografía del resto de la web. Nombres a 13 px, fechas a 11 px, comparaciones en la fuente común. Los niveles conservan blanco y las variaciones el color por signo; sin resplandores. Altura mínima de tarjeta 110/108 px, sin ampliar el ancho.

Lint, TypeScript y compilaciones local/Vercel correctos. QA visual Chrome a zoom normal en escritorio y emulación móvil 390×844; cifras, fechas y variaciones legibles. Botón pausa/reanudar conservado y comprobado. Evidencia nueva: `produccion-cifras-digitales-escritorio.jpg` y `produccion-cifras-digitales-movil.jpg` en `output/annienexus/indicadores-ticker-2026-10-01/`. Datos, cálculos e indicadores conservados; Dow pendiente de proveedor. Publicación desde local, sin push a GitHub.


## Refinamiento publicado — cinta en mini tarjetas (01/10/2026)

Última versión: `df8ccbe`, Vercel Ready `dpl_6tp8fkufKKmzg7digsWrm7JDejYx`, https://consultormacro.com/annienexus. Conserva todos los indicadores de la revisión anterior y presenta la cinta mediante mini tarjetas sobre fondo navy, bordes sutiles, nombres y niveles blancos, fechas azul gris. Solo las variaciones con signo usan verde (positivo) o rojo (negativo); cero/sin comparación no reciben esos colores. Solicitudes: nivel 197.000 blanco y −1.000 rojo frente al anterior revisado. ISM precios: 77,9 blanco y +6,8 puntos verde.

Ayuda «ⓘ Color»: «Color indica subida o bajada, no impacto favorable o desfavorable». Movimiento lento y controles de pausa conservados; sin colores de tarjeta saturados. Chrome de producción: escritorio y móvil 390×844, ayuda y pausa/reanudar verificados. Alternativa estática de mini tarjetas comprobada localmente con movimiento reducido. Lint, TypeScript y compilaciones local/Vercel correctos. Capturas adicionales `produccion-mini-tarjetas-escritorio.jpg`, `produccion-mini-tarjetas-movil-info.jpg` y `local-mini-tarjetas-movimiento-reducido.jpg` en la misma carpeta de evidencia. Dow sigue pendiente de proveedor; datos editoriales fechados, no en vivo. Sin push a GitHub.

## Cambio

Bloque «Mis indicadores adelantados»: solicitudes iniciales, ventas minoristas reales y crecimiento semestral de M1 real. Sin Gregory visible en este bloque ni sus métodos; trazabilidad del curso conservada internamente y biblioteca/Formación intactas. PIB e IPC debajo como contexto observado. CLI/LEI distinguidos como indicadores compuestos de señales tempranas; CEI y NFP como contraste presente/empleo.

Cada tarjeta tiene una explicación permanente corta y detalles accesibles «ⓘ Cómo leer». Solicitudes: ocho etiquetas visibles, azul para solicitudes iniciales y amarillo para media de cuatro semanas. Ventas: junio, julio y agosto de 2026, porcentajes mensuales nominales/reales y tabla compacta, sin índice marzo=100. Septiembre pendiente.

«Qué cambió» sustituido por «Últimos datos publicados · no en vivo». Cinta con fechas, pausa mediante botón/ratón/foco, copia visual fuera del árbol accesible y alternativa estática en varias líneas cuando se solicita movimiento reducido. Datos editoriales, no una conexión automática de cotizaciones.

## Cálculos y datos

M1 real = M1SL / CPIAUCSL × 100. Crecimiento en seis meses = (nivel real del mes / nivel real seis meses antes − 1) × 100. No se anualiza. Series mensuales ajustadas por patrones estacionales. Agosto: M1 nominal 19.991,1 miles de millones de USD e IPC 334,131; nivel real 5.983,01265 en poder de compra de la base del IPC. Cambio febrero→agosto +1,16424354 %, frente a enero→julio +1,71397959 %.

La comparación semestral de abril queda vacía porque falta IPC de octubre de 2025. El nivel de abril sí existe; no se interpola ni se dibuja el hueco como cero. El cálculo rechaza ventanas que atraviesen mayo de 2020: M1 incorporó depósitos de ahorro, un cambio de definición que no significa creación equivalente de dinero. El corte revisado actual no reconstruye qué se conocía en cada fecha histórica.

M1 publicado el 22/09/2026; IPC el 11/09/2026; ambos insumos disponibles desde el 22/09. CSV y hashes guardados en data/macro/gregory-m1-2026-10-01/. Consulta 1/10 a las 17:25 Madrid.

Ventas nominales/reales mensuales: junio +0,20/+0,63 %, julio −0,46/−0,53 %, agosto +1,13/+0,73 %. División exacta y mismos meses; no resta aproximada de porcentajes. IPC general como aproximación al ajuste de precios del conjunto de ventas; revisión de ventas del 28/09 conservada.

Solicitudes iniciales / media cuatro semanas: 5/09 207.000/206.250; 12/09 198.000/204.000; 19/09 198.000/202.500; 26/09 197.000/200.000. Publicadas el 1/10. No son la tasa de desempleo ni el empleo mensual.

## Fuentes y límites

- Fed H.6: https://www.federalreserve.gov/releases/h6/20260922/
- M1SL: https://fred.stlouisfed.org/series/M1SL
- CPIAUCSL: https://fred.stlouisfed.org/series/CPIAUCSL
- Cambio de definición: https://www.federalreserve.gov/releases/h6/h6_technical_qa.htm
- IPC ausente: https://www.bls.gov/cpi/additional-resources/2025-federal-government-shutdown-impact-cpi-faq.htm
- Ventas revisadas: https://fred.stlouisfed.org/series/RSAFS
- Solicitudes: https://www.dol.gov/ui/data.pdf (corte preservado en evidencia previa de agenda/pilares).
- Tipo objetivo Fed: https://fred.stlouisfed.org/series/DFEDTARL y https://fred.stlouisfed.org/series/DFEDTARU; 3,75–4,00 % para 1/10, actualización FRED 7:00 CDT / 14:00 Madrid. Dato diario, no cotización intradía.
- Dow: https://fred.stlouisfed.org/series/DJIA exige permiso previo de S&P Dow Jones para reproducción. No hay proveedor con redistribución aprobada conectado. Se publica «Cotización pendiente», sin copiar el cierre ni inventar precio.

Ninguno de los tres indicadores se presenta como predictor universal ni como señal automática de compra/venta. Los demás valores de la cinta reutilizan las publicaciones oficiales verificadas en el informe de pilares/agenda del mismo día.

## Validación y publicación

Commit de aplicación dab9bd7. Diez pruebas de calendario y cálculos superadas; lint, TypeScript y compilación local correctos. QA local Chrome: escritorio y móvil 390×844, ocho etiquetas de solicitudes, meses de ventas, M1 con hueco, detalles mediante Enter y botón pausa/reanudar. La emulación de movimiento reducido detectó un recorte que se corrigió y se volvió a comprobar visualmente.

Publicado en https://consultormacro.com/annienexus, Vercel Ready dpl_HD9dRsjbxiU8ETQWzJpeg4uiAcNh. QA real de producción en Chrome, escritorio y móvil 390×844: ocho etiquetas legibles, ventas con tres meses y tabla, M1 con hueco y método accesible, pausa/reanudar comprobados. Seis capturas de producción guardadas. Sin push al remoto público. Evidencia en output/annienexus/indicadores-ticker-2026-10-01/.
