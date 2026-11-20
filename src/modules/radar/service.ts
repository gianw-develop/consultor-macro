import type { AssetClass } from '../../contracts/radar';
import type { Horizon } from '../../contracts/core';
import type { MarketContextReference } from '../../contracts/annienexus';
import { analyzeCloses, INSTRUMENTS, toPlatformPage } from './observations';
import type { CloseObservation, Instrument } from './observations';
import { fetchDailyCloses } from './coinbase';

export interface RadarDependencies {
  clock?: () => string;
  load?: (instrument: Instrument, requestedAt: string) => Promise<CloseObservation[]>;
  /** Optional last observed data supplied by Platform; never silently generated. */
  cached?: (instrument: Instrument) => readonly CloseObservation[];
}

/** Server-side service. No route, session bypass, browser fetch or schedule is registered here. */
export async function collectObservations(query: { assetClass: AssetClass; horizon: Horizon;
  context?: MarketContextReference | null }, dependencies: RadarDependencies = {}) {
  if (!['stocks', 'crypto'].includes(query.assetClass) ||
      !['today','week','one_to_three_months','three_to_six_months'].includes(query.horizon)) throw new Error('Invalid radar query');
  const clock = dependencies.clock ?? (() => new Date().toISOString());
  const load = dependencies.load ?? (async (instrument: Instrument, now: string) => {
    if (instrument.assetClass !== 'crypto') return [];
    return fetchDailyCloses(instrument, now, fetch, clock);
  });
  const analyses = [];
  for (const instrument of INSTRUMENTS.filter(i => i.assetClass === query.assetClass)) {
    let rows: readonly CloseObservation[] = [];
    let failed = false;
    try { rows = await load(instrument, clock()); }
    catch {
      failed = true;
      try { rows = dependencies.cached?.(instrument) ?? []; } catch { rows = []; }
    }
    const result = analyzeCloses(instrument, rows, { now: clock(), horizon: query.horizon,
      maxAgeMs: instrument.assetClass === 'crypto' ? 2 * 86400000 : 4 * 86400000, context: query.context });
    result.limitations.push(instrument.assetClass === 'crypto'
      ? 'Cierres diarios de un mercado al contado; sin flujos ni derivados. Hoy describe el último día completo, no la sesión en curso.'
      : 'Conector de bolsa pendiente. Política provisional de antigüedad de 4 días; calendario y ajustes corporativos aún no integrados.');
    if (failed) {
      result.limitations.push('La fuente no respondió. Solo se conserva información anterior si fue proporcionada; no se inventan datos.');
      if (result.status === 'ok') result.status = 'partial';
    }
    analyses.push(result);
  }
  return toPlatformPage(analyses, clock());
}
