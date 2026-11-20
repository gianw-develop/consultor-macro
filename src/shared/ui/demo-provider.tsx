"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Horizon } from "../../contracts/core";
const DemoContext = createContext<{ horizon: Horizon; setHorizon: (value: Horizon) => void; demo: boolean; setDemo: (value: boolean) => void } | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [horizon, setHorizon] = useState<Horizon>("one_to_three_months");
  const [demo, setDemo] = useState(false);
  return <DemoContext.Provider value={{ horizon, setHorizon, demo, setDemo }}>{children}</DemoContext.Provider>;
}
export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("DemoProvider requerido");
  return value;
}
