# Agenda AWNexus · semana 5–9 de octubre de 2026

Actualización editorial autorizada por el usuario vía Master el 7/10. Se conservan diseño, navegación, biblioteca, apuntes, datos y reglas del Cerebro. Su revisión vencida el 5/10 no se modifica. La agenda anterior permanece recuperable en Git.

## Datos y fuentes

Fuentes consultadas en Google Chrome nativo; corte 7/10/2026 13:25 Madrid. Se incorporan ISM servicios de septiembre, publicado 5/10: 54,9 frente a 55,4 y precios 74,0 frente a 72,6 (índices de encuesta, no inflación). BEA/Census, comercio de agosto publicado 6/10: déficit 105.600 millones USD frente a julio revisado 92.800; exportaciones +1,4 %, importaciones +4,3 %.

ISM presenta un título de pestaña heredado de 2025; encabezado del informe, tablas y periodos del cuerpo identifican septiembre de 2026 y corroboran esas cifras. Su regla de publicación del tercer día hábil a las 10 ET corresponde al lunes 5. Discrepancia guardada aquí, fuera del texto de producto. BEA conserva julio revisado. No se ha obtenido ni inventado un consenso de previsiones.

El calendario Fed confirma actas del 15–16 de septiembre para el 7/10 a las 20:00 Madrid, sin nueva decisión, y crédito mensual a las 21:00. Su informe disponible sigue midiendo julio, publicado 8/9; agosto se etiqueta como periodo previsto pendiente de confirmar. DOL publica los jueves 8:30 hora del Este y no recoge excepción el 8/10: solicitudes iniciales previstas de semana terminada 3/10. Census confirma mayoristas agosto el 8/10 a las 16:00. Michigan confirma preliminar octubre el viernes 9 a las 16:00 (no jueves 8). BLS confirma IPC septiembre el miércoles 14 a las 14:30, separado en próxima semana.

URLs oficiales y estados están en `src/modules/annienexus/economic-calendar.ts`. Registro de evidencia: `source-evidence.json`. Originales de accesibilidad y capturas locales: `/Users/gianw/Documents/ChatGPT/Wall Street Visual Intelligence/output/annienexus/agenda-2026-10-07/`.

## Funcionamiento y controles

Acceso desde Principal y URL directa `/annienexus#agenda`; panel abierto, detalles plegables, mismo estilo y columnas adaptables. Contadores y próximo evento se derivan del reloj. La hora cumplida solo cambia a «Resultado por verificar»; para «Publicado · verificado» hacen falta resultado, publicación y verificación válidas. Datos futuros no se muestran antes de su verificación. No se crea actualización automática ni vigilancia.

65 pruebas correctas, lint, TypeScript y compilación de producción. Calendario: cambio exacto de hora, metadatos inválidos, conversión Madrid/verano/invierno, Michigan viernes, IPC separado, contadores y datos futuros. Se conservan pruebas de acceso, mínimo 8 caracteres, biblioteca y notas. Chrome local: escritorio 1728 px, tableta 900×844, móvil 390×844; detalles ISM/BEA, fechas y diseño legibles. Consola sin errores; panel Issues muestra una sugerencia sobre dimensiones de imágenes con carga diferida, fuera de los componentes de agenda modificados.

## Publicación comprobada

Aplicación `b5943ea`. Vercel Ready `dpl_4drrzs3EH6JCfnSYFuupFGCwXYAy`, producción https://consultor-macro-6wg0cqeri-breans-projects-8de55b34.vercel.app, alias https://consultormacro.com. Acceso directo comprobado: https://consultormacro.com/annienexus#agenda.

Chrome sobre el dominio real: dos resultados publicados y cinco programados, detalles con agosto/julio revisado y septiembre/agosto, actas 20:00, crédito 21:00, Michigan viernes 9 e IPC siguiente semana. Vista de escritorio y móvil 390×844 legible; consola sin errores. La portada conserva el aviso de revisión económica no vigente. En ventana de incógnito el portal redirige a `/acceso`, sin mostrar la agenda; no se enviaron credenciales. Ventana temporal cerrada, emulación desactivada y Chrome restaurado a escritorio.

Evidencia: `production-desktop.png`, `production-results.png`, `production-mobile-390.png`, `production-anonymous-access.png`, `production-agenda-ax.txt`, en la carpeta local indicada. Verificación de producción concluida el 7/10, antes de las 14:00 Madrid; las siguientes publicaciones de la agenda todavía no habían llegado a su hora. Las comprobaciones no equivalen a una vigilancia ni actualizan automáticamente resultados futuros.

 Sin push a GitHub ni modificaciones de cuentas, notas o base de datos.
