"use client";
import Image from "next/image";
import { InflationPillar, RetailPillar, ClaimsPillar, MoneyPillar } from "./economic-pillars";
import { PillarChart } from "./pillar-chart";
import { PILLARS_CHECKED_AT } from "./economic-pillars-data";
import { useEffect, useState } from "react";
import { SectionHeading, Tag } from "../../shared/ui/primitives";
import { CALENDAR_CHECKED_AT, CALENDAR_WEEK, ECONOMIC_EVENTS, PREVIOUS_WEEK_EVENTS, NEXT_WEEK_EVENTS, calendarSummary, eventStatus, madridEventTime, type EconomicEvent } from "./economic-calendar";

export function EconomicContext({ now }: { now: string }) {
  const [clock, setClock] = useState(now);
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toISOString()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const summary = calendarSummary(ECONOMIC_EVENTS, clock);
  return <section className="economic-context" aria-label="Actividad, inflación, consumo y empleo">
    <p className="pillar-cut micro">Base de ventas: {madridEventTime(PILLARS_CHECKED_AT)} (Madrid), 2026. M1, IPC y solicitudes conservan sus propias fechas, indicadas en sus tarjetas. Cada tarjeta conserva el periodo observado y la fecha de publicación. Sin datos en vivo.</p>
    <section className="gregory-group" aria-labelledby="gregory-title">
      <header className="pillar-group-heading"><h2 id="gregory-title">Mis indicadores adelantados</h2><p className="small muted">Empleo, compras y dinero disponible.</p><details className="economic-detail"><summary>ⓘ Cómo leer estos indicadores <span>＋</span></summary><p className="small muted">Se observan juntos para estudiar tendencias de meses. Su capacidad de anticipación depende del periodo y del contexto; no es universal ni una señal de compra o venta. PIB e inflación se muestran debajo como contexto observado.</p></details></header>
      <div className="gregory-grid"><ClaimsPillar/><RetailPillar/><MoneyPillar/></div>
    </section>
    <header className="pillar-group-heading pillar-cut"><h2>Contexto · actividad e inflación</h2><p className="small muted">PIB e IPC ayudan a interpretar los tres pilares. Las brújulas compuestas permanecen separadas como contraste.</p></header>
    <article className="panel gdp-panel">
      <SectionHeading title="PIB · actividad de EE. UU."><Tag tone="blue">Avance 3T · 29 oct</Tag></SectionHeading>
      <p className="small muted">PIB: valor de los bienes y servicios producidos. Datos reales, descontando la inflación.</p>
      <div className="gdp-periods"><div><span>Abril–junio 2026</span><strong>+2,2 %</strong><small>Segundo trimestre · tercera estimación</small></div><div><span>Julio–septiembre 2026</span><strong>+3,4 %</strong><small>Tercer trimestre · avance revisable</small></div></div>
      <p className="micro">Crecimiento trimestral anualizado · %</p>
      <PillarChart title="PIB real de 2026: primer trimestre 2,5; segundo 2,2; tercero 3,4 por ciento, tasas anualizadas" labels={["1T 2026","2T 2026","3T 2026"]} series={[{name:"PIB real",values:[2.5,2.2,3.4],color:"#56baff"}]} bars/>
      <p className="small">El crecimiento pasa de 2,2 % a 3,4 % anualizado: <strong>1,2 puntos porcentuales más.</strong> El avance del tercer trimestre es revisable.</p>
      <p className="micro">Tasas trimestrales anualizadas: el ritmo de un trimestre expresado como si durase un año. No son el crecimiento acumulado del año.</p>
      <details className="economic-detail"><summary>Ver historial del primer semestre y lectura <span>＋</span></summary>
        <a href="/annienexus/economy/pib-eeuu-2026-primer-semestre.png" target="_blank" rel="noreferrer"><Image unoptimized src="/annienexus/economy/pib-eeuu-2026-primer-semestre.png" width={2080} height={1280} alt="PIB real de Estados Unidos: primer trimestre 2026, 2,5 por ciento; segundo, 2,2. Revisión al alza de 0,4 y 0,7 puntos respectivamente." sizes="(max-width: 900px) 100vw, 50vw"/></a>
        <p className="small">La revisión del 30 de septiembre elevó el primer trimestre de 2,1 % a 2,5 %, y el segundo de 1,5 % a 2,2 %. El dato describe enero–junio; no mide la sesión de hoy.</p>
        <p className="small">Actividad → ventas y beneficios → índices. Un crecimiento más firme puede apoyar a Dow y S&amp;P 500; si también eleva la inflación y los rendimientos de bonos, puede presionar a Nasdaq. Son relaciones condicionales, no señales.</p>
        <p className="micro">Horizonte 1–3 y 3–6 meses: contrastar con empleo, consumo y precios. Tercer trimestre incorporado como avance; siguiente estimación prevista: 25 de noviembre. El gasto real de consumo de septiembre subió menos del 0,1 % mensual (PCE), frente a +0,5 % en agosto revisado. Es distinto de las ventas minoristas reales.</p>
      </details>
      <p className="source-line"><a href="https://www.bea.gov/news/2026/gdp-advance-estimate-3rd-quarter-2026" target="_blank" rel="noreferrer">BEA · publicación del 29/10/2026 ↗</a></p>
    </article>
    <InflationPillar/>
    <article id="agenda" className="panel agenda-panel agenda-compact">
      <details className="agenda-disclosure" open>
        <summary><span>Agenda · {CALENDAR_WEEK}</span><Tag tone="amber">{summary.published} publicados · {summary.scheduled} programados{summary.unverified > 0 ? ` · ${summary.unverified} por verificar` : ""}</Tag></summary>
        <p className="small muted">Horarios de Madrid. Última incorporación verificada el {madridEventTime(CALENDAR_CHECKED_AT)} de 2026. Incorporados PIB, PCE y solicitudes del 29/10, ISM de octubre, JOLTS y comercio exterior. El CLI de la OCDE sigue pendiente de comprobación; conserva su corte anterior. Cada resultado conserva su fecha de comprobación.</p>
        <p className="small">Consulta qué se ha publicado y qué falta esta semana. Cada resultado separa el periodo medido, la publicación y el dato anterior, incluidas sus revisiones.</p>
        <ul className="economic-events">{ECONOMIC_EVENTS.map(event => <CalendarEvent key={`${event.id}-${event.scheduledAt}`} event={event} now={clock}/>)}</ul>
        <details className="economic-detail"><summary>Resultados anteriores · octubre <span>＋</span></summary><ul className="economic-events">{PREVIOUS_WEEK_EVENTS.map(event => <CalendarEvent key={`${event.id}-${event.scheduledAt}`} event={event} now={clock}/>)}</ul></details>
        {NEXT_WEEK_EVENTS.length>0&&<h3>{NEXT_WEEK_EVENTS.every(e=>eventStatus(e,clock)!=='Programado')?'Publicaciones de la semana siguiente':'Próximas publicaciones'}</h3>}
        <ul className="economic-events">{NEXT_WEEK_EVENTS.map(event => <CalendarEvent key={`${event.id}-${event.scheduledAt}`} event={event} now={clock}/>)}</ul>
        <p className="micro">Actualización editorial, no en vivo. Al llegar la hora, un evento pasa a «Resultado por verificar» hasta contrastar la publicación oficial. No se ha incorporado un consenso de previsiones.</p>
        <p className="micro">La agenda describe publicaciones. La lectura del Cerebro se revisa por separado con sus insumos y vencimiento visibles.</p>
      </details>
      <p className="small muted">{summary.next ? <>Próximo evento programado: {summary.next.title} · {madridEventTime(summary.next.scheduledAt)} (Madrid).</> : "No quedan eventos programados en esta agenda: está pendiente de actualizar con la semana en curso."}{summary.unverified > 0 && ` Hay ${summary.unverified} resultado(s) por verificar.`}</p>
    </article>
  </section>;
}

