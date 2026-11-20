/* eslint-disable @typescript-eslint/no-require-imports -- compiled TypeScript fixture module. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { QUADRANT_DEMO, demoQuadrantPoint, quadrantView, quadrantMovement, demoPhaseAngle } = require('../.foundation-test-build/modules/annienexus/quadrant-data.js');

test('Missing actual evidence never becomes a point at the origin or a synthetic history', () => {
  for (const selected of [0, 3, 6, NaN, -1, 99]) {
    assert.deepEqual(quadrantView(false, selected), { frame: null, point: null, trail: [] });
  }
  assert.equal(demoQuadrantPoint({ ...QUADRANT_DEMO[0], kind: 'observation' }), null);
});

test('Direction differs from level: positive growth and inflation can both decelerate without a crisis label', () => {
  const frame = { ...QUADRANT_DEMO[0], growth: { current: 2, previous: 3 }, inflation: { current: 4, previous: 5 } };
  assert.deepEqual(demoQuadrantPoint(frame), { x: -1, y: -1, zone: 'growth_prices_easing' });
  assert.equal(demoQuadrantPoint({ ...frame, growth: { current: 2, previous: 2 } }).zone, 'transition');
  assert.equal(demoQuadrantPoint({ ...frame, inflation: { current: NaN, previous: 2 } }), null);
});

test('A selected historical example only includes the selected and earlier observations', () => {
  QUADRANT_DEMO.forEach((frame, selected) => {
    const view = quadrantView(true, selected);
    assert.equal(view.frame.month, frame.month);
    assert.equal(view.trail.length, selected + 1);
    assert.ok(view.trail.every(p => p.observedAt <= frame.observedAt && p.publishedAt <= frame.publishedAt));
    assert.ok(frame.publishedAt > frame.observedAt);
    assert.equal(frame.kind, 'demonstration');
  });
});

test('Every synthetic marker is derived from its displayed rate changes and remains finite', () => {
  for (const frame of QUADRANT_DEMO) {
    const p = demoQuadrantPoint(frame);
    assert.ok(p && Number.isFinite(p.x) && Number.isFinite(p.y));
    assert.ok(Math.abs(p.x - (frame.growth.current - frame.growth.previous)) < 1e-9);
    assert.ok(Math.abs(p.y - (frame.inflation.current - frame.inflation.previous)) < 1e-9);
    assert.ok(Math.abs(p.x) < 1.3 && Math.abs(p.y) < 1.1);
  }
});

test('A demonstration never confirms a real regime crossing, even on a boundary', () => {
  for (let selected = 0; selected < QUADRANT_DEMO.length; selected++) {
    assert.equal(quadrantMovement(true, selected).confirmed, false);
    assert.equal(quadrantMovement(false, selected).state, 'unassessed');
  }
  assert.equal(quadrantMovement(true, 6).state, 'demo_boundary');
});

test('The dated editorial cut remains separate from synthetic coordinates and future releases', () => {
  const cut = require('../docs/annienexus/quadrant-course-lab-cut-2026-09-30.json');
  assert.equal(cut.quadrant.exact_coordinates, null);
  assert.equal(cut.quadrant.confirmed_label, null);
  assert.equal(cut.quadrant.candidate_boundary, null);
  assert.equal(cut.quadrant.probabilities, null);
  const cutoff = Date.parse(cut.as_of);
  for (const row of cut.observations) {
    if (row.released_at_et) assert.ok(Date.parse(row.released_at_et) <= cutoff, row.id);
  }
});


test('The phase dial preserves the four teaching directions and never invents a real angle', () => {
  const zones = [
    {x:-1,y:1,zone:'growth_down_prices_up',angle:-45},
    {x:1,y:1,zone:'growth_prices_up',angle:45},
    {x:-1,y:-1,zone:'growth_prices_easing',angle:-135},
    {x:1,y:-1,zone:'growth_up_prices_easing',angle:135},
  ];
  for (const p of zones) {
    assert.equal(demoPhaseAngle(true,p),p.angle);
    assert.equal(demoPhaseAngle(false,p),null);
  }
  assert.equal(demoPhaseAngle(true,null),null);
  assert.equal(demoPhaseAngle(true,{x:0,y:0,zone:'transition'}),null);
  assert.equal(demoPhaseAngle(true,{x:NaN,y:1,zone:'transition'}),null);
});

const { ESTIMATE_SNAPSHOT, estimatePosition } = require('../.foundation-test-build/modules/annienexus/quadrant-estimate.js');

test('Official US inputs produce a descriptive sector, never a confirmed economic regime', () => {
  const p = estimatePosition(ESTIMATE_SNAPSHOT);
  assert.ok(Math.abs(p.growthChange - 0.2499) < 1e-9);
  assert.ok(Math.abs(p.priorInflation - 2.012927) < 1e-8);
  assert.ok(Math.abs(p.recentInflation - 0.0983984) < 1e-8);
  assert.equal(p.growthDirection, 1);
  assert.equal(p.inflationDirection, -1);
  assert.equal(p.angle, 135);
  assert.equal(p.confirmedRegime, false);
});

test('Real projection rejects missing months, duplicate months, non-US series and future releases', () => {
  for (const patch of [
    { country: 'G7' }, { cli: ESTIMATE_SNAPSHOT.cli.slice(1) },
    { cpi: ESTIMATE_SNAPSHOT.cpi.slice(1) },
    { cli: [...ESTIMATE_SNAPSHOT.cli, ESTIMATE_SNAPSHOT.cli[0]] },
    { cliPublished: '2026-10-07T12:00:00+02:00' }, { cpiPublished: 'not-a-date' },
    { observedMonth: '2026-09' },
    { cli: ESTIMATE_SNAPSHOT.cli.map(r => ({ ...r, value: NaN })) },
  ]) assert.equal(estimatePosition({ ...ESTIMATE_SNAPSHOT, ...patch }), null);
});

test('Rounding ambiguity yields no directional point instead of a forced neutral or quadrant', () => {
  const p = estimatePosition({ ...ESTIMATE_SNAPSHOT, cpi: ESTIMATE_SNAPSHOT.cpi.map(r => ({ ...r, value: 0.1 })) });
  assert.equal(p.inflationDirection, 0);
  assert.equal(p.angle, null);
  const q = estimatePosition({ ...ESTIMATE_SNAPSHOT, cli: ESTIMATE_SNAPSHOT.cli.map(r => ({ ...r, value: 100.7 })) });
  assert.equal(q.growthDirection, 0);
  assert.equal(q.angle, null);
});

test('The sector depends on signs, not on incomparable magnitudes or the CLI level of 100', () => {
  const base = estimatePosition(ESTIMATE_SNAPSHOT);
  const shifted = estimatePosition({ ...ESTIMATE_SNAPSHOT, cli: ESTIMATE_SNAPSHOT.cli.map(r => ({ ...r, value: r.value - 10 })) });
  assert.equal(shifted.angle, base.angle);
  const stronger = estimatePosition({ ...ESTIMATE_SNAPSHOT, cli: ESTIMATE_SNAPSHOT.cli.map((r,i) => ({ ...r, value: r.value + i })) });
  assert.equal(stronger.angle, base.angle);
});
