import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { MacroSnapshot } from "./macro-data";
export async function loadMacroSnapshot(): Promise<MacroSnapshot | null> {
  try {
    const snapshot = JSON.parse(await readFile(path.join(process.cwd(), "data/macro/latest.json"), "utf8")) as MacroSnapshot;
    if (snapshot.version !== 1 || !Number.isFinite(Date.parse(snapshot.capturedAt))) return null;
    return snapshot;
  } catch { return null; }
}
