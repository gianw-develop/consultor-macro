import type { Metadata } from "next";
import { LevelCalculator } from "../../../modules/annienexus/level-calculator";
export const metadata: Metadata = {title:"Calculadora de niveles · AWNexus"};
export const dynamic = "force-dynamic";
export default function Page() { return <LevelCalculator/>; }
