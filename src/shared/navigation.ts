// Product areas requested by the user. This manifest does not approve or implement a visual style.
export const PRODUCT_AREAS = [
  { id: "overview", label: "Principal", href: "/annienexus" },
  { id: "brain", label: "Cerebro", href: "/annienexus/cerebro" },
  { id: "learning", label: "Formación", href: "/annienexus/formacion" },
  { id: "radar", label: "Sectores y tipos", href: "/radar" },
  { id: "calculator", label: "Calculadora", href: "/annienexus/calculadora" },
] as const;
// These analytical functions are content, not four substitutes for the product tabs.
export const ANALYTICAL_CONTENT = [
  "Historia del mercado", "Economía y bonos", "Interior de índices", "Tesis y cambios",
] as const;
