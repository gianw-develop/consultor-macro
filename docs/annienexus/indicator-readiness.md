> Actualización 30/09/2026: la conexión local OCDE/BLS/Tesoro, ventanas, revisiones entre capturas y componentes LEI/CEI están implementados. LEI/CEI siguen como lectura manual fechada; faltan histórico con versiones, derechos comerciales y backtest de umbrales. Consulte `macro-data.md` e `integration-status.md`. El texto siguiente conserva la matriz de origen.

> Copia documental recibida el 30/09/2026. El estado técnico histórico de esta matriz puede preceder a la vista previa; consultar integration-status.md para el estado implementado. Los pendientes de datos siguen vigentes.

# AnnieNexus · indicadores confirmados por Course Lab

Fecha: 30 de septiembre de 2026.
Alcance: contenido de **Principal**. No redefine el diseño ni añade indicadores nuevos.

## Decisión reconciliada

- **CLI G7 — brújula principal.** Contextualiza las grandes economías desarrolladas y tiene prioridad para Dow, S&P 500 y Nasdaq-100.
- **CLI G20 — contraste global.** Permite comprobar si el impulso desarrollado coincide con el ciclo mundial.
- **No son dos votos independientes:** G7 y G20 comparten países y señales. Se comparan; no se promedian ni se suman.
- La selección anterior **CLI G20 principal** de `ANNIENEXUS-REFERENCIA-INTERFAZ-2026-09-21.md` y `ANNIENEXUS-REFERENCIA-DISENO-2026-09-22.md` queda sustituida por la decisión posterior de `DIRECCION-INDEPENDIENTE.md` y `DIRECCION-CURVA-Y-CICLO.md`, ya recogida en `ANNIENEXUS-PLATFORM-ESTADO.md` y `ANNIENEXUS-DISENO-UNICO.md`.
- Recuperar las brújulas/velocímetros cambia la presentación, **no revierte esta jerarquía de contenido**.

## Definiciones de tiempo

- **Adelantado:** intenta avisar antes de que el giro sea visible en toda la economía.
- **Coincidente / confirmación:** describe actividad que ya está ocurriendo y comprueba o contradice la señal adelantada.
- **Rezagado:** suele reaccionar después de que el ciclo ya cambió o se publica con demora suficiente para confirmar tarde.

La clasificación es funcional, no absoluta: una serie puede anticipar una parte del ciclo y confirmar otra.

## Matriz breve para las brújulas de Principal

| Indicador | Tiempo y definición simple | Función en Principal | Control de doble conteo | Fuente documental | Estado comprobado |
| --- | --- | --- | --- | --- | --- |
| **CLI G7 de la OCDE** | **Adelantado.** Índice compuesto que intenta anticipar giros del crecimiento respecto de su tendencia en las principales economías desarrolladas. | Brújula principal del eje de crecimiento. Mostrar nivel frente a 100, dirección, pendientes de 3 y 6 meses, persistencia, revisión y fecha real del dato. | No sumar G20 como otra confirmación. Tampoco sustituye PIB, empleo, consumo o beneficios. | `model/MASTER-MARKET-MODEL.md`, sección “CLI”; `model/repasos/notas-en-vivo/2026-09-27-gregory-mentoria-8.md`; `DIRECCION-INDEPENDIENTE.md`. Proveedor metodológico: OCDE. | **Concepto documentado.** Se usó una observación oficial en una tesis puntual; no hay backtest de umbrales ni conexión viva en AnnieNexus. |
| **CLI G20 de la OCDE** | **Adelantado.** La misma familia de indicador, con alcance mundial más amplio. | Contraste global: coincidencia, divergencia y cuál serie giró primero. | Se solapa con G7; no promediar, sumar ni convertir en un segundo voto. | `DIRECCION-INDEPENDIENTE.md`; `DIRECCION-CURVA-Y-CICLO.md`. Proveedor metodológico: OCDE. | **Concepto documentado.** Sin cálculo validado de divergencia, persistencia o adelanto relativo; sin conexión viva. |
| **LEI de Estados Unidos** | **Adelantado.** Índice de diez señales estadounidenses que buscan anticipar el ciclo. | Segunda brújula adelantada, específica de EE. UU.; contrastar su dirección con CLI G7. Abrir detalle de componentes y revisiones. | Solicitudes iniciales, S&P 500 y otros componentes explican el LEI, pero no vuelven a contarse como confirmaciones independientes. | `research/ANNIENEXUS-REFERENCIA-INTERFAZ-2026-09-21.md`; `PROPUESTA-SETUP-ANINEXUS-V0.1.md`; `DIRECCION-INDEPENDIENTE.md`. Proveedor: Conference Board. | **Concepto y regla de independencia documentados.** Se usó una observación publicada en una tesis puntual; no hay ingestión, reconstrucción vintage ni backtest conectado. |
| **CEI de Estados Unidos** | **Coincidente.** Resume actividad que está ocurriendo: empleo en nóminas, ingreso personal sin transferencias, producción industrial y ventas manufactureras/comerciales. | Comprobar si la economía real confirma o contradice el giro del CLI/LEI. | NFP forma parte del CEI; no contarlo otra vez como evidencia totalmente independiente. | `research/ANNIENEXUS-REFERENCIA-INTERFAZ-2026-09-21.md`; `PROPUESTA-SETUP-ANINEXUS-V0.1.md`; `overview.tsx` lo define como actividad presente. Proveedor: Conference Board. | **Función documentada.** No consta serie actual verificada, transformación, fuente técnica ni conexión viva en la aplicación. |
| **NFP / empleo en nóminas no agrícolas** | **Coincidente con rasgo rezagado.** Mide el cambio mensual de empleos en empresas fuera del sector agrícola; el mercado laboral suele girar después de otras señales. | Confirmación laboral. Mostrar medias de 3 y 6 meses, revisiones, difusión sectorial cuando se valide y fecha de publicación. Un mes aislado no cambia el régimen. | Es componente del CEI. Si CEI ya confirma actividad, NFP explica esa lectura; no añade un voto completamente nuevo. | `research/ANNIENEXUS-REFERENCIA-INTERFAZ-2026-09-21.md`, “Control crítico para empleo y NFP”; `model/MASTER-MARKET-MODEL.md`, F02; `PROPUESTA-SETUP-ANINEXUS-V0.1.md`. Proveedor: BLS. | **Definición oficial y cautelas documentadas.** Se usaron datos BLS en análisis puntuales; medias, revisiones, difusión y conector aún no están implementados. |

