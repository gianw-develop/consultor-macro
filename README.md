# Consultor Macro

Dashboard pre-market personal para swing trading de índices con lectura macro de flujo institucional.

## Qué hace

- Evalúa si el entorno está en `EXPANSIÓN`, `CAÍDA` o `NEUTRAL`
- Usa Yahoo Finance como fuente principal sin API key
- Refresca datos cada 5 minutos
- Protege el acceso con password simple y cookie HttpOnly de 30 días
- Muestra contexto adicional de petróleo, futuros y calendario económico semanal
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