/** Dated editorial assessment supplied by Course Lab. Manual snapshot, never a live feed. */
export const REGIME_CUT_RELEASED = true;
export const REGIME_CUT = {
  id: "us-2026-09-30-course-lab-v1",
  asOf: "2026-09-30T15:02:16+02:00",
  label: "30 sep 2026 · 15:02 CEST",
  title: "Expansión bajo presión",
  status: "mixed_unresolved_region" as const,
  exactCoordinates: null,
  confirmedCrossing: false,
  summary: "La actividad presente sigue creciendo, mientras los adelantados pierden fuerza y la dirección de la inflación no es uniforme.",
  growth: { level: "Actividad todavía expansiva", direction: "Mixta, con sesgo de desaceleración" },
  inflation: { level: "Precios sobre el objetivo de la Fed", direction: "Mixta, con presión de corto plazo" },
  supports: "PIB, consumo real y CEI sostienen la expansión presente. El LEI débil introduce una advertencia sobre el impulso futuro.",
  contradicts: "El consumo gana fuerza, pero los adelantados se enfrían. La inflación mensual repunta mientras algunas tasas anuales se estabilizan o bajan.",
  change: "Una pérdida amplia y persistente de actividad junto con inflación que vuelva a acelerar reforzaría la deriva estanflacionaria. Actividad resistente con moderación extendida de precios favorecería otra lectura.",
  evidence: [
    { id: "gdp", name: "PIB real · producción descontando inflación", family: "Crecimiento", observed: "T2 de 2026", published: "30 sep 2026 · 08:30 EDT", value: "+2,2 % anualizado", meaning: "Crece; T1 revisado fue +2,5 %. T2 pasa de +1,5 % a +2,2 % por revisión.", provider: "BEA", url: "https://www.bea.gov/news/2026/gdp-third-estimate-industries-corporate-profits-state-gdp-and-state-personal-income-2nd" },
    { id: "consumption", name: "Consumo real · gasto descontando inflación", family: "Crecimiento", observed: "Agosto de 2026", published: "30 sep 2026 · 08:30 EDT", value: "+0,6 % mensual", meaning: "Frente a +0,1 % en julio revisado. Confirma fuerza presente, no una tendencia por sí solo.", provider: "BEA", url: "https://www.bea.gov/news/2026/personal-income-and-outlays-august-2026" },
    { id: "lei", name: "LEI · señales adelantadas de EE. UU.", family: "Crecimiento", observed: "Agosto de 2026", published: "18 sep 2026", value: "−0,1 % mensual", meaning: "El impulso futuro se debilita. Su señal de recesión no estaba activada.", provider: "Conference Board", url: "https://www.conference-board.org/topics/us-leading-indicators/index.cfm" },
    { id: "cei", name: "CEI · actividad presente de EE. UU.", family: "Crecimiento", observed: "Agosto de 2026", published: "18 sep 2026", value: "+0,1 % mensual", meaning: "La actividad presente avanza. Empleo y producción ya forman parte del indicador: no suman votos adicionales.", provider: "Conference Board", url: "https://www.conference-board.org/topics/us-leading-indicators/index.cfm" },
    { id: "pce", name: "PCE · precios del gasto de consumo", family: "Inflación", observed: "Agosto de 2026", published: "30 sep 2026 · 08:30 EDT", value: "3,4 % anual · +0,3 % mensual", meaning: "Sin alimentos y energía: 3,0 % anual y +0,2 % mensual. El impulso mensual es mayor que en julio.", provider: "BEA", url: "https://www.bea.gov/news/2026/personal-income-and-outlays-august-2026" },
    { id: "cpi", name: "IPC · precios pagados por consumidores", family: "Inflación", observed: "Agosto de 2026", published: "11 sep 2026 · 08:30 EDT", value: "3,4 % anual · +0,4 % mensual", meaning: "La anual general se mantiene; sin alimentos y energía baja de 2,5 % a 2,4 %. La energía impulsa parte del repunte mensual.", provider: "BLS", url: "https://www.bls.gov/news.release/archives/cpi_09112026.htm" },
    { id: "fed", name: "Fed · banco central de Estados Unidos", family: "Confirmación", observed: "16 sep 2026", published: "16 sep 2026 · 14:00 EDT", value: "Tipo oficial: 3,75–4,00 %", meaning: "Subida de 0,25 puntos porcentuales. Confirma presión del coste del dinero; no define los ejes por sí sola.", provider: "Reserva Federal", url: "https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm" },
  ],
};
