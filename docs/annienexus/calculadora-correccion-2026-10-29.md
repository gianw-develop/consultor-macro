# Corrección de alcance de la calculadora — 29 octubre 2026

El usuario rechazó NDX/DJIA y el selector de etiquetas mostrado en su foto («no pedí nada de esto»). Prevalece sobre propuestas anteriores.

- `b688e6b`: solo SPX, DIA, GLD y QQQ; NDX/DJIA tampoco se admiten por importación.
- `5b55d799a90fe9bdf0f78922f61043ba0092b2fc`: elimina los selectores de tipo de nivel. La entrada individual solo pide precio; el pegado admite símbolo;precio sin categoría. Se conserva compatibilidad con archivos anteriores.
- Se confirmó que las etiquetas no afectaban al cálculo.
- Pruebas: 112/112 en la versión de cuatro símbolos; después, 22/22 pruebas de calculadora incluyendo pegado sin categoría, ESLint y compilación local correctos.

## Limitación operativa pendiente

La conversión automática NO está resuelta. AWNexus no dispone de un canal de cotizaciones conectado a la cuenta FTMO ni de pares actuales sincronizados con el instrumento de origen. El usuario confirmó MT5 solo en móvil, en otro dispositivo. No se han obtenido credenciales ni instalado conectores. No sustituir la conexión ausente por precios ficticios o factores antiguos, ni presentar pruebas de bloqueo como una conversión operativa exitosa.

No volver a añadir etiquetas de derivados a la entrada simple sin solicitud del usuario.

## Publicación y comprobación

Despliegue READY `dpl_D8LAL1baGkJ3SXmegKt4SoJoeedx`, alias https://consultormacro.com, desde archivo limpio del commit 5b55d79. Compilación remota correcta. Chrome autenticado confirma cuatro filas y ausencia de selectores de tipo. Entrada SPX 7700 y lote QQQ;725 / GLD;375 aceptados; resultados permanecen bloqueados por falta de calibración. Esto verifica la corrección de interfaz, NO una conversión automática funcional. Campos limpiados después.

Evidencia: `output/annienexus/calculadora-publicacion-2026-10-29/sin-categorias.png` y `sin-categorias-prueba.txt`.
