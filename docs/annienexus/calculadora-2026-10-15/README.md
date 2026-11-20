# Calculadora de niveles integrada · 15/10/2026

Destino estable: https://consultormacro.com/annienexus/calculadora. Se añade a la navegación de AWNexus, bajo el mismo acceso autorizado. El enlace directo conserva su destino al iniciar sesión mediante una lista cerrada de rutas; no admite redirecciones externas.

Fuente recibida: `output/qqq-cfd-calculator/index.html` + `compact.js`; README inspeccionado. Hashes en source-manifest.json. Se traslada a un componente React y cálculo puro, sin nuevas dependencias, sin iframe ni copia pública que eluda el acceso. Se conservan exactamente SPX → S&P 500 CFD, DIA → Dow CFD, GLD → Oro CFD y QQQ → Nasdaq CFD. No se incorporan las opciones de las versiones antiguas.

Diseño: cuatro filas compactas, un campo por instrumento, salida inmediata, Limpiar, Ajustes y mapa plegados; marco, marca AWN y fuentes del diseño aprobado. Móvil apila la salida debajo del campo y mantiene las cuatro conversiones. El mapa distingue identidad de objetivo/referencia sin dibujar una distancia cuantitativa falsa. Referencia visual de origen inspeccionada en Chrome; marco existente de AWNexus según ANNIENEXUS-DISENO-UNICO.md.

## Comportamiento y límites

SPX conserva diferencia en puntos; DIA, GLD y QQQ trasladan el cambio proporcional. Referencias suministradas del 12/10/2026. No se han actualizado ni afirmado como cotizaciones actuales de OANDA/FTMO. GLD y oro usan cierres diarios de horarios distintos. Ajustes accesibles de ambos precios, estado manual visible y restauración de referencias originales. Sin guardado al recargar/salir. Cálculo auxiliar separado de la biblioteca Gregory y del razonamiento macroeconómico.

Cero, negativos, vacíos, notación científica, separadores de miles ambiguos, referencias ausentes y resultados no finitos no producen estimación. Se acepta coma o punto decimal. Limpiar borra objetivos sin modificar la calibración. Restaurar modifica las referencias, no los objetivos.

## Validación

79 pruebas pasan, incluidas cinco de la calculadora y una de destinos de acceso. Casos conocidos: SPX 7900 → 7900,00; DIA 520 → 52059,79; GLD 380 → 4147,39; QQQ 750 → 30827,47. Coinciden con la implementación compacta original. Calibración manual QQQ 600/24000 con objetivo 750 → 30000. Lint y build correctos. Verificación final de producción completada según el registro siguiente.

## Funciones conservadas y pendientes

Se despliega el estado terminado completo de Principal, Cerebro, Formación, apuntes, Radar y acceso, preservando biblioteca y notas. No hay cambios de contenido del curso ni incorporación de Quantum. Radar sigue sin proveedor de cotizaciones de índices ni reglas de selección conectadas; las tesis no se inventan. La revisión general del Cerebro permanece pendiente. Este despliegue no refresca los datos macro: conserva la comprobación de las 11:34 Madrid del 15/10. Los resultados programados después de ese corte requieren verificación y el reloj pasa a orientación histórica al vencer; no se prolonga por publicar código.

No crear otro proyecto, no cambiar dominio, no hacer git push. Publicación con el CLI Vercel existente y build sin caché.

## Publicación y comprobación final

Código aa3a94b; Vercel READY dpl_7a5Xknae81UKJHCqMBACqyqK9Rmv. Dominio y proyecto existentes, compilación sin caché, sin push. URL inmutable: https://consultor-macro-hrs4wub63-breans-projects-8de55b34.vercel.app.

Google Chrome autenticado: recarga completa de la ruta directa sin 404; cuatro casos conocidos, calibración manual, restauración, rechazo de cero, coma decimal y mapa comprobados. Móvil 390×844 y tablet 768×844 legibles; navegación de cinco pestañas visible tras corregir su espaciado móvil. Consola sin mensajes/incidencias en la revisión. Principal, Cerebro, Formación y Radar cargan y permiten volver a Calculadora; biblioteca y apuntes sin mutación.

Incógnito: redirección a /acceso?next=%2Fannienexus%2Fcalculadora, mensaje específico de calculadora. No se ejecutó un nuevo inicio de sesión completo con credenciales; el destino tras acceso está cubierto por revisión de código y pruebas. La sesión existente abre el enlace directamente.

Evidencia: /Users/gianw/Documents/ChatGPT/Wall Street Visual Intelligence/output/annienexus/calculadora-publicada-2026-10-15/. Informe compartido: research/AWNEXUS-CALCULADORA-PUBLICADA-2026-10-15.md. La captura preview-mobile.png es anterior a la corrección; production-mobile.png contiene la versión final.
