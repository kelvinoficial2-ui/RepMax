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
assert.equal(animation.EXERCISE_FRAME_MS, 125);
for (const [id, width, height, poseCount] of [
  ['supino-reto-halteres', 1448, 1086, 8],
  ['rosca-concentrada-halteres', 1672, 1254, 12],
  ['abdominal-polia-alta-em-pe', 1448, 1086, 12],
  ['crucifixo-polia-alta', 1448, 1086, 5],
]) {
  const definition = animation.exerciseAnimation(id);
  assert(definition);
  assert.equal(new Set(definition.sequence).size, poseCount);
  assert.equal(definition.sequence[0], definition.sequence.at(-1));
  for (let index = 0; index < definition.sequence.length; index++) {
    const frame = animation.exerciseAnimationFrame(id, index);
    assert(frame.x >= 0 && frame.x + frame.size <= width);
    assert(frame.y >= 0 && frame.y + frame.size <= height);
  }
  const asset = fs.readFileSync('public' + definition.src);
  assert.equal(asset.readUInt16BE(0), 0xffd8);
  assert(asset.length < 300000);
  assert(fs.readFileSync('dist' + definition.src).equals(asset));
}
assert.equal(animation.exerciseAnimation('sem-animacao'), null);
assert.equal(
  animation.exerciseAnimation('abdominal-polia-alta-em-pe').src,
  '/exercises/abdominal-polia-alta-em-pe-v2.jpg',
);
const movingWeight = animation.exerciseAnimation(
  'abdominal-polia-alta-em-pe',
).movingWeight;
assert.deepEqual(
  { ...movingWeight },
  { x: 233, y: 254, width: 58, height: 23, maxLift: 42 },
);
const abdominalSequence = animation.exerciseAnimation(
  'abdominal-polia-alta-em-pe',
).sequence;
assert.equal(
  animation.exerciseAnimationFrame('abdominal-polia-alta-em-pe', 0).progress,
  0,
);
assert.equal(
  animation.exerciseAnimationFrame(
    'abdominal-polia-alta-em-pe',
    abdominalSequence.indexOf(11),
  ).progress,
  1,
);
const flat = tracking.initialExercises.find(
  (e) => e.id === 'supino-reto-halteres',
);
const inclined = tracking.initialExercises.find(
  (e) => e.id === 'supino-inclinado',
);
assert(flat && inclined && flat.id !== inclined.id);
assert.equal(flat.equipment, 'Halteres');
assert.equal(flat.category, 'Peito');
assert.equal(
  tracking.initialExercises.find((e) => e.id === 'rosca-concentrada-halteres')
    .category,
  'Bíceps',
);
const abdominal = tracking.initialExercises.find(
  (e) => e.id === 'abdominal-polia-alta-em-pe',
);
assert.equal(abdominal.category, 'Abdômen');
assert.equal(abdominal.equipment, 'Polia alta com corda');
const crossover = tracking.initialExercises.find(
  (e) => e.id === 'crucifixo-polia-alta',
);
assert.equal(crossover.category, 'Peito');
assert.equal(crossover.equipment, 'Crossover / polia dupla');
assert.equal(tracking.defaultLoadBasis(crossover), 'kg por lado');
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
