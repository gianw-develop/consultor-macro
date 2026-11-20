# Ranking diario de sectores · preparación 21/10/2026

El usuario aprobó ordenar XLK/XLF/XLY/XLP/XLC/XLU de mayor a menor variación porcentual diaria. **No activado ni publicado.** La tabla publicada sigue con orden fijo y lo indica.

Se prepara `sector-ranking.ts`: cambio = (precio / cierre anterior − 1) × 100, orden descendente sin redondear, empates compartidos con orden alfabético, datos inválidos o de otra sesión al final como ausentes. No asigna puestos si faltan sectores. Recalcular con cada nuevo corte del proveedor. Los datos de prueba son sintéticos y nunca se muestran en la web.

## Dependencia pendiente
La tabla actual es un iframe TradingView `market-quotes`; AWNexus no recibe sus cotizaciones. El configurador oficial Market Data examinado no ofrece ordenación y el clic en Chg % no cambió el orden de la vista previa. No se ha encontrado una opción documentada que permita la clasificación automática de los seis símbolos. No se extraen cotizaciones del iframe ni se sustituye por una clasificación manual.

- Configurador: https://www.tradingview.com/widget-docs/widgets/watchlists/market-data/
- Integración: https://www.tradingview.com/widget-docs/tutorials/web-components/configuring/
- Variante gratuita previamente autorizada: mantiene atribución y retardo.

Falta conectar una fuente con acceso programático y permiso de visualización para estos seis ETF, o una opción oficial del widget que implemente el orden dinámico. No se ha contratado ningún proveedor. No hay credencial de cotizaciones configurada en el proyecto.

## Integración cuando exista la fuente
El adaptador debe aportar último precio de sesión regular y cierre anterior con igual criterio de ajuste, fecha de sesión de la bolsa, hora de cotización, fuente y retardo. Debe excluir pre/posmercado de esta comparación. Mantener el último corte coherente con su fecha ante fallos; no rotularlo como actual ni mezclar sesiones. El refresco tendrá la frecuencia permitida por el proveedor. Usar el orden devuelto al renderizar la lista, conservando la selección del gráfico por símbolo. El gráfico diario porcentual ya publicado permanece independiente.

Validar cambios de liderazgo, sesión cerrada/festivos, fallos, datos ausentes y visualización móvil antes de publicar. Las pruebas unitarias de la preparación no acreditan actualización ni comprobación en producción.
