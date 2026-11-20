# Calculadora aproximada — 29/10/2026

## Decisión vigente del usuario

El usuario solicita expresamente una aproximación sencilla con referencias públicas de FTMO, cuatro mercados, sin necesidad de mantener encendido su Mac/MT5 y sin programar conexiones en la nube. Sustituye la exigencia anterior de calibración continua. No se contratan servicios, conectan cuentas a terceros ni utilizan credenciales en esta versión.

## Implementación

`fe8f407` y `0e22285`: interfaz con cuatro precios y resultado inmediato. Se retiran el formulario de calibración, las categorías y las opciones avanzadas. La fecha de las referencias y «Sin cotizaciones en vivo» son visibles. El botón Limpiar elimina los cuatro objetivos. Las entradas inválidas no producen números.

DIA, QQQ y GLD: objetivo × medio de bid/ask FTMO ÷ precio de origen. Las observaciones públicas son próximas, no sincronizadas. No se afirma precisión de ejecución, margen estadístico ni precio de la cuenta del usuario. Dos decimales de presentación no equivalen a verificar el tick de la cuenta.

SPX: aproximación nominal 1:1 expresamente visible. No se calcula un diferencial artificial entre cierre de ayer y CFD de hoy. El índice observado 7743.98 con hora publicada 28/10 17:18:42 EDT se conserva únicamente como contexto en referencias, no se emplea como factor.

## Referencias

Destino: https://ftmo.com/en/symbols/, observado 29/10/2026 11:45 Madrid. FTMO no ofrece hora de tick en esa tabla.

| Origen | Precio origen | Hora origen (UTC, 29/10) | Destino | Bid | Ask | Medio |
|---|---:|---|---|---:|---:|---:|
| DIA | 524.00 | 10:44:01 | US30.cash | 52476.86 | 52479.34 | 52478.10 |
| GLD | 368.93 | 10:43:58 | XAUUSD | 4026.80 | 4027.17 | 4026.985 |
| QQQ | 718.07 | 10:44:31 | US100.cash | 29520.53 | 29522.38 | 29521.455 |
| SPX | No utilizado como factor | — | US500.cash | 7725.65 | 7726.25 | 7725.95 |

Origen: https://finance.yahoo.com/quote/DIA/, https://finance.yahoo.com/quote/GLD/, https://finance.yahoo.com/quote/QQQ/ y https://finance.yahoo.com/quote/%5EGSPC/. Los ETF son datos de preapertura publicados por Yahoo. Las referencias son fijas, no se actualizan al abrir la página. No se programaron refrescos ni conectores.

## Validación

26/26 pruebas del motor de referencias y el motor anterior; TypeScript, ESLint y compilación local correctos. El motor anterior queda sin uso en esta pantalla, conservado para trazabilidad y contratos; sus restricciones no se presentan como validadas para la nueva aproximación.

Chrome en producción: SPX 7700 → 7700.00 nominal; DIA 520 → 52077.50; GLD 370 → 4038.66; QQQ 721 → 29641.91. Comprobadas las cuatro salidas inmediatas, rechazo de cero y desglose con fechas y fuentes. La validación acredita que calcula la aproximación declarada; no precisión frente a una ejecución futura.

Evidencia local: `output/annienexus/calculadora-aproximada-2026-10-29/fuentes.json` y captura de producción.

## Publicación final

Commit de aplicación `0e22285`, despliegue READY `dpl_BKAnoW4e6aNJYaQ9s17NQ8CZpnCR`, alias https://consultormacro.com/annienexus/calculadora. Compilación remota correcta. Tras la última recarga de producción se comprobaron los cuatro resultados y Limpiar, y se dejaron los ejemplos visibles. Captura `output/annienexus/calculadora-aproximada-2026-10-29/produccion.png`.
