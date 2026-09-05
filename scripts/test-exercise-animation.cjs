const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
function readModule(path) {
  const context = { exports: {} };
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(path, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    context,
  );
  return context.exports;
}
const animation = readModule('lib/exercise-animation.ts');
const tracking = readModule('lib/tracking.ts');
assert.deepEqual(
  [...animation.SUPINO_UPWARD_POSES],
  [0, 1, 2, 3, 4, 5, 6, 7, 11],
);
assert.equal(new Set(animation.SUPINO_SEQUENCE).size, 9);
assert.equal(animation.SUPINO_FRAME_MS, 125);
assert.equal(animation.SUPINO_SEQUENCE[0], animation.SUPINO_SEQUENCE.at(-1));
const highest = animation.SUPINO_SEQUENCE.indexOf(11);
assert.deepEqual(
  [...animation.SUPINO_SEQUENCE.slice(2, highest + 1)],
  [...animation.SUPINO_UPWARD_POSES],
);
assert.deepEqual(
  [...animation.SUPINO_SEQUENCE.slice(-animation.SUPINO_UPWARD_POSES.length)],
  [...animation.SUPINO_UPWARD_POSES].reverse(),
);
for (let index = 0; index < animation.SUPINO_SEQUENCE.length; index++) {
  const frame = animation.supinoFrame(index);
  assert(frame.x >= 0 && frame.x + frame.size <= 1448);
  assert(frame.y >= 0 && frame.y + frame.size <= 1086);
}
const asset = fs.readFileSync('public' + animation.SUPINO_SPRITE);
assert.equal(asset.readUInt16BE(0), 0xffd8);
assert(asset.length < 300000);
assert(fs.readFileSync('dist' + animation.SUPINO_SPRITE).equals(asset));
const flat = tracking.initialExercises.find(
  (e) => e.id === 'supino-reto-halteres',
);
const inclined = tracking.initialExercises.find(
  (e) => e.id === 'supino-inclinado',
);
assert(flat && inclined && flat.id !== inclined.id);
assert.equal(flat.equipment, 'Halteres');
assert.equal(
  new Set(tracking.initialExercises.map((e) => e.id)).size,
  tracking.initialExercises.length,
);
const flatLoad = {
  id: 'one',
  exerciseId: flat.id,
  equipment: 'Halteres',
  basis: 'kg por halter',
  date: '2026-01-01',
  weight: 10,
};
assert.equal(
  tracking.comparableLoads(
    [flatLoad, { ...flatLoad, id: 'two', exerciseId: inclined.id }],
    flatLoad,
  ).length,
  1,
);
console.log(
  'PASS: approved sequence, sprite bounds and deployment asset, distinct flat/incline exercises and load isolation.',
);
