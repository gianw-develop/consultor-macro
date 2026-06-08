import json

def patch_market():
    with open("src/lib/market.ts", "r") as f:
        content = f.read()

    # 1. Condition logic and subtext
    content = content.replace(
        'title: "🔵 EXPANSIÓN",\n      shortLabel: "🔵",\n      narrative:\n        "Flujo favorece riesgo. Buscar compras en retrocesos de US100, SP500 y US30.",',
        'title: "🔵 EXPANSIÓN — BUSCAR COMPRAS",\n      shortLabel: "🔵",\n      narrative:\n        "Flujo institucional favorece riesgo. Comprar retrocesos en US100 / SP500 / US30.",'
    )
    content = content.replace(
        'title: "🔴 CAÍDA",\n      shortLabel: "🔴",\n      narrative:\n        "Flujo sale de riesgo. Buscar ventas en rebotes de US100, SP500 y US30.",',
        'title: "🔴 CAÍDA — BUSCAR VENTAS",\n      shortLabel: "🔴",\n      narrative:\n        "Flujo sale de riesgo. Vender rebotes en US100 / SP500 / US30.",'
    )
    content = content.replace(
        'title: "🟡 NEUTRAL",\n    shortLabel: "🟡",\n    narrative: "Sin alineación macro clara. Esperar confirmación.",',
        'title: "🟡 NEUTRAL — NO OPERAR",\n    shortLabel: "🟡",\n    narrative: "Variables contradictorias. Esperar alineación.",'
    )

    # Strength label
    content = content.replace(
        'strengthLabel: expansionCount === 4 ? "Señal fuerte" : "Señal moderada",',
        'strengthLabel: expansionCount === 4 ? "Señal FUERTE — alta confianza" : `Señal MODERADA — ${getContradictions("expansion").join(", ")}`,'
    )
    content = content.replace(
        'strengthLabel: declineCount === 4 ? "Señal fuerte" : "Señal moderada",',
        'strengthLabel: declineCount === 4 ? "Señal FUERTE — alta confianza" : `Señal MODERADA — ${getContradictions("decline").join(", ")}`,'
    )
    content = content.replace(
        'strengthLabel: "Sin alineación clara",',
        'strengthLabel: "Sin alineación — ESPERAR",'
    )

    # Interpretations (note)
    content = content.replace('note: "Presión bajista favorece apetito por riesgo",', 'note: snapshot.key === "us10y" ? "Yield baja = presión sale de bonos → favorable índices" : "Dólar débil = liquidez entra a riesgo",')
    content = content.replace('note: "Subida presiona valuaciones y favorece defensiva",', 'note: snapshot.key === "us10y" ? "Yield sube = presión para acciones e índices" : "Dólar fuerte = liquidez sale de riesgo",')
    content = content.replace('note: "Carry trade activo y soporte para riesgo",', 'note: "Carry trade activo = bullish",')
    content = content.replace('note: "Desarme de carry trade y salida de riesgo",', 'note: "Carry trade se deshace = riesgo-off = bearish",')
    content = content.replace('note: snapshot.change < 0 ? "Volatilidad relajándose" : "Volatilidad estable",', 'note: snapshot.change < 0 ? "Mercado cómodo comprando" : "Mercado cómodo comprando",')
    content = content.replace('note: "Volatilidad subiendo y menor apetito por riesgo",', 'note: "Mercado busca protección",')

    with open("src/lib/market.ts", "w") as f:
        f.write(content)

patch_market()
