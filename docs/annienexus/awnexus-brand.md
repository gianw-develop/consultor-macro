# AWNexus — marca y acceso, 1 de octubre de 2026

## Ajuste publicado — tamaño del logo de acceso (01/10/2026)

Commit `20ec7a0`, producción Ready `dpl_CQosF3NGZ2enL8oKZjKTe1sV659J`, https://consultormacro.com/acceso. Logo de acceso a 215 px en escritorio/tableta y 180 px en móvil, alineado a la izquierda y con separación del título conservada. Antes se midieron 429,969 px en Chrome; la hoja publicada anterior no incluía las reglas de marca. Publicación reconstruida sin caché; hoja nueva `15g_p70x1mh1z.css` comprobada con ambas anchuras. Solo se editaron las dos anchuras de acceso; geometría, colores, favicon AWN y mínimo de contraseña de 8 caracteres conservados.

Lint y compilación local/Vercel correctos. Revisión visual real con Google Chrome en escritorio y simulación de tableta (900 × 1000) y móvil (390 × 844): marca sin recortes, proporciones y alineación correctas. Evidencia: `output/annienexus/logo-acceso-reducido-2026-10-01/` (tres capturas y `production-checks.json`). Sin push al repositorio público; sin cambios de cuentas ni credenciales.

Referencia aprobada: proyecto compartido, output/annienexus/aw-nexus-logos-2026-10-01/05-awnexus-icono-awn.png; decisión en research/ANNIENEXUS-DISENO-UNICO.md. Nombre visible AWNexus (sin espacio), icono AWN completo, AW entrelazado, acento cian y Nexus fino.

Adaptación web vectorial en src/shared/ui/brand.tsx, usada en acceso, cabecera común de las cuatro pestañas y pie. Metadatos y crédito visible actualizados. Recursos SVG para fondos claro/oscuro en public/brand; favicon AWN con N reforzada para tamaño pequeño. No se modifican dominio, cuentas, rutas, claves de almacenamiento ni datos históricos. Los recursos gráficos de marca son públicos; biblioteca y apuntes siguen autenticados.

Aplicado el parche password-minimo-8.patch: formulario de registro y API exigen 8 caracteres; entrada a cuentas existentes conserva su validación previa. Se añade ayuda visible «Mínimo 8 caracteres». Prueba de frontera 7/8 con proveedor simulado: 7 se rechaza antes de contactar Supabase; 8 llega a signUp. No crea cuenta ni contraseña real. No se cambia una contraseña existente ni se confirma un correo manualmente.

Lint, TypeScript, compilación y cinco pruebas de autenticación correctos. Recursos vectoriales renderizados e inspeccionados, incluido favicon 32 px. La extensión de Chrome no respondió; se completó la revisión visual en Google Chrome mediante sus controles nativos. Se observan el logotipo AWNexus, favicon AWN, formulario de registro y ayuda «Mínimo 8 caracteres». Captura real: registro-publicado.png. Evidencia técnica y recursos en output/annienexus/awnexus-publicacion-2026-10-01 del proyecto compartido.

Publicada el 01/10/2026, comprobada a las 15:43 Madrid. Despliegue dpl_4DGfBCkV2Vig35sVuT768Jq4qH6S, commit de aplicación 6875e8d, dominio https://consultormacro.com/acceso. Los cuatro SVG publicados coinciden byte a byte con los recursos locales. JavaScript servido contiene minLength=8 para registro; API rechaza 7 con mensaje exacto; apuntes sin sesión devuelven 401. No se creó una cuenta ni se modificó ninguna contraseña real. La aceptación de 8 se prueba en la frontera de aplicación con proveedor simulado, no mediante un registro real.
