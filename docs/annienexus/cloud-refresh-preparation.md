# Actualización en nube · preparación 21/10/2026

**No está activada. No sustituye la automatización local.** La web sigue leyendo el corte publicado, sin nuevas rutas públicas, cambios de acceso ni migraciones aplicadas.

## Implementado y probado localmente

`src/modules/annienexus/cloud-refresh.ts` prepara candidatos de datos para OCDE CLI (USA/G7/G20), empleo BLS CES0000000001 y curva diaria del Tesoro. Reutiliza los validadores existentes. No actualiza textos editoriales, no renueva revisiones del Cerebro/reloj y no promueve candidatos al dashboard.

- Consulta independiente por fuente, límite de 25 segundos y 8 MB por respuesta.
- Conservación de datos y fechas anteriores ante fallo, distinguiendo retenido de verificado.
- Rechazo de retrocesos de periodo en las tres fuentes.
- Respuesta original y huella SHA256 por consulta utilizable, revisiones de series mensuales y estado explícito por fuente.
- Ventana de ejecución a las 17:00 de Europe/Madrid, con pruebas de ambos cambios de hora de 2026. Idempotencia delegada a un almacén con adquisición atómica de un turno por fecha.
- Funciones de almacenamiento inyectables; no existe todavía un adaptador Supabase ni una prueba de concurrencia real en base de datos. La prueba del contrato con almacén simulado **no acredita** que haya exclusión mutua operativa en nube.

Pruebas: `npx tsc -p tsconfig.foundation.json && node --test tests/cloud-refresh.test.cjs` (7 casos); suite completa `node --test tests/*.test.cjs` (87/87). Lint de ambos archivos correcto. Se reutilizan respuestas oficiales archivadas; estas pruebas no son una nueva consulta de mercado. No se ha probado un servicio remoto ni una migración con estas pruebas.

## Arquitectura propuesta con recursos existentes

Proyecto Vercel existente (Hobby), Supabase `dqvhztcmusoecbacyfge` y dominio consultormacro.com. Sin nuevos proyectos o compras.

La documentación de [Vercel Hobby](https://vercel.com/docs/cron-jobs/usage-and-pricing) limita cada cron a diario y permite hasta una hora de retraso. No sirve para prometer ejecución puntual a las 17:00. [Supabase Cron](https://supabase.com/docs/guides/cron) puede programar funciones SQL y llamadas HTTP. [pg_net](https://supabase.com/docs/guides/database/extensions/pg_net) permite invocar un endpoint con cabecera de autenticación.

Propuesta: cron en Supabase a las 15:00 y 16:00 UTC con condición de hora Madrid=17 antes de llamar. Una fecha local única y un bloqueo con caducidad impiden duplicados; un reintento dentro de la ventana solo se permite si el anterior falló o caducó. No se deben crear dos cron diarios en Vercel para esquivar sus restricciones.

Persistencia propuesta: registros inmutables de candidatos y evidencia; tabla separada de ejecuciones/turnos; puntero al último corte publicado. Acceso exclusivo del servicio a esas tablas, sin acceso a notas o documentos de usuarios. Credencial de alcance reducido, únicamente servidor; nunca `NEXT_PUBLIC_`. Requiere inspeccionar el estado real de extensiones/permisos antes de elegir adaptador y aplicar SQL. No se ha generado ni instalado ninguna credencial nueva.

Endpoint propuesto: POST autenticado por secreto, sin aceptar URLs arbitrarias ni contenido de datos del solicitante, límites de tiempo/tamaño, respuesta resumida. La excepción concreta al proxy debe validarse junto con la autenticación del endpoint; no abrir un prefijo entero. El estado de sesión del usuario no será un requisito del cron, y el cron no sustituirá autenticación de páginas.

## Lo que falta para actualizar TODO el dashboard

| Bloque | Estado actual |
|---|---|
| OCDE, empleo y curva | Núcleo de consulta preparado; sin persistencia ni scheduler cloud |
| IPC, ventas, M1 y solicitudes | Series/cálculos locales fechados; necesitan conectores, revisiones y adaptación de tarjetas |
| Desempleo, participación, horas | Contexto de empleo local; debe acompañar al nuevo mes antes de extender lectura laboral |
| LEI/CEI | Publicación revisada manualmente; no hay conector autónomo validado |
| Calendario y resultados | Lista editorial; no debe marcar un evento publicado solo porque llegó la fecha |
| Titular, explicación y revisiones | Trabajo editorial pendiente de modelo explícito; nunca revalidar una tesis solo por descargar datos |
| Sectores | Proveedor de cierres y derechos aún sin confirmar; composición pendiente de aprobación |

Antes de promover un candidato debe resolverse la coherencia de los componentes que hoy importan datos estáticos, mostrar la fecha de la lectura editorial y mantener su caducidad. Publicar únicamente los tres conectores existentes como «todo actualizado» sería incorrecto.

## Bloqueo observado y prueba pendiente

Chrome muestra la pantalla de inicio de sesión de Supabase al abrir el SQL Editor del proyecto. Se solicitó al usuario iniciar sesión sin compartir contraseña. No se dispone localmente de credencial administrativa de base de datos; solo URL y clave pública de la aplicación. No se intentó reutilizar la clave pública para ampliar permisos.

Pendiente: inspección de extensiones/permisos, adaptador de persistencia y migración, endpoint/scheduler, prueba manual cloud y una ejecución programada comprobable, fallo de fuente y conservación del último corte, lectura del mismo resultado desde la web real. Solo después puede retirarse el respaldo local. Una entrada de cron «success» sin confirmar respuesta HTTP y lectura en la web no acredita el resultado.
