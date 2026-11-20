# Datos oficiales en la vista previa — 30/09/2026

Principal abre en modo real. No hay actualización automática del navegador, clasificación común de régimen ni oportunidades de inversión calculadas. Las brújulas consumen un corte guardado; el cuadrante aprobado conserva su propio corte, método y fuentes. Una actualización de las brújulas no mueve su punto.

## Actualización local reproducible

Ejecutar `npm run data:refresh` desde este checkout. Tres peticiones independientes, timeout de 25 segundos, sin claves: OCDE (CSV SDMX), BLS (POST JSON) y Tesoro (CSV anual). Se archivan respuesta original, URL, fecha de consulta y SHA-256 en `data/macro/runs/<fecha>/`. La escritura de `latest.json` es atómica. Si una fuente falla o su estructura no valida, se conserva su corte previo con la fecha original y una advertencia; el proceso devuelve código 1. No se rellenan ausencias con cero o DEMO.

La API no ofrece por registro una fecha exacta de publicación: `publishedAt` queda null. `fetchedAt` es la consulta, no la disponibilidad histórica. Se registran revisiones de niveles entre capturas; la primera captura no reconstruye las versiones anteriores. Estos archivos no son un almacén histórico apto para backtest sin más trabajo. En Vercel se necesitará almacenamiento persistente y una política de actualización; no se ha configurado ni programado una tarea recurrente.

## Series y transformaciones

- OCDE: `OECD.SDD.STES,DSD_STES@DF_CLI`, dimensión REF_AREA G7/G20/USA; M/LI/IX/_Z/AA/IX/_Z/H, estado A. G7 principal y G20 contraste, sin sustituirlos por USA. Cambios de niveles a 1, 3 y 6 meses completos; diferencias del avance trimestral, persistencia y cruce de 100. Umbral de 0,01 puntos para no orientar la aguja por cambios menores a la precisión publicada. No es un umbral de inversión validado. El 100 indica tendencia, no crecimiento cero.
- BLS: `CES0000000001`, empleo no agrícola ajustado por estacionalidad, miles de empleos. Cambio mensual y media mensual de 3/6 meses mediante diferencias de niveles en ventanas completas. Agosto: +162 mil, medias +71,3/+106,5 mil. Junio/julio revisados de +20/−23 a +31/+21 mil en la publicación del 4/9: referencias explícitas, distintas de una revisión de niveles. Provisionalidad del API conservada.
- Tesoro: curva par diaria, diez vencimientos de 3M a 30A incluido 20A. Columnas por nombre, fechas reales, comparación elegible entre días publicados, escala vertical dinámica. Corte 29/9/2026; 10A−2A=0,37 puntos porcentuales. No son cotizaciones intradía.
- LEI/CEI: lectura manual de la publicación pública de Conference Board de 18/9/2026, datos de agosto. Último nivel, variaciones 1/6m publicadas y 3m aproximadas componiendo tasas mensuales redondeadas. LEI ≈+0,1% a 3m permite ambos signos por el redondeo: aguja sin dirección. CEI ≈+0,5%. Componentes explicados (10 y 4), sin valores individuales fabricados. Historial y distribución comercial pendientes de acceso/licencia.

Las posiciones de las agujas son categorías fijas (baja/plano/sube), no intensidad, probabilidad ni puntuación comparable. NFP explica un componente del CEI; G7/G20 se solapan; S&P 500 está en LEI. No se suman como votos. Cortes mensuales con más de 100 días desde el inicio del mes o curva con más de 7 días se rotulan antiguos. Son alertas de antigüedad operativas, no afirmación de que ya exista una nueva publicación.

## Fuentes primarias

- [OCDE, API](https://www.oecd.org/en/data/insights/data-explainers/2024/09/api.html) y [dataset CLI](https://www.oecd.org/en/data/datasets/oecd-composite-leading-indicators-clis.html).
- [BLS, API v2](https://www.bls.gov/developers/api_signature_v2.htm) y [empleo, 4/9/2026](https://www.bls.gov/news.release/archives/empsit_09042026.htm).
- [Tesoro, curva 2026](https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value=2026).
- [Conference Board, nota técnica de septiembre](https://www.conference-board.org/pdf_free/press/US%20LEI%20Technical%20Notes%20-%20September%202026.pdf), páginas 1–3. La distribución comercial exige resolver los derechos del proveedor.

## Límites pendientes

Identidad y almacenamiento Supabase sin configurar; APIs permanecen cerradas. Datos de bolsa y acciones necesitan proveedor/licencia, ajustes corporativos y calendario. Tesis, variable dominante y oportunidades requieren evidencia adicional y validación histórica. No se activan por conectar estas tres fuentes. El modelo central no se modifica.
