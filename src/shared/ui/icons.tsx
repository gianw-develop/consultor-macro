export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, string> = {
    trend: "M3 18 9 12 13 15 21 5 M15 5h6v6",
    bars: "M5 19v-5 M12 19V9 M19 19V3",
    people: "M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M16 10a3 3 0 1 0 0-6 M1 22v-3a7 7 0 0 1 14 0v3z M16 14a6 6 0 0 1 7 6v2h-6",
    bank: "M2 8 12 2l10 6z M2 22h20 M4 19h16 M6 9v10 M12 9v10 M18 9v10",
    coins: "M5 6a7 3 0 1 0 14 0 7 3 0 1 0-14 0 M5 6v12a7 3 0 0 0 14 0V6 M5 12a7 3 0 0 0 14 0",
    up: "M12 21V3 M4 11l8-8 8 8",
    down: "M12 3v18 M4 13l8 8 8-8",
    info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 11v6 M12 7v.1",
    search: "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14 M15 15l7 7",
    reset: "M3 9a9 9 0 1 1 0 6 M3 3v6h6",
    bookmark: "M5 3h14v19l-7-5-7 5z",
    overview: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
    brain: "M12 4v16 M8 4C3 2 1 9 5 11C1 14 4 21 9 20 M16 4C21 2 23 9 19 11C23 14 20 21 15 20 M5 11h3l2 3 M19 11h-3l-2 3",
    learning: "M3 4h6l3 2 3-2h6v15h-6l-3 2-3-2H3z M12 6v15",
    radar: "M12 3a9 9 0 1 0 9 9 M12 7a5 5 0 1 0 5 5 M12 12l9-9 M12 12h.01",
    arrow: "M4 12h16 M14 6l6 6-6 6",
    source: "M14 3H5v18h14V8z M14 3v5h5 M8 12h8 M8 16h5",
    chevron: "M9 5l7 7-7 7",
    exit: "M9 4H4v16h5 M12 12h9 M17 8l4 4-4 4",
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] ?? paths.source} /></svg>;
}
export { Brand } from "./brand";