function CalendarEvent({event, now}: {event: EconomicEvent; now: string}) {
  const status = eventStatus(event, now);
  const result = status === "Publicado · verificado" ? event.result : undefined;
  return <li>
    <time dateTime={result?.publishedAt ?? event.scheduledAt}>{madridEventTime(result?.publishedAt ?? event.scheduledAt)}</time>
    <div><strong>{event.title}</strong><p className="micro">Periodo: {event.period}</p>
      {result && <p className="small">{result.headline}</p>}
      <details><summary>{status} · {result ? "ver datos y fuente" : "qué observar"}</summary>
        <p className="small">{event.relevance}</p>
        {result && <>{result.details.map(detail => <p className="small" key={detail}>{detail}</p>)}<p className="small"><strong>Lectura del dato:</strong> {result.reading}</p><p className="micro">Publicado: {madridEventTime(result.publishedAt)} · verificado: {madridEventTime(result.verifiedAt)} (Madrid), 2026.</p></>}
        {!result && <p className="micro">Publicación prevista: {madridEventTime(event.scheduledAt)} (Madrid), 2026. Resultado y dato previo revisado aún sin incorporar.</p>}
        <a className="small" href={event.url} target="_blank" rel="noreferrer">Consultar {event.source} ↗</a>
      </details>
    </div>
  </li>;
}
