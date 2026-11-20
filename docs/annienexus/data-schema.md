# Datos implementados y modelo propuesto

Supabase existente: ConsultorMacro, dqvhztcmusoecbacyfge. Migración manual aplicada el 01/10/2026: public.annienexus_notes(user_id, id, text, topic, created_at), clave primaria (user_id,id), referencia a auth.users y políticas por propietario para leer/insertar/eliminar. Máximo 50 notas de 5000 caracteres; sin actualizaciones ni reemplazo silencioso. Conservación hasta eliminación por su propietario o de la cuenta. No se ejecutan migraciones al iniciar/compilar.

Pruebas reales de aislamiento y capacidad/importación atómica revertidas correctamente: 0 usuarios y notas de prueba restantes. Sin cuenta inicial hasta recibir el correo autorizado. Biblioteca servida desde archivos privados del servidor; sin bucket público.

Las siguientes colecciones son propuestas conceptuales; salvo las notas descritas arriba, no son tablas creadas.

| Colección propuesta | Clave y metadatos mínimos | Acceso previsto |
| --- | --- | --- |
| sources | id, nombre, URL, licencia, calendario de publicación | lector autorizado |
| observations | source_id, series_id, período, published_at, fetched_at, revision_id, valor, unidad | servicio escribe; lector autorizado lee |
| thesis_versions | id, índice, horizonte, versión de modelo, corte de datos, evidencia, contradicciones, causas de cambio | servicio editorial escribe; lector autorizado lee |
| user_notes | id, user_id, contenido, referencia, created_at, updated_at | exclusivamente propietario |
| learning_resources | id, origen, derechos, fecha, conceptos vinculados | lector autorizado según derechos |
| radar_* | a proponer por Radar | definir al integrar |

Conservar revisiones de observaciones, no sobrescribir el dato tal como se conocía.
Las observaciones requieren fechas reales; no sustituir published_at por fetched_at.
Una nota privada debe quedar aislada por usuario con políticas de filas; el usuario se
resuelve en el servidor, no desde un user_id suministrado por el navegador. No guardar
una contraseña compartida en ninguna de estas colecciones. La autorización por
suscripción se definirá al integrar identidad, no se simula en esta fase.

Para futuras migraciones: confirmar Supabase, esquema, restricciones, índices, política de
retención, permisos, respaldo y prueba de aislamiento. Este archivo es diseño lógico,
no una migración ejecutable ni una afirmación de almacenamiento existente.
