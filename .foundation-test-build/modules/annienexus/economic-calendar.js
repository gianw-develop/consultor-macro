"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEXT_WEEK_EVENTS = exports.ECONOMIC_EVENTS = exports.PREVIOUS_WEEK_EVENTS = exports.CALENDAR_WEEK = exports.CALENDAR_CHECKED_AT = void 0;
exports.eventStatus = eventStatus;
exports.calendarSummary = calendarSummary;
exports.madridEventTime = madridEventTime;
// Editorial verification is independent of the economic brain's input cut/review.
// The clock can flag a due release, but can never confirm its result.
exports.CALENDAR_CHECKED_AT = "2026-11-04T15:52:00Z";
exports.CALENDAR_WEEK = "2–6 de noviembre de 2026";
exports.PREVIOUS_WEEK_EVENTS = [
    {
        "id": "ism-services",
        "title": "ISM · servicios",
        "period": "Septiembre de 2026",
        "scheduledAt": "2026-10-05T14:00:00Z",
        "source": "ISM",
        "url": "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/services/september/",
        "relevance": "Encuesta a empresas de servicios: actividad y extensión de las subidas de costes.",
        "result": {
            "publishedAt": "2026-10-05T14:00:00Z",
            "verifiedAt": "2026-10-07T11:25:36Z",
            "headline": "Actividad: 54,9 · precios pagados: 74,0",
            "details": [
                "Septiembre frente a agosto: actividad 54,9 frente a 55,4; baja 0,5 puntos. Precios pagados 74,0 frente a 72,6; sube 1,4 puntos.",
                "Son índices de encuesta, no tasas de crecimiento ni de inflación. En actividad, superar 50 indica expansión del sector; en precios, indica predominio de aumentos de costes.",
                "Comparación con agosto según esta publicación; no se identifica una revisión de esos dos datos previos."
            ],
            "reading": "Los servicios siguen expandiéndose, con un índice menor que en agosto, mientras las subidas de costes se extienden. Es una descripción del informe, no un diagnóstico nuevo del régimen."
        }
    },
    {
        "id": "trade",
        "title": "Comercio exterior · bienes y servicios",
        "period": "Agosto de 2026",
        "scheduledAt": "2026-10-06T12:30:00Z",
        "source": "BEA / Census",
        "url": "https://www.bea.gov/news/2026/us-international-trade-goods-and-services-august-2026",
        "relevance": "Diferencia entre lo que EE. UU. vende y compra al exterior; déficit significa que las importaciones superan las exportaciones.",
        "result": {
            "publishedAt": "2026-10-06T12:30:00Z",
            "verifiedAt": "2026-10-07T11:25:36Z",
            "headline": "Déficit: 105.600 millones de dólares",
            "details": [
                "Agosto: déficit de 105.600 millones de dólares, frente a 92.800 millones en julio revisado. El saldo comercial es negativo; aquí se muestra el tamaño del déficit.",
                "Exportaciones: +1,4 % mensual. Importaciones: +4,3 % mensual. Importes nominales —sin descontar inflación— y ajustados por patrones estacionales.",
                "El dato previo de julio está revisado en la publicación del 6 de octubre. No se sustituye por una cifra de un calendario anterior."
            ],
            "reading": "El déficit se amplía porque las importaciones aumentan más que las exportaciones. Por sí solo no determina la dirección del Dow, S&P 500 o Nasdaq."
        }
    },
    {
        "id": "fed-minutes",
        "title": "Fed · actas de la reunión",
        "period": "Reunión del 15–16 de septiembre de 2026",
        "scheduledAt": "2026-10-07T18:00:00Z",
        "source": "Reserva Federal",
        "url": "https://www.federalreserve.gov/monetarypolicy/fomcminutes20260916.htm",
        "relevance": "Las actas explican la discusión de una reunión pasada. No son una nueva decisión sobre los tipos de interés.",
        "result": {
            "publishedAt": "2026-10-07T18:00:00Z",
            "verifiedAt": "2026-10-15T09:07:17Z",
            "headline": "Actas publicadas · reunión de septiembre",
            "details": [
                "La reunión del 15–16/09 elevó el rango objetivo en 0,25 puntos porcentuales, hasta 3,75–4,00 %. Las actas del 7/10 explican esa decisión; no son una subida adicional.",
                "La mayoría de participantes consideraba probable otra subida antes de finalizar el año, condicionada a los datos. Es la discusión de septiembre, no una decisión tomada hoy."
            ],
            "reading": "La inflación seguía siendo una preocupación. Separar las estimaciones disponibles en aquella reunión de las publicaciones posteriores."
        }
    },
    {
        "id": "consumer-credit",
        "title": "Crédito al consumo",
        "period": "Agosto de 2026 · preliminar",
        "scheduledAt": "2026-10-07T19:00:00Z",
        "source": "Reserva Federal",
        "url": "https://www.federalreserve.gov/releases/g19/current/",
        "relevance": "Dinero prestado a consumidores, como tarjetas y préstamos para vehículos o estudios; no incluye hipotecas. Separar el cambio mensual de una tasa anualizada al publicarse.",
        "result": {
            "publishedAt": "2026-10-07T19:00:00Z",
            "verifiedAt": "2026-10-15T09:07:17Z",
            "headline": "Crédito: +1,9 % a tasa anualizada",
            "details": [
                "Agosto preliminar frente a julio revisado: crecimiento total anualizado 1,9 % frente a 4,1 %. No es un aumento mensual de 1,9 %.",
                "Crédito renovable, como tarjetas: −4,2 % anualizado frente a +2,5 %. No renovable: +4,1 % frente a +4,7 %. Excluye hipotecas."
            ],
            "reading": "El crédito total aumenta a menor ritmo, con caída del componente renovable. No equivale directamente a gasto de consumo."
        }
    },
    {
        "id": "claims",
        "title": "Solicitudes semanales de subsidio",
        "period": "Semana terminada el 3 de octubre de 2026 · solicitudes iniciales previstas",
        "scheduledAt": "2026-10-08T12:30:00Z",
        "source": "DOL",
        "url": "https://www.dol.gov/ui/data.pdf",
        "relevance": "Nuevas peticiones de ayuda por desempleo. Es un dato semanal, distinto del NFP —creación mensual de empleo no agrícola—. Revisar también la media de cuatro semanas y las correcciones del dato anterior.",
        "result": {
            "publishedAt": "2026-10-08T12:30:00Z",
            "verifiedAt": "2026-10-15T09:07:17Z",
            "headline": "Iniciales: 197.000 · media de 4 semanas: 198.000",
            "details": [
                "Semana terminada el 3/10: 197.000 iniciales, −2.000 frente a 199.000 de la semana anterior revisada. El 26/09 pasa de 197.000 a 199.000.",
                "Media de 4 semanas: 198.000 frente a 200.500 revisado (antes 200.000). Ambas series ajustadas por estacionalidad."
            ],
            "reading": "Bajan las nuevas solicitudes y su media. Es una señal semanal de despidos, no una medición completa de la contratación."
        }
    },
    {
        "id": "wholesale",
        "title": "Ventas e inventarios mayoristas",
        "period": "Agosto de 2026",
        "scheduledAt": "2026-10-08T14:00:00Z",
        "source": "Census",
        "url": "https://www.census.gov/wholesale/current/index.html",
        "relevance": "Ventas y mercancías almacenadas por distribuidores mayoristas. Leer ambas juntas: más existencias no equivalen automáticamente a más demanda.",
        "result": {
            "publishedAt": "2026-10-08T14:00:00Z",
            "verifiedAt": "2026-10-15T09:07:17Z",
            "headline": "Ventas: +1,8 % · inventarios: +0,5 % mensual",
            "details": [
                "Agosto: ventas 817.500 millones de dólares, +1,8 % mensual; inventarios 964.200 millones, +0,5 %. Datos nominales, ajustados por estacionalidad.",
                "Ventas de julio revisadas de +0,8 % a +1,0 %. Inventarios de agosto revisados de +0,7 % a +0,5 %. Relación inventarios/ventas: 1,18."
            ],
            "reading": "Las ventas crecen más que las existencias. Al no descontar inflación, no se interpreta como crecimiento real del mismo tamaño."
        }
    },
    {
        "id": "michigan",
        "title": "Michigan · confianza y expectativas de inflación",
        "period": "Octubre de 2026 · estimación preliminar",
        "scheduledAt": "2026-10-09T14:00:00Z",
        "source": "Universidad de Michigan",
        "url": "https://www.sca.isr.umich.edu/",
        "relevance": "Encuesta a hogares sobre su situación y el futuro. Las expectativas de inflación son lo que esperan que suban los precios, no inflación ya medida. La fuente primaria confirma viernes 9, no jueves 8.",
        "result": {
            "publishedAt": "2026-10-09T14:00:00Z",
            "verifiedAt": "2026-10-15T09:07:17Z",
            "headline": "Confianza: 46,3 · inflación esperada a un año: 4,7 %",
            "details": [
                "Octubre preliminar: confianza 46,3 frente a 48,1 en septiembre. Condiciones actuales 44,7 frente a 50,9; expectativas 47,3 frente a 46,3.",
                "Inflación esperada a un año: 4,7 % frente a 4,6 %. A largo plazo: 3,5 % frente a 3,4 %. Son expectativas de hogares, no inflación realizada."
            ],
            "reading": "Menor confianza agregada y expectativas de inflación más altas. El resultado final está previsto para el 23/10."
        }
    },
    {
        "id": "cpi",
        "title": "IPC · inflación de EE. UU.",
        "period": "Septiembre de 2026",
        "scheduledAt": "2026-10-14T12:30:00Z",
        "source": "BLS",
        "url": "https://www.bls.gov/news.release/archives/cpi_10142026.htm",
        "relevance": "Precios pagados por los consumidores. Separar variación mensual ajustada por estacionalidad y variación anual oficial.",
        "result": {
            "publishedAt": "2026-10-14T12:30:00Z",
            "verifiedAt": "2026-10-15T09:07:17Z",
            "headline": "General: +0,6 % mensual · +3,7 % anual",
            "details": [
                "Agosto → septiembre: general mensual +0,4 % → +0,6 %; anual 3,4 % → 3,7 %.",
                "Sin alimentos ni energía: +0,3 % mensual, igual que agosto; anual 2,4 % → 2,6 %. Gasolina: +9,1 % mensual."
            ],
            "reading": "La inflación general acelera en el mes y en el año. La subyacente mantiene el ritmo mensual y aumenta en la comparación anual."
        }
    },
    {
        "id": "beige-book",
        "title": "Fed · Libro Beige",
        "period": "Contactos empresariales recopilados para octubre de 2026",
        "scheduledAt": "2026-10-14T18:00:00Z",
        "source": "Reserva Federal",
        "url": "https://www.federalreserve.gov/monetarypolicy/beigebook202610-summary.htm",
        "relevance": "Informe cualitativo regional: describe testimonios empresariales; no es una estimación del PIB ni una decisión de tipos.",
        "result": {
            "publishedAt": "2026-10-14T18:00:00Z",
            "verifiedAt": "2026-10-20T23:15:45Z",
            "headline": "Crecimiento leve o modesto en la mayoría de distritos",
            "details": [
                "Actividad creciendo leve o modestamente en la mayoría de distritos; empleo con pocos cambios y presión de costes, incluida la energía.",
                "Son testimonios regionales, con distinta cobertura y periodo de recogida. No se suman como votos independientes de las estadísticas."
            ],
            "reading": "Actividad positiva pero desigual, con presión de precios; no confirma recesión ni fortaleza uniforme."
        }
    },
    {
        "id": "ppi",
        "title": "IPP · precios al productor",
        "period": "Septiembre de 2026",
        "scheduledAt": "2026-10-15T12:30:00Z",
        "source": "BLS",
        "url": "https://www.bls.gov/news.release/ppi.nr0.htm",
        "relevance": "Precios recibidos por productores. Permite contrastar costes; no es el IPC pagado por los hogares.",
        "result": {
            "publishedAt": "2026-10-15T12:30:00Z",
            "verifiedAt": "2026-10-20T23:15:45Z",
            "headline": "Demanda final: +1,3 % mensual · +6,3 % anual",
            "details": [
                "Septiembre: sin alimentos, energía ni servicios comerciales, +0,5 % mensual y +5,0 % anual. Este componente no es el IPC subyacente.",
                "Las cifras de mayo–agosto pueden incluir revisiones en esta versión del BLS. No se interpreta el IPP como traslado inmediato y completo al consumidor."
            ],
            "reading": "Presión de precios en la producción; contrastar con IPC, demanda y márgenes."
        }
    },
    {
        "id": "retail",
        "title": "Ventas minoristas · avance",
        "period": "Septiembre de 2026",
        "scheduledAt": "2026-10-15T12:30:00Z",
        "source": "Census",
        "url": "https://www.census.gov/retail/marts/www/marts_current.pdf",
        "relevance": "Ventas nominales, antes de descontar inflación. Revisar también agosto antes de calcular ventas reales con el IPC del mismo mes.",
        "result": {
            "publishedAt": "2026-10-15T12:30:00Z",
            "verifiedAt": "2026-10-20T23:15:45Z",
            "headline": "Ventas nominales: +0,8 % mensual · +6,3 % anual",
            "details": [
                "Septiembre: 745.021 millones de dólares. Agosto revisado: 739.322 millones; julio: 729.915 millones. Agosto pasa de +1,1 % a +1,3 % mensual redondeado.",
                "Con niveles mensuales ajustados de ventas e IPC: septiembre +0,12 % real y agosto +0,89 % real. Cálculo de AWNexus; IPC general como aproximación."
            ],
            "reading": "El gasto aumenta, pero gran parte del avance nominal de septiembre corresponde al encarecimiento."
        }
    },
    {
        "id": "claims",
        "title": "Solicitudes semanales de subsidio",
        "period": "Semana terminada el 10 de octubre de 2026",
        "scheduledAt": "2026-10-15T12:30:00Z",
        "source": "DOL",
        "url": "https://www.dol.gov/sites/dolgov/files/OPA/newsreleases/ui-claims/20261599.pdf",
        "relevance": "Revisar nuevas solicitudes, media de cuatro semanas y correcciones del dato anterior. Último informe incorporado: 15/10.",
        "result": {
            "publishedAt": "2026-10-15T12:30:00Z",
            "verifiedAt": "2026-10-20T23:15:45Z",
            "headline": "Iniciales: 199.000 · media de 4 semanas: 198.500",
            "details": [
                "Anterior revisado: 198.000 iniciales (antes 197.000); media 198.250 (antes 198.000). Cambios semanales: +1.000 y +250 respectivamente.",
                "Continuadas: 1.710.000 en la semana del 3/10, −4.000 frente a 1.714.000 revisado. Las continuadas tienen una semana de retraso respecto a las iniciales."
            ],
            "reading": "Ligero aumento de nuevas solicitudes y de su media. Una semana no confirma un deterioro persistente."
        }
    },
    {
        "id": "import-prices",
        "title": "Precios de importación y exportación",
        "period": "Septiembre de 2026",
        "scheduledAt": "2026-10-16T12:30:00Z",
        "source": "BLS",
        "url": "https://www.bls.gov/news.release/ximpim.nr0.htm",
        "relevance": "Precios del comercio exterior, para contrastar presiones de costes.",
        "result": {
            "publishedAt": "2026-10-16T12:30:00Z",
            "verifiedAt": "2026-10-20T23:15:45Z",
            "headline": "Importación: +1,1 % · exportación: +2,2 % mensual",
            "details": [
                "Agosto revisado: importación +0,5 % y exportación +1,2 %. Septiembre frente al mismo mes de 2025: +8,1 % y +11,6 %, respectivamente.",
                "Importaciones sin combustible: +0,7 % mensual. Tasas de estos índices sin ajuste estacional; no se mezclan con las tasas del IPC ajustadas."
            ],
            "reading": "Aumentan los precios del comercio exterior; no equivalen a la inflación de todos los hogares."
        }
    },
    {
        "id": "industrial-production",
        "title": "Producción industrial",
        "period": "Septiembre de 2026",
        "scheduledAt": "2026-10-16T13:15:00Z",
        "source": "Reserva Federal",
        "url": "https://www.federalreserve.gov/releases/g17/20261016/default.htm",
        "relevance": "Producción de fábricas, minas y servicios públicos. Contraste de actividad presente y utilización de capacidad.",
        "result": {
            "publishedAt": "2026-10-16T13:15:00Z",
            "verifiedAt": "2026-10-20T23:15:45Z",
            "headline": "Producción: +0,7 % mensual · capacidad utilizada: 76,9 %",
            "details": [
                "Agosto revisado: +0,1 %. Septiembre: manufacturas +0,3 %, minería +0,2 % y servicios públicos +3,5 %.",
                "El agregado no equivale a toda la economía; el mayor aumento de servicios públicos no prueba una aceleración uniforme de las fábricas."
            ],
            "reading": "La producción industrial aporta una señal de actividad positiva, con componentes desiguales."
        }
    },
    {
        "id": "housing",
        "title": "Vivienda · permisos e inicios",
        "period": "Septiembre de 2026",
        "scheduledAt": "2026-10-20T12:30:00Z",
        "source": "Census / HUD",
        "url": "https://www.census.gov/construction/nrc/pdf/newresconst.pdf",
        "relevance": "Permisos: proyectos autorizados; inicios: obras comenzadas. Tasas anualizadas y ajustadas por estacionalidad, no casas construidas en un mes.",
        "result": {
            "publishedAt": "2026-10-20T12:30:00Z",
            "verifiedAt": "2026-10-20T23:15:45Z",
            "headline": "Permisos: 1,400 millones · inicios: 1,221 millones anualizados",
            "details": [
                "Permisos: −0,2 % mensual y −3,0 % anual. Unifamiliares: 845.000, −4,0 % mensual.",
                "Inicios: −5,2 % mensual, con margen de ±11,8 %. El intervalo incluye cero: no es una caída estadísticamente confirmada."
            ],
            "reading": "Debilidad en permisos unifamiliares como contraste sectorial. No convierte una estimación incierta de inicios en una contracción general."
        }
    },
    {
        "id": "weekly-earnings",
        "title": "Salarios semanales · balance trimestral",
        "period": "Tercer trimestre de 2026",
        "scheduledAt": "2026-10-21T14:00:00Z",
        "source": "BLS",
        "url": "https://www.bls.gov/news.release/wkyeng.nr0.htm",
        "relevance": "Contexto de salarios y poder de compra. Mediana: la cifra que separa a la mitad de trabajadores con menor y mayor remuneración.",
        "result": {
            "publishedAt": "2026-10-21T14:00:00Z",
            "verifiedAt": "2026-10-22T23:07:42Z",
            "headline": "Mediana semanal: 1.232 dólares · +1,5 % interanual",
            "details": [
                "Trabajadores asalariados a tiempo completo; tercer trimestre, sin ajuste estacional. El BLS compara +1,5 % salarial con +3,5 % de IPC en el mismo periodo.",
                "Es una comparación trimestral: no sustituye el salario por hora del informe mensual de empleo ni el IPC mensual de septiembre."
            ],
            "reading": "Los salarios de esta medición crecen menos que los precios del mismo periodo. Aporta contexto al poder de compra; no demuestra por sí solo una caída del consumo ni cambia la tesis del S&P 500."
        }
    },
    {
        "id": "claims",
        "title": "Solicitudes semanales de subsidio",
        "period": "Semana terminada el 17 de octubre de 2026",
        "scheduledAt": "2026-10-22T12:30:00Z",
        "source": "DOL",
        "url": "https://www.dol.gov/sites/dolgov/files/OPA/newsreleases/ui-claims/20261613.pdf",
        "relevance": "Primeras solicitudes y media de cuatro semanas, con revisiones del dato anterior.",
        "result": {
            "publishedAt": "2026-10-22T12:30:00Z",
            "verifiedAt": "2026-10-22T23:07:42Z",
            "headline": "Iniciales: 194.000 · media de 4 semanas: 197.750",
            "details": [
                "Semana terminada el 17/10: 194.000 solicitudes, −6.000 frente a 200.000 revisadas. El 10/10 pasa de 199.000 a 200.000.",
                "La media baja 1.000 a 197.750; la anterior se revisa de 198.500 a 198.750. Cifras ajustadas por patrones del calendario."
            ],
            "reading": "Disminuyen las primeras solicitudes y su media. Es una señal laboral favorable que debe contrastarse con empleo, consumo y actividad; no determina por sí sola la dirección del S&P 500."
        }
    },
    {
        "id": "lei-cei",
        "title": "LEI y CEI · señales tempranas y actividad presente",
        "period": "Septiembre de 2026",
        "scheduledAt": "2026-10-22T14:00:00Z",
        "source": "The Conference Board",
        "url": "https://www.conference-board.org/pdf_free/press/US%20LEI%20PRESS%20RELEASE-%20October%202026.pdf",
        "relevance": "Actualizar agosto y sus revisiones; señales tempranas y actividad observada cumplen papeles distintos.",
        "result": {
            "publishedAt": "2026-10-22T14:00:00Z",
            "verifiedAt": "2026-10-22T23:07:42Z",
            "headline": "LEI: 0,0 % mensual · CEI: +0,3 % mensual",
            "details": [
                "Septiembre preliminar: LEI 99,6 y CEI 115,3, base 2016 = 100. En seis meses: +0,6 % y +0,9 %, respectivamente, sin anualizar.",
                "Julio y agosto revisados. LEI de julio: +0,2 % → +0,3 %; agosto −0,1 %. CEI: julio +0,2 %, agosto +0,1 %. Los cuatro componentes del CEI crecen en seis meses."
            ],
            "reading": "El indicador adelantado se mantiene en el mes y la actividad presente aumenta. Describe la publicación; no renueva automáticamente el diagnóstico de régimen ni produce una señal bursátil."
        }
    },
    {
        "id": "michigan-final",
        "title": "Michigan · resultado final",
        "period": "Octubre de 2026",
        "scheduledAt": "2026-10-23T14:00:00Z",
        "source": "Universidad de Michigan",
        "url": "https://www.sca.isr.umich.edu/",
        "relevance": "Contrastar confianza y expectativas de inflación frente al preliminar del 9/10.",
        "result": {
            "publishedAt": "2026-10-23T14:00:00Z",
            "verifiedAt": "2026-10-23T23:38:00Z",
            "headline": "Confianza final: 48,0 · inflación esperada a un año: 4,7 %",
            "details": [
                "Octubre final: confianza 48,0 frente a 46,3 preliminar y 48,1 en septiembre. La revisión suma 1,7 puntos al preliminar; frente al mes anterior baja 0,1 puntos. Son puntos del índice, no porcentajes de crecimiento.",
                "Condiciones actuales: 46,7 frente a 44,7 preliminar y 50,9 en septiembre. Expectativas económicas: 48,8 frente a 47,3 preliminar y 46,3 en septiembre.",
                "Inflación esperada a un año: 4,7 %; a largo plazo: 3,5 %. Ambas coinciden con el preliminar y superan el 4,6 % y 3,4 % de septiembre. Son expectativas de hogares, no inflación medida.",
                "Próximo resultado: noviembre preliminar, 6/11 a las 16:00 Madrid, según la Universidad de Michigan."
            ],
            "reading": "La confianza queda casi estable frente a septiembre, tras revisarse al alza respecto al preliminar. Las expectativas de inflación siguen por encima del mes anterior. Esta encuesta no confirma por sí sola un cambio de régimen ni una dirección del S&P 500."
        }
    },
    {
        "id": "m1",
        "title": "M1 · efectivo y depósitos disponibles",
        "period": "Septiembre de 2026",
        "scheduledAt": "2026-10-27T17:00:00Z",
        "source": "Reserva Federal",
        "url": "https://www.federalreserve.gov/releases/h6/20261027/",
        "relevance": "Actualizar dinero nominal y descontar el IPC del mismo mes; respetar revisiones.",
        "result": {
            "publishedAt": "2026-10-27T17:00:00Z",
            "verifiedAt": "2026-10-29T08:57:06Z",
            "headline": "M1 real: +1,66 % en seis meses · septiembre",
            "details": [
                "M1 nominal ajustado por estacionalidad: 20.061,2 miles de millones de dólares. Agosto revisado: 19.967,3 (antes 19.991,1). Se incorporan las revisiones de toda la ventana desde agosto de 2025.",
                "Cálculo propio con IPC ajustado del mismo mes, 336,298: M1 real +1,66 % entre marzo y septiembre; agosto revisado +1,15 %. No son tasas mensuales ni anualizadas.",
                "El IPC de octubre de 2025 sigue ausente; abril de 2026 conserva el hueco de su comparación semestral. No se rellena con cero."
            ],
            "reading": "El poder de compra de M1 aumenta a mayor ritmo semestral que en agosto revisado. No implica automáticamente más gasto ni compras de acciones."
        }
    },
    {
        "id": "fomc",
        "title": "Fed · decisión de tipos",
        "period": "Reunión del 27–28 de octubre de 2026",
        "scheduledAt": "2026-10-28T18:00:00Z",
        "source": "Reserva Federal",
        "url": "https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm",
        "relevance": "Rango objetivo de los fondos federales: referencia del coste del dinero a corto plazo; no mide inflación.",
        "result": {
            "publishedAt": "2026-10-28T18:00:00Z",
            "verifiedAt": "2026-10-29T08:57:06Z",
            "headline": "Mantiene el rango objetivo en 3,75–4,00 %",
            "details": [
                "Decisión del 28/10 por 10 votos a 2. Sin cambio respecto al rango fijado el 16/09; no es una subida adicional.",
                "La Fed describe actividad sólida e inflación elevada. Cook y Hammack preferían subir 0,25 puntos porcentuales. Es la valoración del comunicado, no una revisión automática del régimen de AWNexus."
            ],
            "reading": "El tipo oficial se mantiene. Los rendimientos de los bonos pueden variar aunque no cambie el rango de la Fed; no son la misma variable."
        }
    },
    {
        "id": "gdp",
        "title": "PIB · primera estimación",
        "period": "Tercer trimestre de 2026",
        "scheduledAt": "2026-10-29T12:30:00Z",
        "source": "BEA",
        "url": "https://www.bea.gov/news/2026/gdp-advance-estimate-3rd-quarter-2026",
        "relevance": "Actualizar la actividad julio–septiembre. Tasa trimestral anualizada; estimación revisable.",
        "result": {
            "publishedAt": "2026-10-29T12:30:00Z",
            "verifiedAt": "2026-11-04T15:52:00Z",
            "headline": "PIB real: +3,4 % trimestral anualizado",
            "details": [
                "Tercer trimestre, avance: +3,4 % anualizado frente a +2,2 % en el segundo trimestre. Variación trimestral sin anualizar: +0,8 %. Es una primera estimación, sujeta a revisiones.",
                "Contribuyen inversión, consumo y gasto público; las exportaciones caen. Ventas finales reales a compradores privados internos: +4,9 % anualizado, frente a +4,6 %."
            ],
            "reading": "La producción acelera respecto al segundo trimestre. Este dato trimestral no demuestra por sí solo que todos los indicadores mejoren."
        }
    },
    {
        "id": "pce",
        "title": "PCE · precios, ingresos y gasto",
        "period": "Septiembre de 2026",
        "scheduledAt": "2026-10-29T12:30:00Z",
        "source": "BEA",
        "url": "https://www.bea.gov/news/2026/personal-income-and-outlays-september-2026",
        "relevance": "Contrastar gasto real y precios general/subyacente; no confundir PCE con IPC.",
        "result": {
            "publishedAt": "2026-10-29T12:30:00Z",
            "verifiedAt": "2026-11-04T15:52:00Z",
            "headline": "PCE: +0,5 % mensual · +3,6 % anual",
            "details": [
                "Septiembre: precios del PCE +0,5 % mensual; sin alimentos ni energía +0,3 %. Tasas anuales: +3,6 % y +3,1 %, respectivamente.",
                "Gasto real de consumo: aumento inferior al 0,1 % mensual (0,0 % redondeado), frente a +0,5 % en agosto revisado. Gasto nominal: +0,5 %; ingreso disponible real: −0,3 %.",
                "Julio y agosto revisados. El PCE abarca bienes y servicios; no sustituye la serie de ventas minoristas reales calculada con Census e IPC."
            ],
            "reading": "El gasto apenas aumenta una vez descontada la inflación. Separar precios del consumo, gasto real y ventas en comercios."
        }
    },
    {
        "id": "claims-next",
        "title": "Solicitudes semanales de subsidio",
        "period": "Semana terminada el 24 de octubre de 2026",
        "scheduledAt": "2026-10-29T12:30:00Z",
        "source": "DOL",
        "url": "https://www.dol.gov/ui/data.pdf",
        "relevance": "Revisar nuevas solicitudes y media de cuatro semanas.",
        "result": {
            "publishedAt": "2026-10-29T12:30:00Z",
            "verifiedAt": "2026-11-04T15:52:00Z",
            "headline": "Iniciales: 194.000 · media de 4 semanas: 196.750",
            "details": [
                "Semana terminada el 24/10: 194.000 iniciales, −1.000 frente a 195.000 de la semana anterior revisada (antes 194.000). Media de 4 semanas: 196.750, frente a 198.000 revisado (antes 197.750).",
                "Solicitudes continuadas, semana 17/10: 1.701.000, frente a 1.722.000 revisado (antes 1.728.000). Datos ajustados por estacionalidad."
            ],
            "reading": "Bajan las iniciales y las continuadas frente a sus comparaciones revisadas. Una semana no confirma una tendencia laboral completa."
        }
    }
];
exports.ECONOMIC_EVENTS = [
    {
        "id": "ism-manufacturing",
        "title": "ISM · manufacturas",
        "period": "Octubre de 2026",
        "scheduledAt": "2026-11-02T15:00:00Z",
        "source": "ISM · comunicado público",
        "url": "https://www.prnewswire.com/news-releases/manufacturing-pmi-at-55-5-october-2026-ism-manufacturing-pmi-report-302925617.html",
        "relevance": "Encuesta de actividad industrial; superar 50 indica predominio de expansión, no un porcentaje de crecimiento del PIB.",
        "result": {
            "publishedAt": "2026-11-02T15:00:00Z",
            "verifiedAt": "2026-11-04T15:52:00Z",
            "headline": "PMI: 55,5 · precios pagados: 75,2",
            "details": [
                "PMI 55,5 frente a 54,5 en septiembre. Nuevos pedidos 55,5 frente a 55,3; producción 59,0 frente a 56,7.",
                "Precios pagados 75,2 frente a 77,9; empleo 52,4 frente a 52,7. Son puntos de índices de encuesta, no tasas de inflación ni creación de empleo."
            ],
            "reading": "La encuesta industrial mejora mientras disminuye la extensión de las subidas de costes; los precios pagados permanecen elevados."
        }
    },
    {
        "id": "jolts",
        "title": "JOLTS · vacantes y movimientos laborales",
        "period": "Septiembre de 2026",
        "scheduledAt": "2026-11-03T15:00:00Z",
        "source": "BLS",
        "url": "https://www.bls.gov/news.release/jolts.nr0.htm",
        "relevance": "Puestos disponibles, contrataciones y salidas; distinto del empleo neto mensual.",
        "result": {
            "publishedAt": "2026-11-03T15:00:00Z",
            "verifiedAt": "2026-11-04T15:52:00Z",
            "headline": "Vacantes: 7,5 millones · contrataciones: 5,4 millones",
            "details": [
                "Vacantes 7,5 millones; tasa 4,5 %. Contrataciones 5,4 millones; salidas totales 5,3 millones. BLS describe pocos cambios en estos agregados.",
                "Renuncias voluntarias 3,4 millones; despidos 1,6 millones. Agosto revisado: vacantes +111.000 hasta 7,2 millones; contrataciones +79.000 hasta 5,3 millones; salidas +105.000 hasta 5,2 millones."
            ],
            "reading": "Las vacantes son puestos abiertos, no personas contratadas; no reemplazan el informe mensual de empleo."
        }
    },
    {
        "id": "trade",
        "title": "Comercio exterior · bienes y servicios",
        "period": "Septiembre de 2026",
        "scheduledAt": "2026-11-04T13:30:00Z",
        "source": "BEA / Census",
        "url": "https://www.bea.gov/news/2026/us-international-trade-goods-and-services-september-2026",
        "relevance": "Saldo entre exportaciones e importaciones; separar nominal y real.",
        "result": {
            "publishedAt": "2026-11-04T13:30:00Z",
            "verifiedAt": "2026-11-04T15:52:00Z",
            "headline": "Déficit: 105.000 millones de dólares",
            "details": [
                "Déficit 105.000 millones frente a 105.700 millones de agosto revisado (antes 105.600 millones). Exportaciones 321.500 millones, +1,9 % mensual; importaciones 426.600 millones, +1,2 %.",
                "Importes nominales, ajustados por estacionalidad. La diferencia entre totales redondeados no reproduce necesariamente el saldo publicado."
            ],
            "reading": "El déficit nominal se reduce ligeramente. No implica por sí solo que mejore la contribución real del comercio al PIB."
        }
    },
    {
        "id": "ism-services",
        "title": "ISM · servicios",
        "period": "Octubre de 2026",
        "scheduledAt": "2026-11-04T15:00:00Z",
        "source": "ISM · comunicado público",
        "url": "https://www.prnewswire.com/news-releases/services-pmi-at-54-5-october-2026-ism-services-pmi-report-302928112.html",
        "relevance": "Encuesta a empresas de servicios: actividad, pedidos, empleo y precios pagados.",
        "result": {
            "publishedAt": "2026-11-04T15:00:00Z",
            "verifiedAt": "2026-11-04T15:52:00Z",
            "headline": "PMI: 54,5 · precios pagados: 73,0",
            "details": [
                "PMI 54,5 frente a 54,9 en septiembre; actividad empresarial 53,8 frente a 56,5; nuevos pedidos 55,9 frente a 59,8.",
                "Precios pagados 73,0 frente a 74,0; empleo 51,4 frente a 50,1. El PMI agregado es distinto del subíndice de actividad empresarial."
            ],
            "reading": "Los servicios siguen expandiéndose según la encuesta, con menor impulso agregado y presión de costes persistente."
        }
    },
    {
        "id": "claims",
        "title": "Solicitudes semanales de subsidio",
        "period": "Semana terminada el 31 de octubre de 2026",
        "scheduledAt": "2026-11-05T13:30:00Z",
        "source": "DOL",
        "url": "https://www.dol.gov/ui/data.pdf",
        "relevance": "Siguiente informe semanal previsto; revisar iniciales, continuadas, media y correcciones."
    },
    {
        "id": "productivity",
        "title": "Productividad y costes · avance",
        "period": "Tercer trimestre de 2026",
        "scheduledAt": "2026-11-05T13:30:00Z",
        "source": "BLS",
        "url": "https://www.bls.gov/schedule/2026/11_sched.htm",
        "relevance": "Producción por hora trabajada y coste laboral por unidad producida; separar tasas anualizadas."
    },
    {
        "id": "employment",
        "title": "Empleo · NFP y desempleo",
        "period": "Octubre de 2026",
        "scheduledAt": "2026-11-06T13:30:00Z",
        "source": "BLS",
        "url": "https://www.bls.gov/schedule/2026/11_sched.htm",
        "relevance": "NFP: cambio mensual del empleo no agrícola. Revisar también desempleo y revisiones de meses previos."
    },
    {
        "id": "michigan",
        "title": "Michigan · confianza e inflación esperada",
        "period": "Noviembre de 2026 · preliminar",
        "scheduledAt": "2026-11-06T15:00:00Z",
        "source": "Universidad de Michigan",
        "url": "https://www.sca.isr.umich.edu/",
        "relevance": "Encuesta a hogares. Sus expectativas de precios no son inflación ya observada."
    }
];
exports.NEXT_WEEK_EVENTS = [
    {
        "id": "cpi",
        "title": "IPC · inflación de EE. UU.",
        "period": "Octubre de 2026",
        "scheduledAt": "2026-11-10T13:30:00Z",
        "source": "BLS",
        "url": "https://www.bls.gov/schedule/2026/11_sched.htm",
        "relevance": "Comparar inflación general y sin alimentos ni energía, mensual y anual."
    },
    {
        "id": "ppi",
        "title": "IPP · precios al productor",
        "period": "Octubre de 2026",
        "scheduledAt": "2026-11-13T13:30:00Z",
        "source": "BLS",
        "url": "https://www.bls.gov/schedule/2026/11_sched.htm",
        "relevance": "Precios recibidos por productores; no equivalen al IPC ni al PCE."
    }
];
function eventStatus(event, now) {
    const time = Date.parse(now), scheduled = Date.parse(event.scheduledAt);
    const published = Date.parse(event.result?.publishedAt ?? ""), verified = Date.parse(event.result?.verifiedAt ?? "");
    if (Number.isFinite(time) && Number.isFinite(scheduled) && Number.isFinite(published) && Number.isFinite(verified) && verified >= published && time >= Math.max(scheduled, published, verified))
        return "Publicado · verificado";
    return Number.isFinite(time) && Number.isFinite(scheduled) && time < scheduled
        ? "Programado" : "Resultado por verificar";
}
function calendarSummary(events, now) {
    const statuses = events.map(event => eventStatus(event, now));
    return {
        published: statuses.filter(status => status === "Publicado · verificado").length,
        scheduled: statuses.filter(status => status === "Programado").length,
        unverified: statuses.filter(status => status === "Resultado por verificar").length,
        next: events.filter(event => eventStatus(event, now) === "Programado").sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt))[0] ?? null,
    };
}
function madridEventTime(iso) {
    return new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}
