# Calculadora existente: auditoría y motor calibrado

## Alcance

Se modifica `/annienexus/calculadora`, sin una aplicación paralela ni operaciones automáticas. Se conservan la estructura compacta, las entradas rápidas, Ajustes, Limpiar y el mapa de niveles. Se añaden NDX/DJIA, lotes y contrato JSON. Las calibraciones son efímeras: no se guardan al recargar y no se envían a terceros.

## Fallos encontrados en el código anterior

- Cuatro referencias fijas del 12/10/2026, sin control de antigüedad ni sincronización.
- SPX se comparaba consigo mismo (7807,24 → 7807,24), por lo que su ajuste a CFD era siempre cero sin una observación FTMO.
- QQQ/DIA se comparaban con índices, no con la cotización de la cuenta FTMO.
- GLD/oro usaban cierres diarios de distinto horario.
- La proporción de un único par imponía sensibilidad y desplazamiento sin comprobarlos.
- Se mostraban dos decimales sin una estimación de error ni tick de la plataforma.
- `7.700` se interpretaba como 7,7; ahora se rechaza por ambigüedad y se solicita `7700`.

No se trasladan las referencias antiguas al motor nuevo.

## Rutas

| Origen | Naturaleza | Destino | Método |
|---|---|---|---|
| SPX | Índice publicado | US500.cash | Diferencia de base |
| NDX | Índice publicado | US100.cash | Diferencia de base |
| DJIA | Índice publicado | US30.cash | Diferencia de base |
| QQQ | ETF | US100.cash | Recta local calibrada |
| DIA | ETF | US30.cash | Recta local calibrada |
| GLD | ETF | XAUUSD | Recta local calibrada |

DIA no es DJIA. GLD no es el futuro GC. XAUUSD es el CFD sobre oro al contado. Las rutas admitidas no usan futuros; se bloquea `market: futures`, en vez de aplicar una base de contrato inexistente. No se deben mezclar series ajustadas por dividendos, splits, contratos o servidores diferentes.

## Cálculo y validación

1. Cotizaciones originales: valor publicado para índices; bid/ask para ETF. Cotización destino: bid/ask del CFD FTMO. Mid = (bid + ask) / 2.
2. Índices: `destino = origen + media(CFD mid − índice)`. Mínimo cuatro pares.
3. ETF: `destino = media(y) + pendiente × (origen − media(x))`, pendiente estimada de covarianza/varianza de los pares de entrenamiento. Mínimo seis pares. No existe multiplicador fijo ni se impone intercepto cero.
4. Los dos pares más recientes son comprobación fuera del ajuste. También se omite sucesivamente cada observación de entrenamiento para medir sensibilidad y error. Si la relación es negativa, inestable o la muestra demasiado estrecha, se bloquea.
5. El nivel y los dos puntos de comprobación deben estar dentro del intervalo observado de entrenamiento. No se permite extrapolación.
6. Resultado mid, bid o ask estimado, usando el medio spread del último CFD para cambiar de lado. No equivale a una orden ejecutable al llegar al nivel: el spread puede cambiar.
7. Redondeo al tick **aportado desde la especificación FTMO**; no se deduce del número de decimales ni se inventa un tick estándar.
8. Margen empírico: máximo error de ajuste/comprobación/omisión + sensibilidad de predicción al omitir puntos + máximo medio spread trasladado + velocidad local observada × (edad y desfase) + medio tick. Se redondea el margen hacia arriba al tick.

El margen no tiene una cobertura estadística del 95 % ni garantiza el precio futuro. No incluye saltos no observados. Un ajuste perfecto en pocos puntos no prueba una relación estructural entre ETF y CFD.

## Límites técnicos explícitos

Estos son filtros conservadores de ingeniería, **no reglas de trading ni parámetros estadísticamente validados**:

- Último par: hasta 120 segundos; cada observación: hasta 60 minutos.
- Diferencia temporal dentro del par: hasta 2 segundos.
- Pares distintos, separados por al menos un segundo, máximo 100.
- Misma sesión de Nueva York y sesión regular 09:30–16:00; zona `America/New_York` con cambio horario.
- El usuario/importador declara las horas reales de sesión común. Se exige que sigan abiertas; debe incluir festivos y cierres anticipados. No hay servicio de calendario bursátil conectado que verifique esa declaración.
- Rango mínimo: 0,10 % del precio y veinte spreads completos del ETF.
- Spread máximo por instrumento: 10 puntos básicos (0,10 %).
- Margen calculado máximo: 10 puntos básicos del resultado; si lo supera, no se muestra un nivel.
- Especificación de tick verificada/declarada hace un máximo de siete días.

La pantalla recalcula cada segundo, al recuperar foco y al cambiar su visibilidad. La exportación vuelve a validar con la hora del clic. No se reutiliza un resultado que ya caducó.

