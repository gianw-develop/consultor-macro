# Calculadora AWNexus publicada · 29 de octubre de 2026

Estado: publicada y comprobada en el dominio real, aproximadamente 10:15–10:17 Madrid.

- Commit de aplicación: `d1bb05bb7e3df72acfa313fea361d4d1b4efca3f`.
- Despliegue READY: `dpl_49pPm2BbbLEEaojjGEbbTGh9GRNY`.
- Ruta real: https://consultormacro.com/annienexus/calculadora
- URL de despliegue: https://consultor-macro-kiv1zdln2-breans-projects-8de55b34.vercel.app
- Publicado desde archivo Git del commit exacto en copia aislada: `/var/folders/_n/zdsx1pgd2bv56g62qt7_5w280000gn/T/awn-calculator-release-20261029-60bitu0v`. Conserva actualización macro 81611c1 y corrección de pruebas 1877cf3. No se incluyeron los cambios locales de nube ni AGENTS generado por desarrollo. No hubo push de archivos privados a GitHub.

## Validación de publicación

- TypeScript y 111/111 pruebas versionadas aprobadas en la copia aislada del commit.
- Compilación de producción Turbopack aprobada localmente y en Vercel (complementa la validación webpack realizada por Master).
- Chrome, usuario autenticado: seis rutas SPX/DIA/GLD/QQQ/NDX/DJIA, selector mid/bid/ask, importación, ajustes y mapa presentes.
- `SPX 7.700`: error explícito de ambigüedad; ninguna conversión.
- `SPX 7700`, `QQQ 725`, `GLD 375`: sin calibración, resultado vacío y aviso «Añade cotizaciones emparejadas en Ajustes».
- Lote de los mismos tres niveles: tres filas con destino correcto, sin valor inventado y calibración no válida.
- Limpieza comprobada y datos de prueba eliminados; la pestaña final queda vacía y abierta para el usuario.
- Protección anónima comprobada en ventana de incógnito temporal: petición directa redirige a `https://consultormacro.com/acceso?next=%2Fannienexus%2Fcalculadora`, con correo autorizado/contraseña y sin calculadora visible. Se cerró solo esa ventana temporal; sesión original conservada.
- Master comunicó comprobación independiente de las tres entradas bloqueadas en el dominio real; no sustituye la comprobación directa anterior.

## Límite de la entrega

Software validado; precisión real frente a cotizaciones de la cuenta FTMO todavía pendiente. No existe feed conectado ni pares reales sincronizados del usuario. La interfaz declara datos manuales no verificados y resultados estimados; sin calibración no entrega niveles. No se simuló hora de mercado ni se introdujeron cotizaciones ficticias en producción para presentar resultados operativos.

## Evidencias

Carpeta: `/Users/gianw/Documents/ChatGPT/Wall Street Visual Intelligence/output/annienexus/calculadora-publicacion-2026-10-29/`.

- `deployment.json`: SHA, despliegue y URLs.
- `production.png`: captura final de producción.
- `production-clean.txt`: interfaz inicial completa.
- `ambiguous-price.txt`: rechazo de 7.700.
- `production-batch.txt`: lote bloqueado sin calibración.
- `anonymous-access.txt` y `anonymous-access.png`: acceso privado.
