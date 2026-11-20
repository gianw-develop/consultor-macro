export type NoteRecord = { id: string; text: string; at: string; topic: string };
export function readNotebookBackup(raw: string): NoteRecord[] {
  if (raw.length > 1100000) throw new Error("La copia supera el tamaño permitido.");
  let body: { version?: number; notes?: unknown };
  try { body = JSON.parse(raw); } catch { throw new Error("El archivo no contiene una copia JSON válida."); }
  if (!body || body.version !== 1 || !Array.isArray(body.notes) || body.notes.length > 50) throw new Error("Formato de copia no compatible (máximo 50 apuntes).");
  const ids = new Set<string>();
  for (const entry of body.notes) {
    const note = entry as NoteRecord;
    if (!note || typeof note.id !== "string" || !note.id || note.id.length > 100 || ids.has(note.id) || typeof note.text !== "string" || !note.text.trim() || note.text.length > 5000 || typeof note.topic !== "string" || note.topic.length > 500 || typeof note.at !== "string" || !Number.isFinite(Date.parse(note.at))) throw new Error("La copia contiene un apunte inválido o duplicado. No se ha modificado nada.");
    ids.add(note.id);
  }
  return body.notes.map((note: NoteRecord) => ({ id: note.id, text: note.text, topic: note.topic, at: note.at }));
}
export function mergeNotebookBackup(existing: NoteRecord[], imported: NoteRecord[]): NoteRecord[] {
  const merged = new Map(existing.map(note => [note.id, note]));
  for (const note of imported) {
    const prior = merged.get(note.id);
    if (prior && (prior.text !== note.text || prior.topic !== note.topic || prior.at !== note.at)) throw new Error("Hay dos versiones distintas del mismo apunte. Conserva ambas copias antes de resolverlo.");
    merged.set(note.id, note);
  }
  if (merged.size > 50) throw new Error("La combinación supera 50 apuntes. No se ha modificado nada.");
  return [...merged.values()].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}
