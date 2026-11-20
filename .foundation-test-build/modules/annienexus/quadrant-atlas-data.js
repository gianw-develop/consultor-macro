"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ATLAS_ZONES = void 0;
exports.ATLAS_ZONES = [
    {
        zone: "growth_down_prices_up", tone: "amber", title: "Estanflación",
        relation: "Crecimiento débil + inflación alta",
        curve: "hump", curveLabel: "Joroba · medio > extremos", curveMeaning: "El tramo medio ofrece más rendimiento; puede reflejar incertidumbre en la transición.",
        characteristics: ["Crecimiento estancado o perdiendo fuerza.", "Inflación persistente.", "Difícil contener precios sin frenar más la actividad."],
        assetLabel: "Activos que pueden resistir", assets: ["Oro*", "Materias primas", "Energía", "Negocios de demanda estable"],
        meaning: "Economía débil con precios elevados. La Fed —banco central— tiene menos margen para ayudar sin reavivar la inflación.",
    },
    {
        zone: "growth_prices_up", tone: "green", title: "Boom inflacionario",
        relation: "Crecimiento fuerte + inflación alta",
        curve: "flat", curveLabel: "Plana · 2 años ≈ 10 años", curveMeaning: "Los rendimientos cortos y largos convergen; contrastar la respuesta de la Fed.",
        characteristics: ["Expansión económica fuerte.", "Inflación en aumento.", "Tipos de interés presionados al alza."],
        assetLabel: "Activos que pueden destacar", assets: ["Materias primas", "Energía", "Financieras", "Value · precio moderado frente a beneficios"],
        meaning: "Crecimiento fuerte con presión de precios. La Fed puede endurecer las condiciones financieras: pedir prestado se encarece.",
    },
    {
        zone: "growth_prices_easing", tone: "red", title: "Crisis deflacionaria*",
        relation: "Crecimiento débil + inflación a la baja",
        curve: "inverted", curveLabel: "Invertida · 2 años > 10 años", curveMeaning: "El plazo corto paga más; puede recoger expectativas de desaceleración y recortes.",
        characteristics: ["En una crisis: recesión o contracción.", "Caen la demanda y, en deflación, los precios.", "Riesgo de un deterioro que se refuerza a sí mismo."],
        assetLabel: "Activos que pueden proteger", assets: ["Bonos soberanos · deuda pública", "Efectivo", "Oro*", "Negocios de demanda estable"],
        meaning: "Se debilitan actividad y precios. Perder impulso no prueba recesión; deflación es una caída general de precios, no solo menos inflación.",
    },
    {
        zone: "growth_up_prices_easing", tone: "blue", title: "Boom desinflacionario",
        relation: "Crecimiento fuerte + inflación a la baja",
        curve: "normal", curveLabel: "Normal ascendente · 10 años > 2 años", curveMeaning: "El plazo largo paga más; puede acompañar expansión o recuperación.",
        characteristics: ["Expansión económica saludable.", "Inflación controlada o bajando.", "Entorno favorable si los beneficios acompañan."],
        assetLabel: "Activos que pueden destacar", assets: ["Growth · empresas en expansión", "Tecnología", "Consumo no esencial", "Crédito e inmobiliario"],
        meaning: "Crecimiento sólido con inflación controlada o bajando. Puede favorecer a las empresas y a otros activos si beneficios y financiación lo confirman.",
    },
];
