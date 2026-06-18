const assert = require('node:assert/strict');
const test = require('node:test');
const {
  ENDINGS,
  SCENES,
  SceneEngine,
  resolveEnding,
  sceneIsAvailable,
} = require('../src/sceneEngine');

test('all required scenes expose narrative metadata', () => {
  for (const sceneId of ['intro', 'first_murder', 'investigation_one', 'investigation_two', 'second_murder', 'blackout', 'final_accusation', 'endings']) {
    const scene = SCENES[sceneId];
    assert.ok(scene, `${sceneId} exists`);
    assert.ok(scene.title, `${sceneId} has a title`);
    assert.ok(scene.location, `${sceneId} has a location`);
    assert.ok(scene.description, `${sceneId} has a description`);
    assert.ok(Array.isArray(scene.choices), `${sceneId} has choices`);
    assert.ok(Array.isArray(scene.requiredClues), `${sceneId} has required clues`);
    assert.ok(Array.isArray(scene.transitions), `${sceneId} has transitions`);
  }
});

test('progresses through the perfect-case path and applies staged reveals once', () => {
  const engine = new SceneEngine();
  assert.equal(engine.getCurrentScene().id, 'intro');

  engine.choose('inspect_hall');
  assert.ok(engine.state.clues.includes('muddy_footprints'));
  assert.equal(engine.getCurrentScene().id, 'first_murder');

  const firstReveals = engine.playStagedReveals();
  assert.equal(firstReveals.length, 2);
  assert.equal(engine.state.flags.firstBodyDiscovered, true);
  assert.deepEqual(engine.playStagedReveals(), []);

  engine.choose('secure_scene');
  engine.choose('follow_music');
  engine.choose('press_witness');
  engine.choose('examine_second_body');
  engine.playStagedReveals();
  engine.choose('listen_in_dark');
  const result = engine.choose('accuse_dr_sable');

  assert.equal(result.state.ending, ENDINGS.PERFECT_CASE);
  assert.equal(result.ending.title, 'The Perfect Case');
});

test('gates choices and scenes by requirements', () => {
  const engine = new SceneEngine(undefined, { currentSceneId: 'investigation_one', clues: [] });
  const availableChoiceIds = engine.getAvailableChoices().map((choice) => choice.id);

  assert.deepEqual(availableChoiceIds, ['search_library']);
  assert.equal(sceneIsAvailable(engine.state, SCENES.investigation_one), true);
  assert.equal(sceneIsAvailable(engine.state, { id: 'locked', requiredClues: ['missing'] }), false);
});

test('resolves multiple endings from accusation and evidence quality', () => {
  assert.equal(resolveEnding({ accusedSuspect: 'Victor Grey', clues: [] }), ENDINGS.WRONG_ACCUSATION);
  assert.equal(resolveEnding({ accusedSuspect: null, clues: [] }), ENDINGS.UNSOLVED);
  assert.equal(resolveEnding({ accusedSuspect: 'Dr. Sable', clues: ['chemical_residue'] }), ENDINGS.RIGHT_SUSPECT_WEAK_EVIDENCE);
  assert.equal(
    resolveEnding({
      accusedSuspect: 'Dr. Sable',
      clues: ['chemical_residue', 'hidden_study_panel', 'same_poison_signature'],
    }),
    ENDINGS.PERFECT_CASE,
  );
});