### Señales auxiliares dentro de estas brújulas

| Señal | Clasificación útil | Uso y límite |
| --- | --- | --- |
| Solicitudes iniciales de desempleo, media de 4 semanas | Adelantada laboral, semanal | Explica movimientos tempranos del LEI. No se cuenta como voto independiente si ya se usa LEI. |
| Horas manufactureras, nuevos pedidos, permisos, expectativas y crédito | Adelantadas o sensibles al ciclo | Pertenecen al detalle del LEI/crecimiento; sirven para explicar el giro, no para inflar el número de confirmaciones. |
| PIB real, consumo real, producción e ingresos | Coincidentes con publicación y revisiones tardías | Confirman la economía real; el PIB no es brújula temprana ni equivale a beneficios bursátiles. |
| Desempleo | Rezagado / confirmación laboral | Debe leerse con participación y encuesta de hogares; una tasa baja puede persistir después del giro. |

## Pilares de Gregory sin convertirlos en votos duplicados

Gregory aporta una **cadena de decisión**, no una colección de indicadores con el mismo peso:

| Capa | Qué responde | Series o fuerzas | Papel temporal y regla |
| --- | --- | --- | --- |
| **1. Dirección del crecimiento** | ¿La economía acelera o desacelera? | CLI G7 principal, G20 contraste y LEI EE. UU. | Señales adelantadas. Producen una hipótesis común de régimen; sus solapamientos no se suman. |
| **2. Economía real** | ¿El giro ya aparece en la actividad? | CEI, NFP/empleo, PIB real, consumo, producción e ingresos. | Confirmación coincidente o rezagada. CEI y NFP comparten empleo. |
| **3. Dirección de la inflación** | ¿Los precios aceleran, se moderan o se propagan? | IPC, PCE, medidas subyacentes y Sticky Price CPI correctamente nombrado. | Eje vertical del régimen; no son indicadores adelantados del crecimiento. Comparar total, persistente, salarios y expectativas sin llamar “falsa” a la inflación general. |
| **4. Transmisión financiera** | ¿Cómo se convierte el régimen en coste del dinero? | Fed, rendimientos 2Y/10Y, curva completa, crédito y liquidez. | La curva y el crédito pueden anticipar tensión; la Fed suele reaccionar a datos. Son mecanismo y contraste, no otro voto de crecimiento. Precio y rendimiento de bonos se mueven normalmente en sentidos opuestos. |
| **5. Resultado empresarial y de mercado** | ¿La historia llega a los índices? | Beneficios, márgenes, amplitud, sectores y reacción diferenciada de Dow, S&P 500 y Nasdaq-100. | Confirmación final. Si se usa LEI, el S&P 500 que contiene no debe contarse otra vez como confirmación macro independiente. |

Cadena conservada:

