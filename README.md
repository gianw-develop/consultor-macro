# AnnieNexus — acceso privado

Estado 01/10/2026 14:23 Madrid: **publicada en https://consultormacro.com/acceso**. Dominio y protección anónima comprobados por HTTP. Pendientes primera cuenta/confirmación del usuario y QA visual de producción: conexión Chrome no disponible. **No subir biblioteca ni rama completa al remoto público.** Véase `docs/annienexus/release-2026-10-01.md`.

Aplicación de inteligencia visual de mercado con cuatro pestañas: Principal, Cerebro, Formación y Radar. Desarrollo aislado sobre el repositorio histórico Consultor Macro. Publicada con acceso privado.

## Ejecutar

```sh
npm ci --ignore-scripts
npm run build
npm run preview
```

Abrir http://127.0.0.1:3017/annienexus. Para desarrollo: `ANNIENEXUS_LOCAL_PREVIEW=1 npm run dev -- --hostname 127.0.0.1`. El modo local debe usarse solo en este equipo; no configurar esa variable en un despliegue. En Vercel ese modo se ignora. El acceso privado exige Supabase configurado, correo confirmado y ANNIENEXUS_ALLOWED_EMAILS; si falta configuración cierra con 503, si falta sesión redirige al acceso o devuelve 401.

## Implementado

- Marco común oscuro, navegación superior, cuatro horizontes y modo real inicial / ejemplo didáctico explícito.
- Principal: brújulas CLI G7/G20, LEI, CEI y NFP; cortes oficiales de OCDE/BLS/Tesoro, cambios a 1/3/6m, medias de empleo y comparación de curva por fecha. LEI/CEI proceden de una publicación revisada. [Método y actualización](docs/annienexus/macro-data.md). Tesis de índices sin evaluar. CLI G7/G20 se solapan; NFP forma parte del CEI.
- Brújula de régimen abierta al entrar, con minimizar/restaurar. Mapa completo del PDF original en el tema oscuro común: cuatro zonas, curvas, características y activos. Estimación descriptiva con CLI de EE. UU. e IPC reales hasta agosto; consulta guardada el 30/09/2026, 17:28 CEST. Punto sectorial orientativo, sin cruce confirmado ni trayectoria real. Pulsar el indicador abre método, fuentes y contradicciones; no hay bloques de contenido debajo del cuadrante. DEMO mantiene siete fechas inventadas y giro ilustrativo independiente.
- Cerebro: geometría 3D real con Three.js, giro, pausa, controles de cámara, canales causales y movimiento reducido. Modelo HRA descargado localmente y atribuido; no imagen estática ni medición financiera.
- Formación: 12 documentos existentes de Master, Gregory y Hunab, búsqueda y procedencia. Son copias fechadas, no sincronización automática. Originales conservados. 21 enlaces internos resueltos y 16 recursos originales importados, incluidas diez imágenes; lectura bajo demanda y manifiesto de procedencia.
- Radar: interfaz de exploración de acciones/índices y cripto al contado, filtros, mapa, evidencia pendiente y apuntes. Motor descriptivo integrado con 24 pruebas: velas diarias completas de BTC/ETH/SOL al contado en Coinbase, y registros explícitamente no disponibles para bolsa. La API requiere identidad real todavía no configurada; la pantalla no recibe cotizaciones actuales. No hay oportunidades calculadas.
- Apuntes compartidos entre Radar y Formación: Supabase por usuario en producción; navegador en vista previa local. Copia JSON y recuperación sin reemplazar apuntes existentes. No se importan notas locales automáticamente.

## Límites de esta entrega

Hay conectores públicos de actualización local, no un flujo en vivo. No hay puntuaciones de régimen, backtests ni suscripciones. La identidad Supabase está implementada y pendiente de la primera cuenta real autorizada. El cuadrante conserva su corte independiente y no confirma un régimen. Los demás paneles distinguen observaciones, ejemplos y ausencias.

El acceso privado protege páginas y recursos. Solo el código estático de interfaz, fuentes y rutas de acceso son públicos. La biblioteca se entrega desde servidor y private/learning. La contraseña/cookie histórica no autoriza. La publicación privada está realizada en el proyecto Vercel existente; correo inicial configurado. No publicar recursos ni historial en GitHub público.

## Verificación

```sh
npm run lint
npm run test:foundation
npm run test:quadrant
npm run test:macro
npm run test:notebook
node tests/radar/run.mjs
npm run build
npm audit
```

La suite verifica ausencia de evidencia, permisos, caducidad, errores del proveedor y rechazo de cookies/cabeceras arbitrarias. Las interacciones y tamaños de pantalla se verifican adicionalmente en navegador; no son datos de mercado validados.

## Estructura y coordinación

`src/shared/ui/` contiene el marco común y el cuaderno; `src/contracts/` define datos y disponibilidad; `src/modules/annienexus/` contiene las tres vistas propias. `src/modules/radar/` contiene el motor descriptivo y el adaptador Coinbase. `RadarWorkspace` consume sus resultados a través de la API protegida sin duplicar el marco.

Ver [estado de integración](docs/annienexus/integration-status.md), [modelo lógico](docs/annienexus/data-schema.md), [procedencia de apuntes](docs/annienexus/learning-provenance.json) y [pendientes de indicadores](docs/annienexus/indicator-readiness.md).

El mapa completo del PDF original de Gregory, mentoría 8, y la brújula central están documentados en [brújula de régimen](docs/annienexus/quadrant.md). El PDF se conserva íntegro con su huella; su contenido docente y el giro de demostración se distinguen del corte manual fechado.

## Corrección visual del 30/09/2026

La primera entrega funcional fue rechazada por básica. Esta revisión recupera las proporciones, títulos, tipografía local Source Sans 3 (SIL OFL), colores y composición de las cuatro referencias aprobadas. Principal conserva la excepción solicitada de las brújulas. Formación reúne los apuntes reales y Radar incorpora lista/mapa, mercados y notas. Las capturas y comparación se guardan en el proyecto compartido, `output/annienexus/fidelidad-2026-09-30/`. La revisión técnica no sustituye la aceptación visual del usuario.

## Modelo tridimensional

Kristen Browne y Heidi Schlehlein, Human Reference Atlas, Brain Male v1.3 (2023), a partir de Allen Human Reference Atlas. [Fuente y DOI](https://doi.org/10.48539/HBM929.XKCL.339), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Materiales, escala, iluminación y conexiones adaptados por AnnieNexus. Las 204 conexiones se proyectan sobre la superficie mediante `node scripts/build-brain-paths.mjs`; three-mesh-bvh es solo una dependencia de desarrollo para generar el recurso. Las regiones cerebrales no equivalen científicamente a variables financieras.

Procedencia y huella del archivo en `public/annienexus/brain-provenance.json`; metadatos originales conservados junto al modelo. La superficie precalculada y comprimida conserva exactamente 656.268 triángulos: descarga de 10,7 MB y búfer geométrico de 15,7 MB frente a 47,3 MB antes. Pausa y visibilidad detienen el renderizado continuo; movimiento limitado a 30 fps. Véanse brain-optimization.json y brain-equivalence.json. Falta evaluación en dispositivos físicos de poca potencia.

## Recuperación

Rama local `codex/annienexus-rebuild-20260930`. Etiqueta local `archive/consultor-macro-before-annienexus-20260930` conserva el estado publicado anterior, commit `7d26dc8c5f4eb10fa1e2aee7e3a98bf68a094c73`. El código histórico retirado de esta rama permanece en Git. No se modifica main ni se hace push al remoto público. Despliegue local realizado; primer registro y confirmación pendientes del usuario.
