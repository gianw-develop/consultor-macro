"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGIME_GUIDES = void 0;
exports.REGIME_GUIDES = [
    {
        zone: "growth_down_prices_up", tone: "amber", title: "Estanflación", direction: "Crecimiento pierde impulso · inflación acelera",
        meaning: "La economía pierde fuerza mientras los precios presionan. La Fed —banco central— tiene menos margen para aliviar el coste del dinero.",
        characteristics: ["Demanda y actividad más débiles.", "Costes que pueden reducir el beneficio de las empresas.", "Tensión entre contener precios y sostener el empleo."],
        forces: "Energía cara o problemas de oferta pueden agravar la combinación. Importa si las empresas pueden trasladar sus costes al cliente.",
        assets: "Energía, negocios de demanda estable y oro como hipótesis a contrastar. Tipos, dólar y destrucción de demanda pueden invalidarlas.",
        watch: "Consumo, empleo y pedidos; precios persistentes y coste de pedir prestado. Contrastar si el deterioro se extiende.",
        caution: "Una caída puntual de actividad y un repunte de petróleo no bastan. El oro tampoco protege siempre: influyen los tipos, el dólar y la necesidad de efectivo.",
        indices: { dow: "Vigilar industrias y consumo; la respuesta de energía y financieras puede ser distinta.", sp: "Contrastar ventas, márgenes —beneficio por venta— y alcance del deterioro.", nasdaq: "El coste del dinero puede pesar en los beneficios esperados; revisar también resultados." },
    },
    {
        zone: "growth_prices_up", tone: "green", title: "Expansión inflacionaria", direction: "Crecimiento gana impulso · inflación acelera",
        meaning: "La actividad se fortalece y la presión de precios aumenta. Los beneficios pueden mejorar mientras la financiación se encarece.",
        characteristics: ["Demanda y producción con más impulso.", "Precios y costes al alza.", "Posible respuesta más restrictiva de la Fed: dinero más caro."],
        forces: "Demanda fuerte, inversión y empleo pueden sostener ventas. Energía y financieras requieren lectura propia; no toda empresa se beneficia.",
        assets: "Energía, materias primas, financieras y empresas baratas frente a sus beneficios actuales. Comprobar demanda, crédito y precio pagado.",
        watch: "Si los beneficios compensan el encarecimiento del crédito; salarios, consumo y persistencia de la inflación.",
        caution: "Crecer por encima de cero no significa acelerar. Inflación alta no significa que esté subiendo. Una curva de bonos no identifica esta zona por sí sola.",
        indices: { dow: "Comprobar si la actividad sostiene industriales y empresas sensibles al ciclo.", sp: "Contrastar crecimiento de beneficios con valoraciones —precio pagado por ellos—.", nasdaq: "Vigilar rendimientos de bonos y beneficios futuros: pueden tirar en sentidos distintos." },
    },
    {
        zone: "growth_prices_easing", tone: "red", title: "Crisis deflacionaria*", direction: "Crecimiento pierde impulso · inflación se modera",
        meaning: "La lectura inicial es desaceleración con menos inflación. Hablar de crisis exige deterioro amplio; deflación significa caída general de precios.",
        characteristics: ["Demanda y producción pierden velocidad.", "Menor presión de precios.", "En el caso extremo: contracción, empleo débil y tensión de crédito."],
        forces: "Si cae la demanda, las empresas pueden perder ventas. Un alivio de tipos no garantiza recuperación inmediata de beneficios.",
        assets: "Bonos públicos de alta calidad si caen sus rendimientos; efectivo y negocios de demanda estable. La protección depende del precio y del contexto.",
        watch: "Empleo, consumo y financiación empresarial. Separar una moderación ordenada de una contracción extendida.",
        caution: "No diagnosticar recesión o crisis solo con estos dos signos. Los bonos pueden subir de precio si baja su rendimiento, pero su plazo y riesgo importan.",
        indices: { dow: "Vigilar pedidos, inversión y resistencia de las ventas.", sp: "Contrastar revisiones de beneficios y si el deterioro alcanza muchos sectores.", nasdaq: "Menores rendimientos pueden aliviar valoraciones, pero la caída de demanda puede dominar." },
    },
    {
        zone: "growth_up_prices_easing", tone: "blue", title: "Boom desinflacionario", direction: "Crecimiento gana impulso · inflación se modera",
        meaning: "La economía gana fuerza mientras los precios suben más despacio. Puede ser un entorno favorable si empleo, beneficios y crédito lo acompañan.",
        characteristics: ["Actividad y demanda con más impulso.", "Menor presión de costes.", "Posibilidad de crecer sin un nuevo endurecimiento del dinero."],
        forces: "Mejor oferta o productividad —producir más con los mismos recursos— pueden aliviar precios sin dañar actividad.",
        assets: "Tecnología, empresas en crecimiento y consumo no esencial; crédito e inmobiliario si mejora su financiación. Contrastar beneficios y valoraciones.",
        watch: "Que el descenso de inflación persista y la mejora alcance empleo, consumo y muchas empresas, no solo unas pocas.",
        caution: "Menos inflación por hundimiento de demanda no es este caso. Tecnología y consumo pueden responder, pero un precio excesivo o malos beneficios cambian la lectura.",
        indices: { dow: "Contrastar recuperación de actividad y costes más contenidos.", sp: "Buscar beneficios resistentes y una participación más amplia del avance.", nasdaq: "Contrastar menor presión del dinero con crecimiento real de beneficios." },
    },
];