**adelantados → economía real → inflación → Fed/bonos/crédito/liquidez → beneficios → respuesta distinta de Dow, S&P 500 y Nasdaq-100.**

## Estado real de datos e implementación

### Documentado

- Jerarquía CLI G7 principal / G20 contraste.
- Definición y función de CLI, LEI, CEI y NFP.
- Cautelas de revisiones, frecuencias distintas y doble conteo.
- Marco Gregory: crecimiento + inflación, confirmado con Fed, bonos, crédito, liquidez, beneficios e índices.
- Presentación decidida: mismo marco oscuro y pestañas superiores; brújulas/velocímetros recuperados solo para Principal.

### Usado en análisis puntuales, pero no convertido en motor validado

- CLI, LEI, NFP y otras series oficiales aparecen con observaciones fechadas en `model/tesis/2026-09-28-regimen-estados-unidos.md`.
- El Master contiene definiciones y cadenas causales; eso no equivale a backtest, cálculo de puntuación o conector operativo.
- Existen artefactos oficiales previos para la curva del Tesoro, pero la aplicación nueva no los consume todavía.

### Código existente de AnnieNexus

- `src/modules/annienexus/overview.tsx` contiene las cuatro tarjetas CLI, LEI, CEI y NFP y el selector G7/G20.
- Sus agujas, etiquetas y valores proceden de constantes **DEMO**; el propio texto dice “aguja ilustrativa, sin puntuación calculada”.
- `src/modules/annienexus/curve.tsx` usa curvas hipotéticas y enlaza FRED, pero no descarga observaciones actuales.
- `DemoProvider` inicia en modo demostración. No se encontró conector de OCDE, Conference Board o BLS para estas brújulas.
- El código parcial no constituye todavía aplicación compilada, validada ni publicada, según `research/ANNIENEXUS-PLATFORM-ESTADO.md`.

## Pendientes precisos antes de afirmar conexión real

1. Definir identificadores exactos, frecuencia, unidades, revisiones y licencia/API para CLI G7, CLI G20, LEI y CEI.
2. Confirmar que la serie elegida por la OCDE corresponde exactamente a G7 y G20, no a Estados Unidos u otro agregado usado por error.
3. Implementar almacenamiento de fecha de observación, fecha de publicación y revisiones; conservar datos vintage cuando existan.
4. Implementar pendientes de 1, 3 y 6 meses, aceleración, persistencia y cruces de 100 sin inventar una puntuación común.
5. Implementar NFP con lectura original y revisada, medias de 3 y 6 meses y, solo si se valida, difusión sectorial.
6. Documentar y conectar la composición exacta del CEI; etiquetar NFP como componente para evitar doble conteo.
7. Abrir el detalle de los diez componentes del LEI y marcar cuáles se muestran también en otras tarjetas.
8. Sustituir valores DEMO por estados `sin datos`, `dato oficial` o `cálculo reproducible`, con fuente y fecha visibles.
9. Probar históricamente umbrales, giros y desfases para Dow, S&P 500 y Nasdaq-100 antes de activar estados de setup o confianza.
10. Compilar, probar y revisar visualmente Principal; después demostrar que las brújulas consumen datos reales antes de llamarlas “conectadas”.

## Fuentes internas que gobiernan esta matriz

- `research/ANNIENEXUS-DISENO-UNICO.md` — decisión visual y jerarquía posterior G7/G20.
- `research/ANNIENEXUS-PLATFORM-ESTADO.md` — límites de implementación y ausencia de aplicación validada.
- `research/ANNIENEXUS-REFERENCIA-INTERFAZ-2026-09-21.md` — inventario de señales, jerarquía temporal y control NFP.
- `/Users/gianw/Documents/Wall Street Visual Intelligence/research/gregory-course/mockups/aninexus-v1/DIRECCION-INDEPENDIENTE.md` — G7 principal, G20 contraste, solapamientos y detalle de curva.
- `/Users/gianw/Documents/Wall Street Visual Intelligence/research/gregory-course/mockups/aninexus-v1/DIRECCION-CURVA-Y-CICLO.md` — composición de Principal y función narrativa de la curva.
- `/Users/gianw/Documents/Wall Street Visual Intelligence/research/gregory-course/PROPUESTA-SETUP-ANINEXUS-V0.1.md` — secuencia adelantados → economía real → precio y reglas de independencia.
- `model/MASTER-MARKET-MODEL.md` — definiciones de CLI, empleo, inflación y cadena causal.
- `model/repasos/notas-en-vivo/2026-09-27-gregory-mentoria-8.md` y `2026-09-28-gregory-mentoria-9.md` — enseñanza Gregory, correcciones y límites.
