import re

with open("src/components/dashboard-client.tsx", "r") as f:
    content = f.read()

# Add getActionShort
code_addition = """
function getActionShort(title: string) {
  if (title.includes("COMPRAS")) return "COMPRAR retrocesos";
  if (title.includes("VENTAS")) return "VENDER rebotes";
  return "NO OPERAR";
}

function getTodayEvents(schedule: DashboardData['weeklySchedule']) {
  const todayIndex = new Date().getDay() - 1; // 0 is Monday
  if (todayIndex < 0 || todayIndex > 4) return [];
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const todayName = days[todayIndex];
  return schedule.find(d => d.day === todayName)?.events || [];
}
"""

content = content.replace("const regimeStyles = {", code_addition + "\nconst regimeStyles = {")

# Header Resumen
resumen_jsx = """
        {/* Banner de Cambio de Régimen */}
        {history.length > 1 && history[0].regime !== history[1].regime && history[1].regime !== "neutral" ? (
          <div className="rounded-xl border border-orange-300 bg-orange-50 px-4 py-3 text-orange-800 shadow-sm">
            <div className="flex items-center gap-2 font-bold mb-1">
              <span>⚠️ CAMBIO DE RÉGIMEN DETECTADO</span>
            </div>
            <div className="text-sm">
              Ayer: {history[1].label} → Hoy: {history[0].label}<br/>
              Precaución: flujo cambió de dirección
            </div>
          </div>
        ) : null}

        {/* Mini resumen ejecutivo */}
        <div className="rounded-lg bg-gray-100 py-2 px-4 text-sm font-medium text-slate-700 flex flex-wrap gap-2 items-center">
          <span>{formatEtDateLabel(clock)}</span>
          <span className="text-slate-400">·</span>
          <span>{formatEtTimeLabel(clock)}</span>
          <span className="text-slate-400">·</span>
          <span className={data.condition.title.includes("COMPRAS") ? "text-emerald-700 font-bold" : data.condition.title.includes("VENTAS") ? "text-rose-700 font-bold" : ""}>
            {getActionShort(data.condition.title)}
          </span>
          <span className="text-slate-400">·</span>
          <span>Score {data.condition.score}/4</span>
          <span className="text-slate-400">·</span>
          <span className={getTodayEvents(data.weeklySchedule).length > 0 ? "text-amber-700" : ""}>
            {getTodayEvents(data.weeklySchedule).length > 0 
              ? `⚠️ ${getTodayEvents(data.weeklySchedule)[0].name} ${getTodayEvents(data.weeklySchedule)[0].timeEt}` 
              : "Sin noticias hoy ✅"}
          </span>
        </div>
"""

content = content.replace("{refreshState ?", resumen_jsx + "\n        {refreshState ?")

# Signal Strength Color
content = content.replace(
    '<span className="rounded-full bg-white/70 px-3 py-1 font-medium">\n                {data.condition.strengthLabel}\n              </span>',
    '<span className={`rounded-full bg-white/70 px-3 py-1 font-medium ${data.condition.score === 4 ? "text-emerald-700 font-bold" : data.condition.score === 3 ? "text-amber-600" : "text-slate-500"}`}>\n                {data.condition.strengthLabel}\n              </span>'
)

# Note color and placement in table
# The note is already there: <span className="text-xs text-slate-500">{snapshot.note}</span>

# Calendar Today Events logic
calendar_header = """<div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                📅 Eventos de la semana
              </h3>"""

calendar_today_logic = """
                <div
                  key={day.day}
                  className={`rounded-2xl border px-4 py-4 ${
                    new Date().getDay() - 1 === ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].indexOf(day.day)
                      ? "border-amber-300 bg-amber-50/50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-2">
                    {day.day}
                    {new Date().getDay() - 1 === ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].indexOf(day.day) && (
                      <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">HOY</span>
                    )}
                  </div>
                  {day.events.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      {new Date().getDay() - 1 === ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].indexOf(day.day) 
                        ? "Sin noticias de alto impacto hoy ✅" 
                        : "—"}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {new Date().getDay() - 1 === ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].indexOf(day.day) && (
                        <div className="text-xs font-medium text-amber-800 mb-2">
                          ⚠️ Dato de alto impacto pendiente. Considerar reducir tamaño hasta publicación.
                        </div>
                      )}
"""

content = content.replace(
    '<div\n                  key={day.day}\n                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"\n                >\n                  <div className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">\n                    {day.day}\n                  </div>\n                  {day.events.length === 0 ? (\n                    <p className="text-sm text-slate-500">—</p>\n                  ) : (\n                    <div className="space-y-2">',
    calendar_today_logic
)

with open("src/components/dashboard-client.tsx", "w") as f:
    f.write(content)

