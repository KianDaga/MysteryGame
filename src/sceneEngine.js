/**
 * Scene/event engine for a locked-room mystery interactive narrative.
 *
 * The engine is intentionally dependency-free so it can be embedded in a
 * browser game, CLI prototype, or test harness. Scenes are immutable metadata;
 * runtime progress is held in GameState and advanced through choices/events.
 */

const ENDINGS = Object.freeze({
  PERFECT_CASE: 'perfect_case',
  RIGHT_SUSPECT_WEAK_EVIDENCE: 'right_suspect_weak_evidence',
  WRONG_ACCUSATION: 'wrong_accusation',
  UNSOLVED: 'unsolved',
});

const DEFAULT_STATE = Object.freeze({
  currentSceneId: 'intro',
  visitedScenes: [],
  clues: [],
  flags: {},
  playedReveals: [],
  suspects: ['Lady Vale', 'Professor Caine', 'Dr. Sable', 'Victor Grey'],
  accusedSuspect: null,
  ending: null,
  timeline: [],
});

function unique(list) {
  return [...new Set(list)];
}

function normalizeState(initialState = {}) {
  return {
    ...DEFAULT_STATE,
    ...initialState,
    visitedScenes: [...(initialState.visitedScenes ?? DEFAULT_STATE.visitedScenes)],
    clues: unique([...(initialState.clues ?? DEFAULT_STATE.clues)]),
    flags: { ...DEFAULT_STATE.flags, ...(initialState.flags ?? {}) },
    playedReveals: unique([...(initialState.playedReveals ?? DEFAULT_STATE.playedReveals)]),
    suspects: [...(initialState.suspects ?? DEFAULT_STATE.suspects)],
    timeline: [...(initialState.timeline ?? DEFAULT_STATE.timeline)],
  };
}

function applyStateChanges(state, changes = {}) {
  const next = normalizeState(state);

  if (changes.addClues) next.clues = unique([...next.clues, ...changes.addClues]);
  if (changes.removeClues) next.clues = next.clues.filter((clue) => !changes.removeClues.includes(clue));
  if (changes.setFlags) next.flags = { ...next.flags, ...changes.setFlags };
  if (changes.accusedSuspect !== undefined) next.accusedSuspect = changes.accusedSuspect;
  if (changes.ending !== undefined) next.ending = changes.ending;
  if (changes.timeline) next.timeline = [...next.timeline, ...changes.timeline];

  return next;
}

function hasRequiredClues(state, requiredClues = []) {
  return requiredClues.every((clue) => state.clues.includes(clue));
}

function choiceIsAvailable(state, choice) {
  if (!hasRequiredClues(state, choice.requiredClues)) return false;
  if (choice.requiredFlags) {
    return Object.entries(choice.requiredFlags).every(([flag, value]) => state.flags[flag] === value);
  }
  return true;
}

function sceneIsAvailable(state, scene) {
  if (!scene) return false;
  if (!hasRequiredClues(state, scene.requiredClues)) return false;
  if (scene.requiredFlags) {
    return Object.entries(scene.requiredFlags).every(([flag, value]) => state.flags[flag] === value);
  }
  return true;
}

function transition(text, tone = 'dramatic') {
  return { type: 'transition', tone, text };
}

function reveal(id, text, changes = {}, delayMs = 0) {
  return { type: 'reveal', id, text, delayMs, changes };
}