## Evidencia y límite de verificación real

Consulta oficial en Google Chrome el 29/10/2026: https://ftmo.com/en/symbols/ identifica US500.cash, US100.cash y US30.cash como índices Spot CFD. La página advierte que los horarios pueden cambiar y remite a las especificaciones de la plataforma y Trading Updates. La tabla pública consultada muestra contratos/horarios, pero no acredita el tick ni la cotización de la cuenta del usuario.

**No hay conexión autenticada al feed de la cuenta FTMO ni una colección real de pares origen/CFD sincronizados.** El usuario no dispone de esa muestra. No se han reemplazado esos datos por precios de otro bróker, índices o cierres de distinto horario. No se certifica que QQQ 725, SPX 7700 o GLD 375 tengan hoy un equivalente concreto. En ausencia de calibración la respuesta correcta es bloquear.

Toda entrada manual o de agente conserva `evidence: manual`. El sistema no permite que un JSON la eleve a `verified`. Las fuentes y fechas se muestran como aportadas, no contrastadas independientemente. Los resultados siempre son estimados.

## Contrato para el agente

Lote de precios, hasta 200, sin cantidades de exposición:

```json
{"version":1,"levels":[{"symbol":"QQQ","price":725,"type":"Call Wall"},{"symbol":"SPX","price":7700,"type":"Soporte"}]}
```

Calibración por instrumento: `version`, `symbol`, `destination`, `venue: FTMO`, `market: cash`, `tickSize`, `specificationSource`, `specificationAt` (ISO con zona), `continuity` (plataforma/serie), `evidence: manual`, `pairs`. Cada par tiene `origin` y `cfd`; cada cotización incluye `at` (hora real del dato, nunca hora de copia), `source`, `sessionStart`, `sessionEnd` y `bid`/`ask` o `value` para índice. La plantilla vacía se obtiene en Ajustes. No contiene datos de ejemplo que puedan confundirse con reales.

El JSON se valida como entrada no confiable. Importar no actualiza fechas ni vuelve fiable una observación. El agente no debe fabricar cotizaciones para completar campos.

## Pruebas

Comando: `npx tsc -p tsconfig.foundation.json && node --test tests/calculator.test.cjs`.

La suite usa muestras **sintéticas explícitas**, con soluciones conocidas, para probar offset, recta con intercepto no nulo, bid/ask, tick, holdout, sensibilidad, vencimiento, desfase, sesiones, horario de verano/invierno, spread, importaciones malformadas y bloqueo de extrapolación. También comprueba que el formato real de las antiguas referencias del 12/10 ya no produzca resultados. Eso es regresión del fallo real, no validación de un precio FTMO real.

La validación end-to-end de precisión contra una cuenta FTMO real queda pendiente de un feed/exportación emparejada con hora y especificación. No debe describirse esta entrega como un conversor verificado contra el bróker hasta completar ese paso.

### Resultado de validación de esta entrega

- 20/20 pruebas específicas del conversor correctas.
- 111/111 pruebas versionadas del proyecto correctas, después de que Platform fijara las fechas de los fixtures de cloud-refresh en su commit independiente `1877cf3`. Esos cambios no forman parte del motor.
- ESLint de motor/interfaz/pruebas: correcto.
- Compilación de producción `next build --webpack` en copia aislada: correcta; incluye comprobación TypeScript.
- Chrome: entradas individuales, rechazo de `7.700`, lote QQQ 725 / SPX 7700 / GLD 375, rechazo de calibración JSON incompleta, limpieza y layout a 390×844 comprobados.
- Capturas locales: `output/qa/calculadora-2026-10-29/desktop.png` y `mobile.png` (artefactos ignorados por Git).
- La prueba visual se realizó fuera de la sesión estadounidense: no se falseó la hora para presentar una conversión operativa. El camino de cálculo válido se comprueba mediante las muestras sintéticas reproducibles de la suite.
- Ninguna prueba aporta certificación de una cotización real de la cuenta FTMO. Esa comprobación sigue pendiente y está indicada en la interfaz.

### Publicación comprobada

29/10/2026, 09:15 UTC (10:15 Madrid): comprobación independiente en Google Chrome de https://consultormacro.com/annienexus/calculadora con la sesión existente. La ruta real muestra la nueva interfaz y las seis rutas. Se introdujeron QQQ 725, SPX 7700 y GLD 375; los tres mostraron el bloqueo por falta de calibración, sin producir cifras ficticias. Captura: `output/qa/calculadora-2026-10-29/production.png`. Código entregado en `d1bb05b`; publicación gestionada por Platform Development. Esto acredita el despliegue del software, no una calibración real con la cuenta FTMO.
