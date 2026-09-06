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
const cloudinaryGifs = {
  'supino-reto-barra':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658720/avatares/SUPINO_BARRA.gif',
  'abdominal-polia-alta-em-pe':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658720/avatares/ABDOMINAL_NA_POLIA.gif',
  'cadeira-extensora':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658720/avatares/CADEIRA_EXTENSORA.gif',
  'remada-alta-halteres':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658719/avatares/REMADA_ALTA_COM_HALTERES.gif',
  'panturrilha-sentada-maquina':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658719/avatares/PANTURRILHA.gif',
  'supino-inclinado':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658719/avatares/SUPINO_INCLINADO_COM_ALTERES.gif',
  'encolhimento-halteres':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658719/avatares/ENCOLHIMENTO_COM_ALTERES.gif',
  'crucifixo-polia-alta':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788659235/avatares/CRUCIFIXO_NA_POLIA.gif',
  'rosca-concentrada-halteres':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788659171/avatares/ROSCA_CONCENTRADA_COM_HALTERES.gif',
};
for (const [id, src] of Object.entries(cloudinaryGifs)) {
  const definition = animation.exerciseAnimation(id);
  assert.equal(definition.src, src);
  assert.equal(definition.animatedGif, true);
  assert.equal(new URL(definition.src).hostname, 'res.cloudinary.com');
}
const flat = tracking.initialExercises.find(
  (e) => e.id === 'supino-reto-halteres',
);
const inclined = tracking.initialExercises.find(
  (e) => e.id === 'supino-inclinado',
);
assert(flat && inclined && flat.id !== inclined.id);
assert.equal(flat.equipment, 'Halteres');
assert.equal(flat.category, 'Peito');
assert.equal(inclined.name, 'Supino inclinado com halteres');
assert.equal(tracking.defaultLoadBasis(inclined), 'kg por halter');
const barbellBench = tracking.initialExercises.find(
  (e) => e.id === 'supino-reto-barra',
);
assert.equal(barbellBench.category, 'Peito');
assert.equal(barbellBench.equipment, 'Barra e banco reto');
assert.equal(tracking.defaultLoadBasis(barbellBench), 'kg total da barra');
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
const legExtension = tracking.initialExercises.find(
  (e) => e.id === 'cadeira-extensora',
);
assert.equal(legExtension.category, 'Pernas');
assert.equal(legExtension.equipment, 'Cadeira extensora');
assert.equal(tracking.defaultLoadBasis(legExtension), 'kg indicado na máquina');
const calfRaise = tracking.initialExercises.find(
  (e) => e.id === 'panturrilha-sentada-maquina',
);
assert.equal(calfRaise.category, 'Pernas');
assert.equal(calfRaise.equipment, 'Máquina de panturrilha sentada');
assert.equal(tracking.defaultLoadBasis(calfRaise), 'kg adicional');
const shrug = tracking.initialExercises.find(
  (e) => e.id === 'encolhimento-halteres',
);
assert.equal(shrug.category, 'Costas');
assert.equal(shrug.equipment, 'Halteres');
assert.equal(tracking.defaultLoadBasis(shrug), 'kg por halter');
const uprightRow = tracking.initialExercises.find(
  (e) => e.id === 'remada-alta-halteres',
);
assert.equal(uprightRow.category, 'Ombros');
assert.equal(uprightRow.equipment, 'Halteres');
assert.equal(tracking.defaultLoadBasis(uprightRow), 'kg por halter');
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
