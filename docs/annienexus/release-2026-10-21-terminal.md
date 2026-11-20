# Acabado terminal y resultados visibles — 21/10/2026

## Alcance autorizado
Refinamiento del mockup aprobado, más resaltado de filas solicitado por el usuario. Negro/ámbar, cifras tabulares y tipografías IBM Plex Mono / Sans Condensed autohospedadas (OFL). Sistema compartido en las pantallas existentes. No se utiliza una fuente propietaria de Bloomberg.

La portada conserva PIB/IPC/Fed, lectura causal, cuadrante y riel orientativo, y evidencia. Nuevas tablas visibles: seis meses de CLI para G7/EE. UU./G20, tres semanas de solicitudes iniciales y media de cuatro semanas al seleccionar, y decisiones de la Fed de julio/septiembre. Las solicitudes son semanales, no quincenales. El CLI se expresa en puntos, no en porcentaje de PIB. Las decisiones Fed enlazan sus comunicados oficiales. La fecha de publicación original del CLI no está disponible y se indica.

## Validación
- ESLint sobre los archivos TypeScript modificados: correcto.
- Compilación Next/TypeScript: correcta.
- Pruebas macro existentes: 11/11.
- Chrome, portada: 1536, 900 y 390 px. Selección de señales y CLI mediante ratón, teclado y toque; selección de solicitudes; diálogo y cierre con Escape.
- Revisión visual de Cerebro, Formación, Sectores y Calculadora. Los seis ETF y el gráfico de TradingView cargan; el proveedor registra mensajes de permisos y un 403 del portal de soporte.
- No se alteran los datos del corte salvo añadir la decisión Fed de julio como comparación verificada, ni se renueva la revisión de régimen. No se activa nube ni actualización automática.

## Publicación
Vercel READY: `dpl_8SZFN2zCwETyXbWzDjRvATLN83cW`, commit de implementación `0d0b34f`.
URL: https://consultormacro.com/annienexus
Comprobada en producción la portada, cambios de horizonte y tablas; selección de G20/septiembre y semana del 10/10 muestran los detalles correctos. Acceso autenticado existente conservado. Capturas reales en el workspace: `output/annienexus/propuesta-terminal-2026-10-21/dashboard-publicado-completo.png` y `resultados-publicados.png`. Revisión adicional de la pantalla de acceso local. No se hizo push a GitHub.

## Ajuste posterior: sectores diarios
Petición del usuario tras revisar la captura: gráfico diario y porcentual, y confirmación del orden de la lista. Se eliminan `range` y los selectores de tramos que TradingView convertía en 30 minutos/1 hora, manteniendo `interval: D`. Se ocultan las barras superior e inferior de selección; zoom y desplazamiento conservan la resolución diaria. Se mantienen dos o tres sectores para activar la comparación porcentual del proveedor. La tabla informa de su orden fijo y distingue Cambio% diario del porcentaje acumulado del gráfico. No se ha implementado clasificación automática ni un proceso de descarga diaria.

ESLint y build correctos. En Chrome se comprobó la protección de dos sectores, añadir un tercero y cambiar el símbolo principal conservando «1 día». En producción, gráfico de XLY/XLP visible en 1D y escala porcentual; nota de orden fijo visible. Commit `f0b97e2`; despliegue READY `dpl_4gkGpjdGZLqw9gA2G69YiME3vPsM`, https://consultormacro.com/radar.

Referencia de configuración: https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/ ; cobertura y retardo: https://www.tradingview.com/widget-docs/markets/north-america/ .