const SCENES = Object.freeze({
  intro: {
    id: 'intro',
    title: 'An Invitation in Crimson Ink',
    location: 'Ravenshollow Manor, Front Hall',
    description:
      'A storm pens every guest inside Lord Ravenshollow’s ancestral home. Dinner bells echo through the hall while each suspect hides a reason to fear midnight.',
    requiredClues: [],
    choices: [
      {
        id: 'enter_dinner',
        label: 'Join the dinner party',
        description: 'Meet the suspects before the first scream tears through the manor.',
        nextSceneId: 'first_murder',
        stateChanges: {
          addClues: ['guest_list', 'storm_locked_manor'],
          timeline: ['Arrived at Ravenshollow Manor during the storm.'],
        },
      },
      {
        id: 'inspect_hall',
        label: 'Inspect the front hall first',
        description: 'Notice what the hosts hoped you would walk past.',
        nextSceneId: 'first_murder',
        stateChanges: {
          addClues: ['muddy_footprints', 'guest_list', 'storm_locked_manor'],
          timeline: ['Found muddy footprints by the servants’ passage.'],
        },
      },
    ],
    transitions: [transition('Thunder folds over the roof like a closing coffin lid.')],
  },

  first_murder: {
    id: 'first_murder',
    title: 'The Study Door Opens',
    location: 'Lord Ravenshollow’s Study',
    description:
      'The locked study yawns open. Lord Ravenshollow lies across his desk, one hand frozen around a torn scrap of sheet music.',
    requiredClues: [],
    choices: [
      {
        id: 'secure_scene',
        label: 'Secure the crime scene',
        description: 'Keep the guests away from the body and preserve fragile evidence.',
        nextSceneId: 'investigation_one',
        stateChanges: {
          addClues: ['locked_study', 'torn_sheet_music', 'poisoned_brandy'],
          setFlags: { crimeSceneProtected: true },
          timeline: ['Protected the study before the evidence could be disturbed.'],
        },
      },
      {
        id: 'question_guests',
        label: 'Question the shaken guests',
        description: 'Let the room breathe while you catch the first lies.',
        nextSceneId: 'investigation_one',
        stateChanges: {
          addClues: ['contradictory_alibis', 'torn_sheet_music'],
          setFlags: { crimeSceneProtected: false },
          timeline: ['Heard conflicting alibis immediately after the first murder.'],
        },
      },
    ],
    transitions: [transition('The study door groans open, and every candle leans away from what waits inside.')],
    stagedReveals: [
      reveal('body_discovered', 'Lightning exposes the body before anyone can pretend this is an accident.', {
        setFlags: { firstBodyDiscovered: true },
      }, 1200),
      reveal('music_scrap', 'A torn bar of music clings to the victim’s hand: the same melody played before dinner.', {
        addClues: ['torn_sheet_music'],
      }, 2400),
    ],
  },

  investigation_one: {
    id: 'investigation_one',
    title: 'Whispers Between Rooms',
    location: 'Library, Conservatory, and Servants’ Passage',
    description:
      'The manor becomes a board of moving pieces. Every room offers a clue, and every suspect knows the clock is your enemy.',
    requiredClues: [],
    choices: [
      {
        id: 'search_library',
        label: 'Search the library ledger',
        description: 'Trace debts, inheritances, and a missing page from the household accounts.',
        nextSceneId: 'investigation_two',
        stateChanges: {
          addClues: ['inheritance_dispute', 'missing_ledger_page'],
          timeline: ['Found evidence of an inheritance dispute in the library ledger.'],
        },
      },
      {
        id: 'follow_music',
        label: 'Follow the midnight melody',
        description: 'Compare the torn music with the tune heard before dinner.',
        requiredClues: ['torn_sheet_music'],
        nextSceneId: 'investigation_two',
        stateChanges: {
          addClues: ['music_box_mechanism', 'hidden_study_panel'],
          timeline: ['Linked the torn sheet music to a hidden mechanism in the study.'],
        },
      },
    ],
    transitions: [transition('Rain needles the windows as footsteps retreat above the ceiling.')],
  },

  investigation_two: {
    id: 'investigation_two',
    title: 'The House Rearranges Itself',
    location: 'West Wing Corridor',
    description:
      'A second pass through the manor reveals what panic concealed: a burned glove, a stopped clock, and a witness too frightened to speak plainly.',
    requiredClues: [],
    choices: [
      {
        id: 'press_witness',
        label: 'Press the frightened maid',
        description: 'Risk her trust to learn who crossed the west wing after midnight.',
        nextSceneId: 'second_murder',
        stateChanges: {
          addClues: ['west_wing_witness', 'sable_seen_near_study'],
          timeline: ['Learned Dr. Sable was seen near the study after midnight.'],
        },
      },
      {
        id: 'analyze_glove',
        label: 'Analyze the burned glove',
        description: 'Match the residue on the glove to the poison and the blackout fuse box.',
        nextSceneId: 'second_murder',
        stateChanges: {
          addClues: ['burned_glove', 'chemical_residue'],
          timeline: ['Matched chemical residue on a burned glove to the poison.'],
        },
      },
    ],
    transitions: [transition('Somewhere behind the walls, an old service bell rings once by itself.')],
  },

  second_murder: {
    id: 'second_murder',
    title: 'The Witness Falls Silent',
    location: 'Conservatory',
    description:
      'The person nearest the truth is found beneath the glass roof, orchids scattered like spilled secrets around a second body.',
    requiredClues: [],
    choices: [
      {
        id: 'chase_shadow',
        label: 'Chase the fleeing shadow',
        description: 'Pursue movement toward the breaker room before the trail goes cold.',
        nextSceneId: 'blackout',
        stateChanges: {
          addClues: ['bloodied_cufflink', 'breaker_room_key'],
          timeline: ['Recovered a bloodied cufflink near the route to the breaker room.'],
        },
      },
      {
        id: 'examine_second_body',
        label: 'Examine the second body',
        description: 'Determine why this victim had to die before the final act.',
        nextSceneId: 'blackout',
        stateChanges: {
          addClues: ['unfinished_warning_note', 'same_poison_signature'],
          timeline: ['Found an unfinished warning note on the second victim.'],
        },
      },
    ],
    transitions: [transition('The conservatory glass rattles as if the storm is trying to get in.')],
    stagedReveals: [
      reveal('second_body_discovered', 'A scream rises from the conservatory; by the time you arrive, the witness is beyond testimony.', {
        setFlags: { secondBodyDiscovered: true },
      }, 1000),
    ],
  },

  blackout: {
    id: 'blackout',
    title: 'All Lights Out',
    location: 'Breaker Room and Grand Staircase',
    description:
      'The manor plunges into darkness. Voices move where bodies should not, and one final piece of evidence can be won only by listening.',
    requiredClues: [],
    choices: [
      {
        id: 'restore_power',
        label: 'Restore power immediately',
        description: 'End the chaos before another victim is chosen.',
        nextSceneId: 'final_accusation',
        stateChanges: {
          addClues: ['tampered_breaker'],
          setFlags: { heardBlackoutConfession: false },
          timeline: ['Restored power and confirmed the breaker was tampered with.'],
        },
      },
      {
        id: 'listen_in_dark',
        label: 'Wait and listen in the dark',
        description: 'Let the killer believe the blackout still belongs to them.',
        nextSceneId: 'final_accusation',
        stateChanges: {
          addClues: ['tampered_breaker', 'sable_confession_fragment'],
          setFlags: { heardBlackoutConfession: true },
          timeline: ['Heard Dr. Sable whisper about the hidden panel during the blackout.'],
        },
      },
    ],
    transitions: [transition('Every lamp dies at once; the manor becomes breath, rain, and footsteps.')],
    stagedReveals: [
      reveal('lights_cut_out', 'The chandelier snaps black, leaving only thunder to map the room.', {
        setFlags: { blackoutTriggered: true },
      }, 500),
      reveal('body_nearly_discovered', 'Your hand brushes a sleeve on the stairs—warm, trembling, alive, and fleeing.', {}, 1800),
    ],
  },

  final_accusation: {
    id: 'final_accusation',
    title: 'The Drawing Room Accusation',
    location: 'Drawing Room',
    description:
      'At dawn, the survivors gather. Your accusation must bind motive, method, and opportunity before fear rewrites the night.',
    requiredClues: [],
    choices: [
      ...DEFAULT_STATE.suspects.map((suspect) => ({
        id: `accuse_${suspect.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        label: `Accuse ${suspect}`,
        description: `Present your case against ${suspect}.`,
        nextSceneId: 'endings',
        stateChanges: { accusedSuspect: suspect },
      })),
      {
        id: 'refuse_accusation',
        label: 'Refuse to accuse anyone',
        description: 'Admit the case is not yet proven.',
        nextSceneId: 'endings',
        stateChanges: { accusedSuspect: null },
      },
    ],
    transitions: [transition('Dawn stains the curtains red as the suspects form a circle around your evidence.')],
  },

  endings: {
    id: 'endings',
    title: 'What the Morning Believes',
    location: 'Ravenshollow Manor, Dawn',
    description:
      'The manor releases its survivors, but the truth changes shape depending on what you proved and whom you named.',
    requiredClues: [],
    choices: [],
    transitions: [transition('The storm moves east, leaving the house to answer for the night.')],
  },
});

const decisiveEvidence = [
  'sable_seen_near_study',
  'chemical_residue',
  'sable_confession_fragment',
  'hidden_study_panel',
  'same_poison_signature',
];

function resolveEnding(state) {
  if (!state.accusedSuspect) return ENDINGS.UNSOLVED;
  if (state.accusedSuspect !== 'Dr. Sable') return ENDINGS.WRONG_ACCUSATION;

  const evidenceCount = decisiveEvidence.filter((clue) => state.clues.includes(clue)).length;
  return evidenceCount >= 3 ? ENDINGS.PERFECT_CASE : ENDINGS.RIGHT_SUSPECT_WEAK_EVIDENCE;
}

const ENDING_TEXT = Object.freeze({
  [ENDINGS.PERFECT_CASE]: {
    title: 'The Perfect Case',
    description: 'Dr. Sable breaks when motive, poison, hidden passage, and blackout are laid in an unbroken chain.',
  },
  [ENDINGS.RIGHT_SUSPECT_WEAK_EVIDENCE]: {
    title: 'The Right Name, The Wrong Weight',
    description: 'Dr. Sable is named, but the evidence leaves enough shadow for doubt to haunt the verdict.',
  },
  [ENDINGS.WRONG_ACCUSATION]: {
    title: 'The Killer Walks at Dawn',
    description: 'Your accusation collapses. The real murderer leaves with the mourners and a carefully folded smile.',
  },
  [ENDINGS.UNSOLVED]: {
    title: 'No Accusation',
    description: 'You spare the innocent from a guess, but Ravenshollow keeps its murderer.',
  },
});

class SceneEngine {
  constructor(scenes = SCENES, initialState = {}) {
    this.scenes = scenes;
    this.state = normalizeState(initialState);
  }

  getCurrentScene() {
    const scene = this.scenes[this.state.currentSceneId];
    if (!scene) throw new Error(`Unknown scene: ${this.state.currentSceneId}`);
    if (!sceneIsAvailable(this.state, scene)) {
      throw new Error(`Scene ${scene.id} is locked by unmet requirements`);
    }
    return scene;
  }

  getAvailableChoices(sceneId = this.state.currentSceneId) {
    const scene = this.scenes[sceneId];
    if (!scene) throw new Error(`Unknown scene: ${sceneId}`);
    return scene.choices.filter((choice) => choiceIsAvailable(this.state, choice));
  }

  peekStagedReveals(sceneId = this.state.currentSceneId) {
    const scene = this.scenes[sceneId];
    if (!scene) throw new Error(`Unknown scene: ${sceneId}`);
    return (scene.stagedReveals ?? []).filter((stagedReveal) => !this.state.playedReveals.includes(stagedReveal.id));
  }

  playStagedReveals(sceneId = this.state.currentSceneId) {
    const reveals = this.peekStagedReveals(sceneId);
    for (const stagedReveal of reveals) {
      this.state = applyStateChanges(this.state, stagedReveal.changes);
      this.state.playedReveals = unique([...this.state.playedReveals, stagedReveal.id]);
    }
    return reveals;
  }

  async playStagedRevealsAsync(sceneId = this.state.currentSceneId, onReveal = () => {}) {
    const reveals = this.peekStagedReveals(sceneId);
    for (const stagedReveal of reveals) {
      if (stagedReveal.delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, stagedReveal.delayMs));
      }
      this.state = applyStateChanges(this.state, stagedReveal.changes);
      this.state.playedReveals = unique([...this.state.playedReveals, stagedReveal.id]);
      onReveal(stagedReveal, this.state);
    }
    return reveals;
  }

  choose(choiceId) {
    const scene = this.getCurrentScene();
    const choice = scene.choices.find((candidate) => candidate.id === choiceId);

    if (!choice) throw new Error(`Choice ${choiceId} does not exist in scene ${scene.id}`);
    if (!choiceIsAvailable(this.state, choice)) throw new Error(`Choice ${choiceId} is not currently available`);

    let next = applyStateChanges(this.state, choice.stateChanges);
    next.visitedScenes = unique([...next.visitedScenes, scene.id]);
    next.currentSceneId = choice.nextSceneId;

    if (choice.nextSceneId === 'endings') {
      next.ending = resolveEnding(next);
    }

    const nextScene = this.scenes[next.currentSceneId];
    if (!nextScene) throw new Error(`Choice ${choiceId} points to unknown scene ${choice.nextSceneId}`);
    if (!sceneIsAvailable(next, nextScene)) {
      throw new Error(`Choice ${choiceId} points to locked scene ${choice.nextSceneId}`);
    }

    this.state = next;
    return {
      scene: this.getCurrentScene(),
      transition: this.getCurrentScene().transitions?.[0] ?? null,
      state: this.state,
      ending: this.state.ending ? ENDING_TEXT[this.state.ending] : null,
    };
  }
}

module.exports = {
  DEFAULT_STATE,
  ENDINGS,
  ENDING_TEXT,
  SCENES,
  SceneEngine,
  applyStateChanges,
  choiceIsAvailable,
  hasRequiredClues,
  sceneIsAvailable,
  resolveEnding,
};
