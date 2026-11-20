# Auditoría de vigencia · 15 de octubre de 2026

La entrega anterior no contrastó la disponibilidad de todos los indicadores. El fallo HTTP 500 de la API OCDE no demostraba que agosto fuese el último mes publicado. El usuario señaló correctamente esa carencia de revisión.

## Hallazgo y corrección

La tabla oficial OCDE, consultada en Google Chrome, ya contiene septiembre. Exportación original archivada en `data/macro/runs/2026-10-15T09-34-18.010Z/oecd-cli.xlsx`, con SHA-256 y metadatos. La web muestra actualización del conjunto el 7/10 a las 16:04:40, sin zona horaria; no se inventa una fecha original de publicación. Se reemplaza toda la ventana diciembre 2025–septiembre 2026 por una sola versión: 27 revisiones de observaciones coincidentes. No se empalman valores antiguos.

| CLI | Agosto revisado | Septiembre | Cambio 3 meses | Cambio 6 meses |
|---|---:|---:|---:|---:|
| EE. UU. | 100,9464 | 100,9993 | +0,2363 | +0,5678 |
| G7 | 100,8630 | 100,9370 | +0,2699 | +0,4923 |
| G20 | 100,1609 | 100,1431 | −0,0609 | −0,1716 |

Importación con Python estándar: XML del Excel, validación de frecuencia mensual, medida CLI, metodología OCDE armonizada y ajuste por amplitud; columnas O/Q/R identificadas por sus cabeceras United States/G7/G20, filas 9–18. Se conserva el original para reproducibilidad. Un control adicional impide que una respuesta posterior del conector con un mes anterior reemplace el último periodo verificado.

## Indicadores que sí mantienen su último periodo

| Indicador | Último periodo disponible en esta comprobación | Publicación | Próxima publicación prevista |
|---|---|---|---|
| LEI y CEI | Agosto | 18/09 | 22/10 |
| M1 | Agosto | 22/09 | 27/10 |
| Ventas minoristas | Agosto | 16/09; FRED actualizado 29/09 | 15/10, 14:30 Madrid |
| PCE y gasto personal | Agosto | 30/09 | 29/10 |
| PIB | Segundo trimestre, tercera estimación | 30/09 | 29/10 |

Fuentes: Conference Board `https://www.conference-board.org/topics/us-leading-indicators`; Fed H6 `https://www.federalreserve.gov/releases/h6/current/default.htm` y calendario de octubre; FRED RSAFS; BEA páginas actuales de PIB e ingresos/gasto personal. Los árboles de accesibilidad de las fuentes y el Excel están en el directorio compartido de auditoría. FRED confirma los niveles de ventas de agosto a enero y del IPC de agosto a mayo: no cambian los cálculos recientes de ventas. Esta auditoría de disponibilidad no equivale a recertificar cada observación histórica ni a reconstruir todas las series desde cero.

IPC de septiembre, empleo de septiembre, solicitudes del 8/10 y Tesoro al 14/10 fueron verificados en la entrega inmediatamente anterior. A la hora de esta auditoría los resultados del 15/10 a las 14:30 Madrid siguen futuros. No se les atribuyen resultados anticipados.

## Presentación y evaluación

Se añade un desplegable de vigencia con periodo observado, publicación/versión y próxima fecha prevista. LEI/CEI, M1 y ventas explican por qué conservan agosto. La agenda próxima incorpora LEI/CEI del 22/10. Comprobar disponibilidad no refecha los cálculos antiguos.

La orientación del reloj se revisa expresamente con septiembre del CLI: sigue provisional a 45 grados. CLI estadounidense mejora con menor incremento mensual; no demuestra aceleración general. Se mantiene la caducidad del 15/10 a las 14:30 Madrid. La evaluación general del Cerebro continúa sin revisión vigente; no se reactiva por esta actualización. El rótulo de datos reunidos ya no dice que esa evaluación esté revisada.

Validación previa: 73 pruebas pasan, ESLint y build de producción correctos; git diff --check limpio. Vista previa de Chrome: CLI G7 septiembre 100,94, periodos de agosto explicados y tabla de vigencia legible. Se publica en el proyecto existente mediante CLI Vercel sin caché y sin git push. Producción verificada en Chrome tras el despliegue.


## Publicación comprobada

Código `c1546e4`. Despliegue Vercel READY `dpl_HJUivfhY1rSvkhKukCXTo6y9bVWn`, sin caché, proyecto existente. Dominio https://consultormacro.com/annienexus y URL inmutable https://consultor-macro-44ln8xuj0-breans-projects-8de55b34.vercel.app.

Verificación directa en Google Chrome autenticado: CLI G7 septiembre 100,94 (3m +0,27; 6m +0,49), cambio de selector a G20 septiembre 100,14 (3m −0,06; 6m −0,17), avisos de agosto en LEI/CEI y M1, tabla de vigencia abierta y evento LEI/CEI del 22/10 a las 16:00 Madrid. Orientación del reloj provisional con septiembre. Evidencia: `production-dashboard.txt`, `production-g20.txt`, `production-vigencia.txt` y `production-vigencia.png` en `output/annienexus/auditoria-vigencia-2026-10-15/` del proyecto compartido. Se deja Chrome en la web publicada con la tabla abierta. No se hizo git push.
