# Consultor Macro

Dashboard pre-market personal para swing trading de índices con lectura macro de flujo institucional.

## Qué hace

- Evalúa si el entorno está en `EXPANSIÓN`, `CAÍDA` o `NEUTRAL`
- Usa Yahoo Finance como fuente principal sin API key
- Refresca datos cada 5 minutos
- Protege el acceso con password simple y cookie HttpOnly de 30 días
- Muestra contexto adicional de petróleo, futuros y calendario económico semanal
- Integra el módulo privado `10X Stock Screener` en una vista separada
- Guarda un historial liviano de condiciones en `localStorage`

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4

## Variables de entorno

Crea un archivo `.env.local`:

```bash
SITE_PASSWORD="macro2026"
```

Si no defines `SITE_PASSWORD`, el proyecto usa `macro2026` como valor por defecto para facilitar el primer arranque local.

Para cargar el `10X Stock Screener` desde Supabase en vez del dataset local:

```bash
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_TENX_TABLE="tenx_companies"
```

Si no defines Supabase, el dashboard usa `src/data/tenx-screener.json`.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Build de producción

```bash
npm run build
npm start
```

## Fuente de datos

Símbolos usados desde Yahoo Finance:

- `^TNX` → US10Y
- `DX-Y.NYB` → DXY
- `USDJPY=X` → USDJPY
- `^VIX` → VIX
- `CL=F` → WTI
- `BZ=F` → Brent
- `ES=F` → ES
- `NQ=F` → NQ
- `YM=F` → YM

Si Yahoo no responde o algún símbolo falla, la UI mantiene el dashboard operativo y muestra mensajes de disponibilidad parcial.

## Calendario económico semanal

El calendario está en:

- `src/data/economic-events.json`

Puedes actualizarlo manualmente cada semana sin tocar lógica de la app. Mantén solo eventos relevantes para tu proceso:

- CPI
- PPI
- NFP
- PCE
- FOMC
- GDP
- Jobless Claims
- Bond Auctions
- Fed Speeches

## 10X Stock Screener

La vista separada esta en:

- `/10x`

Desde el dashboard principal puedes abrirla en otra pestana con el boton `Abrir 10X`.

El módulo sigue la documentación privada de `/Users/gianw/Documents/10X Stock Screener`:

- Score total sobre `100`
- Supervivencia / riesgo: `30`
- Calidad / crecimiento: `40`
- Potencial / catalizadores: `30`
- Prioridad tematica dentro de potencial para IA/semiconductores, defensa/ciber, biotech y energia
- Clasificaciones: `Candidata prioritaria`, `Investigar a fondo`, `Watchlist`, `Descartar`

La herramienta no emite recomendaciones de compra o venta. Ordena candidatos para investigación adicional y muestra fortalezas, riesgos, alertas y datos faltantes.

La pagina `/10x` se refresca automaticamente cada 5 minutos. Si usa Supabase, cada refresh vuelve a leer la tabla. Si usa `src/data/tenx-screener.json`, solo cambiara cuando edites ese archivo y el servidor vuelva a servir esos datos.

El olfato de regimen vive en:

- `src/data/tenx-regimes.json`

Cada regimen tiene `status`, `priority`, `thesis`, `keywords` y `marketProxies`. Usa:

- `active` para temas dominantes ahora.
- `watch` para temas que solo deben sumar si hay catalizador.
- `inactive` para apagar un tema sin borrarlo.

Ejemplo: si aparece una pandemia, cambia `pandemic_biotech` de `watch` a `active`. Si IA deja de liderar, cambia `ai_infrastructure` a `watch` o baja su `priority`.

La vista `/10x` calcula un `Macro Regime Radar` combinando:

- Noticias globales recientes por keyword via GDELT DOC API.
- Confirmacion de mercado usando proxies/ETFs desde Yahoo Finance.
- Prioridad manual del regimen.

El endpoint protegido `/api/10x/radar` refresca esa lectura. Si GDELT limita o no responde, la vista degrada usando proxies de mercado y configuracion local.

La tabla Supabase esperada puede usar columnas snake_case equivalentes al CSV documentado: `ticker`, `company_name`, `exchange`, `sector`, `industry`, `market_cap_usd`, `enterprise_value_usd`, `avg_daily_volume_usd`, `share_price`, `revenue_growth_yoy_pct`, `gross_margin_pct`, `ebitda_margin_trend`, `net_margin_trend`, `free_cash_flow_trend`, `roic_trend`, `cash_usd`, `total_debt_usd`, `cash_runway_months`, `shares_outstanding_growth_pct`, `drawdown_12m_pct`, `delisting_risk`, `bankruptcy_risk`, `insider_ownership_pct`, `recent_insider_buying`, `recent_insider_selling`, `tam_estimate_usd`, `ev_to_sales`, `catalysts`, `notes`, `data_source`, `data_date`.

## Flujo de autenticación

- Pantalla de login minimalista
- Password enviada a `POST /api/auth/login`
- Cookie HttpOnly válida por 30 días
- `POST /api/auth/logout` elimina la sesión

## Crear repo en GitHub y subir el proyecto

1. Crea un repositorio nuevo en GitHub
2. Copia la URL remota del repo
3. Ejecuta:

```bash
git remote add origin <TU_URL_DE_GITHUB>
git push -u origin main
```

## Conectar a Vercel

1. Entra a Vercel
2. Importa el repositorio de GitHub
3. Framework detectado: Next.js
4. Añade la variable de entorno:

```bash
SITE_PASSWORD=tu_password_real
```

5. Despliega

## Apuntar el dominio `consultormacro.com`

1. Abre tu proyecto en Vercel
2. Ve a `Settings` → `Domains`
3. Añade `consultormacro.com`
4. Añade también `www.consultormacro.com` si quieres redirección
5. Configura en tu DNS los registros que Vercel indique
6. Espera la validación SSL automática

## Notas operativas

- La hora siempre se muestra en ET
- El historial de condiciones se guarda en el navegador del usuario
- La app está optimizada para una sola pantalla y uso móvil
