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
  'abdominal-halter-bracos-estendidos':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658752/avatares/42481301-Dumbbell-Straight-Arm-Crunch_Waist_720_1.gif',
  'cadeira-extensora':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658720/avatares/CADEIRA_EXTENSORA.gif',
  'remada-alta-halteres':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658719/avatares/REMADA_ALTA_COM_HALTERES.gif',
  'elevacao-lateral':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788660649/avatares/download_2.gif',
  'elevacao-lateral-sentada':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788660703/avatares/download_3.gif',
  'panturrilha-sentada-maquina':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658719/avatares/PANTURRILHA.gif',
  'avanco-frente-halteres':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788662664/avatares/download_7.gif',
  'supino-inclinado':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658719/avatares/SUPINO_INCLINADO_COM_ALTERES.gif',
  'triceps-testa-inclinado-barra-w':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788661228/avatares/How_To_Perform_The_Incline_EZ-Bar_Triceps_Extension.gif',
  'encolhimento-halteres':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658719/avatares/ENCOLHIMENTO_COM_ALTERES.gif',
  'barra-fixa-assistida-maquina':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788660932/avatares/download_5.gif',
  'face-pull-polia-corda':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788660934/avatares/download_4.gif',
  'crucifixo-polia-alta':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788659235/avatares/CRUCIFIXO_NA_POLIA.gif',
  'rosca-concentrada-halteres':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788659171/avatares/ROSCA_CONCENTRADA_COM_HALTERES.gif',
  'rosca-inversa-barra-reta':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788661143/avatares/10_Best_Brachialis_Exercises_To_Build_Bigger_and_Stronger_Arms.gif',
  'rosca-martelo-polia-baixa-corda':
    'https://res.cloudinary.com/doo0fzoef/image/upload/v1788662624/avatares/Top_5_Must-Try_Cable_Biceps_Exercises_For_Size_And_Definition_2.gif',
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
const inclineSkullCrusher = tracking.initialExercises.find(
  (e) => e.id === 'triceps-testa-inclinado-barra-w',
);
assert.equal(
  inclineSkullCrusher.name,
  'Tríceps testa no banco inclinado com barra W',
);
assert.equal(inclineSkullCrusher.category, 'Tríceps');
assert.equal(inclineSkullCrusher.equipment, 'Barra W e banco inclinado');
assert.equal(
  tracking.defaultLoadBasis(inclineSkullCrusher),
  'kg total da barra',
);
assert.equal(
  tracking.initialExercises.find((e) => e.id === 'rosca-concentrada-halteres')
    .category,
  'Bíceps',
);
const reverseCurl = tracking.initialExercises.find(
  (e) => e.id === 'rosca-inversa-barra-reta',
);
assert.equal(reverseCurl.name, 'Rosca inversa em pé com barra reta');
assert.equal(reverseCurl.category, 'Bíceps');
assert.equal(reverseCurl.equipment, 'Barra reta');
assert.equal(tracking.defaultLoadBasis(reverseCurl), 'kg total da barra');
const cableHammerCurl = tracking.initialExercises.find(
  (e) => e.id === 'rosca-martelo-polia-baixa-corda',
);
assert.equal(cableHammerCurl.name, 'Rosca martelo na polia baixa com corda');
assert.equal(cableHammerCurl.category, 'Bíceps');
assert.equal(cableHammerCurl.equipment, 'Polia baixa com corda');
assert.equal(
  tracking.defaultLoadBasis(cableHammerCurl),
  'kg indicado na máquina',
);
const abdominal = tracking.initialExercises.find(
  (e) => e.id === 'abdominal-polia-alta-em-pe',
);
assert.equal(abdominal.category, 'Abdômen');
assert.equal(abdominal.equipment, 'Polia alta com corda');
const dumbbellCrunch = tracking.initialExercises.find(
  (e) => e.id === 'abdominal-halter-bracos-estendidos',
);
assert.equal(dumbbellCrunch.name, 'Abdominal com halter e braços estendidos');
assert.equal(dumbbellCrunch.category, 'Abdômen');
assert.equal(dumbbellCrunch.equipment, 'Halter');
assert.equal(tracking.defaultLoadBasis(dumbbellCrunch), 'kg por halter');
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
const dumbbellLunge = tracking.initialExercises.find(
  (e) => e.id === 'avanco-frente-halteres',
);
assert.equal(dumbbellLunge.name, 'Avanço à frente com halteres');
assert.equal(dumbbellLunge.category, 'Pernas');
assert.equal(dumbbellLunge.equipment, 'Halteres');
assert.equal(tracking.defaultLoadBasis(dumbbellLunge), 'kg por halter');
const shrug = tracking.initialExercises.find(
  (e) => e.id === 'encolhimento-halteres',
);
assert.equal(shrug.category, 'Costas');
assert.equal(shrug.equipment, 'Halteres');
assert.equal(tracking.defaultLoadBasis(shrug), 'kg por halter');
const assistedPullUp = tracking.initialExercises.find(
  (e) => e.id === 'barra-fixa-assistida-maquina',
);
assert.equal(assistedPullUp.name, 'Barra fixa assistida na máquina');
assert.equal(assistedPullUp.category, 'Costas');
assert.match(assistedPullUp.equipment, /peso de auxílio/);
assert.equal(
  tracking.defaultLoadBasis(assistedPullUp),
  'kg indicado na máquina',
);
const uprightRow = tracking.initialExercises.find(
  (e) => e.id === 'remada-alta-halteres',
);
assert.equal(uprightRow.category, 'Ombros');
assert.equal(uprightRow.equipment, 'Halteres');
assert.equal(tracking.defaultLoadBasis(uprightRow), 'kg por halter');
const facePull = tracking.initialExercises.find(
  (e) => e.id === 'face-pull-polia-corda',
);
assert.equal(facePull.name, 'Face pull na polia com corda');
assert.equal(facePull.category, 'Ombros');
assert.equal(facePull.equipment, 'Polia alta com corda');
const standingLateralRaise = tracking.initialExercises.find(
  (e) => e.id === 'elevacao-lateral',
);
const seatedLateralRaise = tracking.initialExercises.find(
  (e) => e.id === 'elevacao-lateral-sentada',
);
assert.equal(standingLateralRaise.name, 'Elevação lateral em pé com halteres');
assert.equal(standingLateralRaise.category, 'Ombros');
assert.equal(seatedLateralRaise.name, 'Elevação lateral sentada com halteres');
assert.equal(seatedLateralRaise.category, 'Ombros');
assert.equal(tracking.defaultLoadBasis(seatedLateralRaise), 'kg por halter');
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
