/** Availability audit, distinct from an observation's period or original release date. */
const rows = [
  {name:"Michigan · confianza y expectativas de inflación",period:"Octubre 2026 · final",release:"23/10/2026 · revisa el preliminar del 9/10",next:"2026-11-06T15:00:00Z",label:"06/11 · 16:00 Madrid",url:"https://www.sca.isr.umich.edu/"},
  {name:"CLI · señales adelantadas de la OCDE",period:"Septiembre 2026",release:"Última consulta válida: 21/10; comprobación 04/11 pendiente de verificación humana",next:null,label:"Próxima fecha no confirmada",url:"https://data-explorer.oecd.org/vis?df[ds]=DisseminateFinalDMZ&df[id]=DSD_STES%40DF_CLI&df[ag]=OECD.SDD.STES&dq=.M.LI...AA...H&lom=LASTNPERIODS&lo=10&to[TIME_PERIOD]=false&vw=tb"},
  {name:"LEI / CEI · señales tempranas / actividad presente",period:"Septiembre 2026 · preliminar",release:"22/10/2026 · julio/agosto revisados",next:"2026-11-19T15:00:00Z",label:"19/11 · 16:00 Madrid",url:"https://www.conference-board.org/topics/us-leading-indicators"},
  {name:"M1 · efectivo y depósitos disponibles",period:"Septiembre 2026",release:"27/10/2026 · historial revisado",next:null,label:"Próxima fecha no confirmada",url:"https://www.federalreserve.gov/releases/h6/20261027/"},
  {name:"Ventas minoristas · gasto en comercios",period:"Septiembre 2026",release:"15/10; julio/agosto revisados",next:"2026-11-17T13:30:00Z",label:"17/11 · 14:30 Madrid",url:"https://fred.stlouisfed.org/series/RSAFS"},
  {name:"PCE · precios y gasto del consumo",period:"Septiembre 2026",release:"29/10/2026 · julio/agosto revisados",next:"2026-11-25T13:30:00Z",label:"25/11 · 14:30 Madrid",url:"https://www.bea.gov/data/income-saving/personal-income"},
  {name:"PIB · producción de la economía",period:"Tercer trimestre 2026",release:"29/10/2026 · avance revisable",next:"2026-11-25T13:30:00Z",label:"25/11 · 14:30 Madrid",url:"https://www.bea.gov/data/gdp/gross-domestic-product"},
];
export function DataAvailability({now}:{now:string}) {
  return <details className="economic-detail">
    <summary>Vigencia de los datos · cortes por fuente <span>＋</span></summary>
    <p className="small">Comprobación del 04/11: PIB y PCE de BEA, solicitudes de DOL del 29/10 y Tesoro hasta el 03/11 incorporados. CLI de la OCDE pendiente de comprobación por verificación humana del proveedor. Las demás series conservan sus fechas de consulta: esta actualización no vuelve a verificar todas las fuentes.</p>
    <div className="pillar-table-wrap"><table><caption>Disponibilidad contrastada con las fuentes · corte de esta revisión</caption><thead><tr><th scope="col">Indicador</th><th scope="col">Último periodo comprobado</th><th scope="col">Publicación / versión</th><th scope="col">Siguiente publicación prevista</th></tr></thead><tbody>{rows.map(row=><tr key={row.name}><th scope="row"><a href={row.url} target="_blank" rel="noreferrer">{row.name} ↗</a></th><td>{row.period}</td><td>{row.release}</td><td>{row.label}{row.next&&Date.parse(now)>=Date.parse(row.next)&&<><br/>Resultado por verificar</>}</td></tr>)}</tbody></table></div>
    <p className="micro">Esta comprobación no es un flujo en vivo. Llegar a la fecha prevista no incorpora ni valida el nuevo resultado. Los cálculos conservan las fechas de sus insumos; comprobar disponibilidad no cambia el mes que miden.</p>
  </details>;
}
