const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const source = fs.readFileSync('lib/tracking.ts', 'utf8');
const code = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const context = { exports: {}, Date };
vm.runInNewContext(code, context);
const { parseMeasurement, parseLoad, compare, comparableLoads } =
  context.exports;
const body = parseMeasurement({
  month: '2026-01',
  weight: '80,5',
  height: '175',
  waist: '',
});
assert.equal(body.weight, 80.5);
assert.equal(body.waist, null);
assert.equal(body.id, '2026-01');
assert.throws(() =>
  parseMeasurement({ month: '2026-13', weight: 80, height: 175 }),
);
assert.throws(() =>
  parseMeasurement({ month: '2026-01', weight: '', height: 175 }),
);
assert.throws(() =>
  parseMeasurement({ month: '2026-01', weight: '-1', height: 175 }),
);
assert.equal(compare(82, 80).delta, 2);
assert.equal(compare(78, 80).percent, -2.5);
assert.equal(compare(10, 0).percent, null);
assert.equal(compare(null, 10), null);
const exercise = { id: 'press', name: 'Supino', equipment: 'Halteres' };
const load = parseLoad(
  {
    date: '2026-01-02',
    equipment: 'Halteres',
    basis: 'kg por halter',
    weight: '12,5',
    sets: 3,
    reps: 10,
  },
  exercise,
  'one',
);
assert.equal(load.weight, 12.5);
assert.throws(() => parseLoad({ ...load, sets: 1.5 }, exercise, 'one'));
assert.throws(() =>
  parseLoad({ ...load, date: '2026-02-30' }, exercise, 'one'),
);
assert.throws(() => parseLoad({ ...load, weight: -2 }, exercise, 'one'));
assert.throws(() =>
  parseLoad({ ...load, basis: 'unidade desconhecida' }, exercise, 'one'),
);
assert.equal(
  comparableLoads(
    [
      load,
      { ...load, id: 'two', basis: 'kg total da barra' },
      { ...load, id: 'three', equipment: 'Outro' },
    ],
    load,
  ).length,
  1,
);
assert.equal(
  comparableLoads([{ ...load, id: 'two', date: '2026-01-03' }, load], load)[0]
    .id,
  'one',
);
console.log(
  'PASS: medidas, meses, decimais, carga zero, datas, validação, diferenças e isolamento por equipamento/unidade.',
);
