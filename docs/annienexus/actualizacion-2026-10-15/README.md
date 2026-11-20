# Dashboard y agenda · 15 de octubre de 2026

Corte de mañana, anterior a las publicaciones del 15/10 a las 12:30 UTC (14:30 Madrid). Actualización solicitada por el usuario.

- IPC septiembre (BLS 14/10): general +0,6 % mensual / +3,7 % anual; subyacente +0,3 % / +2,6 %. Tarjeta, gráfico, cinta, lectura del Cerebro y revisión del reloj sincronizados.
- Solicitudes (DOL 8/10): semana 3/10, 197.000; anterior revisado 199.000; media 198.000 frente a 200.500 revisado. Se conserva el informe del 8/10; no se anticipa el del 15/10.
- Tesoro al 14/10: 2 años 4,82 %, 10 años 5,19 %, diferencial +0,37 pp. NFP reconfirmado por API sin revisiones nuevas.
- Semana 12–16/10: IPC incorporado; IPP, ventas y solicitudes pendientes el 15/10; importación/exportación y producción industrial el 16/10.
- Semana anterior conservada desplegable con resultados de actas Fed, crédito, solicitudes, mayoristas y Michigan, además de ISM y comercio ya publicados. Michigan final 23/10 en próxima semana, selección no exhaustiva.
- OCDE falló dos veces con HTTP 500. CLI conserva valores y fecha 7/10, con aviso explícito. PIB, LEI, CEI, M1 y ventas conservan sus periodos anteriores; no se ha estampado una fecha nueva sobre esos valores.
- Reloj revisado en ambos ejes, orientación limitada/provisional; no se declara régimen confirmado. Caduca a las 14:30 Madrid del 15/10. Diagnóstico general del Cerebro no prorrogado automáticamente.

Fuentes primarias leídas en Chrome: BLS IPC y calendario octubre; DOL data.pdf; Census calendario minorista e informe mayorista; Fed calendario, G.19 y actas 15–16/09; Universidad de Michigan. Evidencia AX y capturas en el workspace compartido: output/annienexus/actualizacion-2026-10-15. API y respuestas crudas archivadas en data/macro/runs/2026-10-15T08-59-54.752Z y 2026-10-15T09-07-25.887Z.

Validación: 70 pruebas existentes pasan; prueba adicional de coherencia del corte pasa (14/14 en economic-reading). ESLint, compilación de producción y git diff --check correctos. Chrome escritorio y móvil 390×844: cabecera, gráfico IPC, solicitudes y agenda sin recortes; resultados diferenciados de publicaciones futuras. Fixtures históricos aislados de los datos editoriales para impedir contaminar pruebas retrospectivas con nuevas publicaciones.

Publicación: proyecto Vercel existente consultor-macro; compilación sin caché; sin git push. Verificación de producción se registra tras publicar.

Producción verificada en Chrome tras recarga completa: https://consultormacro.com/annienexus. Despliegue READY `dpl_38cFmGNKBmVZGu3UjgbrjnW5Luyh`, URL https://consultor-macro-et7qzofvv-breans-projects-8de55b34.vercel.app, código `260097f`. Cabecera nueva, IPC 0,6/3,7, solicitudes 197.000 y media 198.000, curva 14/10, calendario 12–16/10 (1 publicado, 5 programados) y siete resultados anteriores confirmados en la UI. Reloj muestra la revisión nueva como orientación provisional. Capturas production-dashboard.png y production-calendar.png; árboles AX de ambas vistas guardados junto a fuentes.
