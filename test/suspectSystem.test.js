import test from 'node:test';
import assert from 'node:assert/strict';
import { CLUES, SUSPECT_IDS, TOPICS, askSuspect, challengeSuspect, createInitialGameState, discoverClue, listSuspects } from '../src/suspectSystem.js';

test('creates six distinct suspects with tracked suspicion and secrets', () => {
  const state = createInitialGameState();
  const suspects = listSuspects();
  assert.equal(suspects.length, 6);
  assert.equal(new Set(suspects.map((suspect) => suspect.name)).size, 6);
  assert.equal(state.suspects[SUSPECT_IDS.DARIUS].suspicion, 30);
  assert.deepEqual(state.suspects[SUSPECT_IDS.NAOMI].unlockedSecrets, []);
});

test('dialogue evolves when clue prerequisites are discovered', () => {
  const state = createInitialGameState();
  const before = askSuspect(state, SUSPECT_IDS.CELESTE, TOPICS.MOTIVE);
  discoverClue(state, CLUES.FORGED_AUCTION_LEDGER);
  const after = askSuspect(state, SUSPECT_IDS.CELESTE, TOPICS.MOTIVE);
  assert.notEqual(after.text, before.text);
  assert.match(after.text, /ledger/i);
  assert.ok(state.suspects[SUSPECT_IDS.CELESTE].unlockedSecrets.includes('auction_forgery'));
  assert.ok(after.suspicion > before.suspicion);
});

test('contradiction challenges require evidence and unlock secrets once', () => {
  const state = createInitialGameState();
  const rejected = challengeSuspect(state, SUSPECT_IDS.DARIUS, 'manual_camera_override');
  assert.equal(rejected.accepted, false);
  assert.equal(rejected.suspicion, 30);

  discoverClue(state, CLUES.CAMERA_GAP_LOG);
  const accepted = challengeSuspect(state, SUSPECT_IDS.DARIUS, 'manual_camera_override');
  assert.equal(accepted.accepted, true);
  assert.ok(accepted.unlockedSecrets.includes('created_camera_gap'));
  assert.equal(accepted.suspicion, 43);

  const repeated = challengeSuspect(state, SUSPECT_IDS.DARIUS, 'manual_camera_override');
  assert.equal(repeated.suspicion, 43);
});
