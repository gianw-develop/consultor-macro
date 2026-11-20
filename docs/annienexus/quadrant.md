# Cuadrante oscuro con estimación descriptiva — 30/09/2026

El usuario aprobó la composición del PDF original y pidió recuperar el fondo oscuro de AnnieNexus. Después pidió eliminar todo lo situado bajo el cuadrante y mostrar una estimación económica basada en indicadores reales. Autorización verificada en el chat de voz `01a0f2c7-7bea-7dc0-99f1-f83a8c8e8a58`. Trabajo local; no publicación.

## Composición

Referencia: `gregory-mentoria-8-resumen-final.pdf`, página 3, con contenido de páginas 2, 4 y 5. Se conserva el PDF idéntico, las cuatro zonas, cuatro curvas, características, activos, notas laterales, círculo central y proceso interno. El tema usa la paleta oscura común sin alterar la geometría del mapa.

El cuadrante es el último módulo de Principal. Se retiraron los bloques externos de fase actual, escenarios, evidencia, metodología y «De la observación a la tesis». Pulsar el círculo o «Ver cálculo y fuentes» abre un diálogo nativo: teclado, cierre con Escape, contención del foco y retorno al indicador. Las fechas de DEMO están en la barra superior. Los módulos anteriores no cambian.

## Estimación real: alcance y reproducción

Método local `us-cli-cpi-three-month-sector-v1`. Es una proyección descriptiva de dos series, no el régimen confirmado del Master Market Model ni una posición del precio. No sustituye la interpretación editorial mixta de Course Lab.

- Corte guardado de consulta: 30/09/2026 17:28 CEST. Último mes observado común: agosto de 2026. No hay actualización en vivo.
- X: CLI de Estados Unidos de la OCDE, ajustado por amplitud, agosto menos mayo. `100.9563 − 100.7064 = +0.2499` puntos. Nivel mostrado por separado; 100 representa tendencia, no una tasa de PIB. Dataset publicado según calendario el 7/09; serie consultada el 30/09, susceptible a revisiones.
- Y: variación de la inflación acumulada en dos bloques no solapados de tres meses. IPC general de BLS, tabla A, tasas mensuales ajustadas por estacionalidad: marzo/abril/mayo `0.9, 0.6, 0.5`; junio/julio/agosto `−0.4, 0.1, 0.4`. Cada bloque: `(producto(1 + tasa/100) − 1) × 100`. Resultado aproximado `2.012927 % → 0.0983984 %`, sin anualizar. Publicación 11/09/2026 08:30 EDT.
- La elección de tres meses suaviza ruido; no está validada como pronóstico. La comparación de agosto con julio da aceleración, y se muestra como contradicción. PCE y LEI aportan contraste, no votos adicionales ni pesos ocultos.
- Solo los signos determinan un sector. Se usa su centro geométrico: 45°, 135°, −45° o −135°. Actualmente 135° —zona azul—. El ángulo no mide intensidad, confianza, distancia a una frontera ni velocidad. Ninguna animación real.
- Con datos faltantes, duplicados, no finitos, ajenos a EE. UU., futuros o de meses no comparables se devuelve indisponibilidad. El signo debe sobrevivir al margen de redondeo publicado: ±0.05 puntos por tasa mensual de IPC y 0.01 puntos de diferencia CLI. Un signo ambiguo deja el punto ausente.

Implementación y entradas: `src/modules/annienexus/quadrant-estimate.ts`; auditoría: `quadrant-estimate-inputs-2026-09-30.json`. El JSON preserva la consulta, no las versiones históricas conocidas en cada fecha. Se mantienen por separado las siete observaciones y revisiones del corte editorial de las 15:02.

Fuentes primarias:

- [OCDE: definición, serie y calendario](https://www.oecd.org/en/data/datasets/oecd-composite-leading-indicators-clis.html).
- [OCDE: datos de EE. UU.](https://sdmx.oecd.org/public/rest/data/OECD.SDD.STES,DSD_STES@DF_CLI/USA.M.LI...AA...H?startPeriod=2026-05&endPeriod=2026-08&dimensionAtObservation=AllDimensions&format=csvfilewithlabels).
- [BLS: IPC agosto, tabla A](https://www.bls.gov/news.release/archives/cpi_09112026.htm).
- [BEA: consumo y PCE agosto](https://www.bea.gov/news/2026/personal-income-and-outlays-august-2026).
- [Conference Board: LEI/CEI](https://www.conference-board.org/topics/us-leading-indicators/index.cfm).

Los originales BEA y la respuesta CSV de OCDE se guardaron con huella SHA-256 en `research/quadrant-verification-2026-09-30/recheck/` del proyecto compartido. BLS se verificó con el navegador de investigación; la descarga directa devolvió 403, por lo que no se afirma conservar su HTML.

## Demostración y límites

DEMO conserva siete fechas sintéticas y su función de orientación independiente. Giro ilustrativo único de cinco segundos, pausa/reanudación, repetición manual, vuelta a fecha y movimiento reducido (sistema y control persistente). No se propaga al modo real. Las curvas y activos siguen siendo correspondencias docentes, no reglas de clasificación.

Quedan pendientes un motor de régimen amplio validado, un historial de versiones/publicaciones, trayectoria real y actualización automática. No hay probabilidades, señal de compra/venta, conexión a Radar ni cambios del modelo central. Todo local, sin push, merge, despliegue, Vercel, credenciales ni migraciones.

## Verificación

Lint, TypeScript y build correctos; once pruebas del cuadrante. Las cuatro nuevas pruebas comprueban cálculo con entradas oficiales, ausencia/cronología/país, incertidumbre por redondeo y orientación independiente de magnitud/nivel. Se corrigió una errata en el resultado esperado del cálculo compuesto de la prueba; no cambió la fórmula.

Navegador: geometría del mapa idéntica al aprobado a 1536 px (mapa 1462 × 1198,64; fichas 1094 × 731,44; círculo 144 × 144). Cuatro fichas/curvas; punto real a 135° sin animación; modo DEMO independiente, pausa, reducción de movimiento persistente al cambiar fecha y retorno al corte. Minimizar/restaurar correcto. Diálogo centrado, apertura por Enter, fondo inerte, foco dentro, Escape y botón de cierre con retorno al indicador, siete observaciones retenidas. Sin desbordamiento a 1536/1280/900/390; diálogo móvil sin desbordamiento propio y tablas con desplazamiento interno. Consola sin errores/avisos. Capturas en `output/annienexus/cuadrante-oscuro-estimacion-2026-09-30/` del proyecto compartido.
