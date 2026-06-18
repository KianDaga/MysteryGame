const SUSPECT_IDS = Object.freeze({
  MARLOWE: 'marlowe_voss',
  CELESTE: 'celeste_rane',
  DARIUS: 'darius_vale',
  ISLA: 'isla_moreau',
  THEO: 'theo_crane',
  NAOMI: 'naomi_sable',
});

const CLUES = Object.freeze({
  WILL_CODICIL: 'will_codicil',
  FORGED_AUCTION_LEDGER: 'forged_auction_ledger',
  CAMERA_GAP_LOG: 'camera_gap_log',
  BACKSTAGE_LETTER: 'backstage_letter',
  RUINED_FUND_STATEMENT: 'ruined_fund_statement',
  PRESS_BADGE: 'press_badge',
  BOAT_HOUSE_KEY: 'boat_house_key',
  RED_SCARF_THREAD: 'red_scarf_thread',
});

const TOPICS = Object.freeze({
  INTRO: 'intro',
  MOTIVE: 'motive',
  ALIBI: 'alibi',
  SECRET: 'secret',
});

const suspectDefinitions = Object.freeze({
  [SUSPECT_IDS.MARLOWE]: {
    id: SUSPECT_IDS.MARLOWE,
    name: 'Marlowe Voss',
    role: 'Billionaire host',
    personality: 'Magnetic, theatrical, and allergic to visible weakness.',
    motive: 'Several guests had leverage over his forged philanthropy accounts and succession plans.',
    alibi: 'Claims he was in the observatory rehearsing a midnight toast.',
    secret: 'He planned to disinherit a family trust beneficiary before dawn.',
    baseSuspicion: 18,
    dialogue: {
      [TOPICS.INTRO]: [
        { text: 'My guests expect thunder, scandal, and expensive wine. Murder was not on the program.' },
        { text: 'If you must interrogate me, at least keep pace. I despise slow accusations.' },
      ],
      [TOPICS.MOTIVE]: [
        { text: 'Enemies are a tax one pays for being exceptional. None were bold enough to collect tonight.' },
        { requiresClues: [CLUES.WILL_CODICIL], unlocksSecret: 'changed_will', suspicionDelta: 9, text: 'You found the codicil. Then you know I was rearranging loyalties, not sharpening knives.' },
      ],
      [TOPICS.ALIBI]: [
        { text: 'The observatory clock chimed while I practiced the toast. Ask anyone with ears.' },
        { requiresClues: [CLUES.CAMERA_GAP_LOG], suspicionDelta: 6, text: 'No camera saw me because Darius insisted the east wing was under maintenance. Convenient for him, less so for me.' },
      ],
      [TOPICS.SECRET]: [
        { text: 'A secret stops being valuable the moment it is spoken aloud.' },
        { requiresSecrets: ['changed_will'], text: 'Yes, the will changed. Half this house would rather burn than lose my money.' },
      ],
    },
    contradictions: [
      {
        id: 'observatory_camera_gap',
        evidenceClue: CLUES.CAMERA_GAP_LOG,
        prompt: 'The observatory camera was disabled during your toast rehearsal.',
        response: 'Disabled is not absent. Someone wanted my alibi to look manufactured.',
        suspicionDelta: 8,
        unlocksSecret: 'knows_security_gap',
      },
    ],
  },
  [SUSPECT_IDS.CELESTE]: {
    id: SUSPECT_IDS.CELESTE,
    name: 'Celeste Rane',
    role: 'Art dealer',
    personality: 'Silken, exacting, and quietly predatory when cornered.',
    motive: 'Marlowe threatened to expose her forged-auction network.',
    alibi: 'Claims she was cataloging a cracked Degas miniature in the gallery.',
    secret: 'She sold Marlowe a forged triptych and kept the real provenance file.',
    baseSuspicion: 24,
    dialogue: {
      intro: [
        { text: 'Touch nothing in the gallery. Fingerprints are vulgar, even when legal.' },
        { text: 'I deal in authenticity, detective. People are usually the counterfeit pieces.' },
      ],
      motive: [
        { text: 'Marlowe bought art the way children collect shells: loudly, greedily, and without understanding value.' },
        { requiresClues: [CLUES.FORGED_AUCTION_LEDGER], unlocksSecret: 'auction_forgery', suspicionDelta: 12, text: 'That ledger is incomplete. Dangerous, yes, but incomplete enough to get the wrong woman hanged.' },
      ],
      alibi: [
        { text: 'The gallery alarm records every door. I was inside with dust, varnish, and better company than any guest.' },
        { requiresClues: [CLUES.RED_SCARF_THREAD], suspicionDelta: 7, text: 'A red thread near the service stairs proves only that someone wears theatrical accessories poorly.' },
      ],
      secret: [
        { text: 'Collectors confuse secrecy with crime. I prefer to call it inventory control.' },
        { requiresSecrets: ['auction_forgery'], text: 'The forged-auction circle existed before me. I merely learned its passwords.' },
      ],
    },
    contradictions: [
      { id: 'ledger_signature', evidenceClue: CLUES.FORGED_AUCTION_LEDGER, prompt: 'Your signature appears in the forged-auction ledger.', response: 'A traced signature. Bring me the ink test and I will bring you the forger.', suspicionDelta: 10, unlocksSecret: 'signature_disputed' },
    ],
  },
  [SUSPECT_IDS.DARIUS]: {
    id: SUSPECT_IDS.DARIUS,
    name: 'Darius Vale', role: 'Private security chief', personality: 'Disciplined, terse, and more protective of systems than people.', motive: 'Marlowe was going to fire him over missing camera footage.', alibi: 'Claims he was resetting the gate sensors in the control room.', secret: 'He manually created a seven-minute camera gap to conceal a prior breach.', baseSuspicion: 30,
    dialogue: {
      intro: [{ text: 'Ask clean questions. I answer those.' }, { text: 'This house has forty-two cameras and one hundred liars.' }],
      motive: [{ text: 'Employment disputes do not become homicides on my watch.' }, { requiresClues: [CLUES.CAMERA_GAP_LOG], unlocksSecret: 'created_camera_gap', suspicionDelta: 14, text: 'The gap was mine. The murder was not. I was hiding a breach that happened earlier.' }],
      alibi: [{ text: 'Control room. Gate sensors. Two logs and one guard can confirm it.' }, { requiresSecrets: ['created_camera_gap'], text: 'If I wanted a clean murder, I would not leave the ugliest gap in the system pointing at me.' }],
      secret: [{ text: 'Security secrets keep people alive.' }, { requiresSecrets: ['created_camera_gap'], text: 'Someone entered from the boathouse before dinner. I buried it to keep my contract.' }],
    },
    contradictions: [{ id: 'manual_camera_override', evidenceClue: CLUES.CAMERA_GAP_LOG, prompt: 'The camera gap was made with your authorization code.', response: 'Correct. Challenge me with what happened during it, not the mistake I already own.', suspicionDelta: 13, unlocksSecret: 'created_camera_gap' }],
  },
  [SUSPECT_IDS.ISLA]: {
    id: SUSPECT_IDS.ISLA, name: 'Isla Moreau', role: 'Singer hired for the party', personality: 'Wry, wounded, glamorous, and quick to turn pain into performance.', motive: 'Marlowe ruined her brother with an old contract and mocked the debt.', alibi: 'Claims she was in the music room repairing a snapped microphone cable.', secret: 'She came carrying a letter proving Marlowe blackmailed her brother.', baseSuspicion: 26,
    dialogue: {
      intro: [{ text: 'I was paid to sing, not to scream. Though tonight offered opportunities for both.' }, { text: 'People hear a stage name and assume the woman underneath is decorative.' }],
      motive: [{ text: 'Marlowe collected broken people and called it patronage.' }, { requiresClues: [CLUES.BACKSTAGE_LETTER], unlocksSecret: 'brother_blackmail', suspicionDelta: 11, text: 'That letter is my brother’s ghost with stationery. Yes, I hated Marlowe for it.' }],
      alibi: [{ text: 'Music room. Broken cable. One bloody finger from the copper braid, if evidence still matters.' }, { requiresClues: [CLUES.RED_SCARF_THREAD], suspicionDelta: 5, text: 'My scarf is black. Red belongs to someone trying to be remembered.' }],
      secret: [{ text: 'Every song has a bridge you do not see coming.' }, { requiresSecrets: ['brother_blackmail'], text: 'I wanted a confession recorded, not a corpse discovered.' }],
    },
    contradictions: [{ id: 'letter_revenge', evidenceClue: CLUES.BACKSTAGE_LETTER, prompt: 'Your letter says Marlowe deserved to pay tonight.', response: 'Pay with truth. I write dramatically; I do not kill poetically.', suspicionDelta: 9, unlocksSecret: 'wanted_recorded_confession' }],
  },
  [SUSPECT_IDS.THEO]: {
    id: SUSPECT_IDS.THEO, name: 'Theo Crane', role: 'Investor', personality: 'Nervous charm wrapped around volcanic resentment.', motive: 'Lost millions after following Marlowe into a doomed private fund.', alibi: 'Claims he was taking a call on the terrace with no reception.', secret: 'He brought bankruptcy papers and a concealed settlement offer.', baseSuspicion: 28,
    dialogue: {
      intro: [{ text: 'If this is about money, get in line behind my creditors.' }, { text: 'Marlowe made risk sound like destiny. I supplied the stupidity.' }],
      motive: [{ text: 'Millions vanish quietly. Murder is a very loud accounting method.' }, { requiresClues: [CLUES.RUINED_FUND_STATEMENT], unlocksSecret: 'fund_loss', suspicionDelta: 12, text: 'Yes, that fund gutted me. But killing Marlowe would not resurrect a cent.' }],
      alibi: [{ text: 'Terrace. Failed call. Rain in my shoes and humiliation in my throat.' }, { requiresClues: [CLUES.BOAT_HOUSE_KEY], suspicionDelta: 8, text: 'The boathouse key was not mine. I am bankrupt, not nautical.' }],
      secret: [{ text: 'My secrets are mostly denominated in dollars.' }, { requiresSecrets: ['fund_loss'], text: 'I came to force a settlement before my creditors learned I was here.' }],
    },
    contradictions: [{ id: 'terrace_no_signal', evidenceClue: CLUES.RUINED_FUND_STATEMENT, prompt: 'Your “phone call” has no carrier record.', response: 'Because it never connected. I was rehearsing how to beg without sounding poor.', suspicionDelta: 7, unlocksSecret: 'fake_call' }],
  },
  [SUSPECT_IDS.NAOMI]: {
    id: SUSPECT_IDS.NAOMI, name: 'Naomi Sable', role: 'Journalist posing as a guest', personality: 'Observant, dry, fearless, and professionally dishonest about access.', motive: 'Needed Marlowe alive long enough to publish an exposé, but he had discovered her alias.', alibi: 'Claims she was interviewing staff near the pantry under a false name.', secret: 'She entered with a borrowed invitation and a hidden recorder.', baseSuspicion: 20,
    dialogue: {
      intro: [{ text: 'I am a guest in the same way a lockpick is a key.' }, { text: 'Before you ask, yes, I noticed who left the room. No, observations are not charity.' }],
      motive: [{ text: 'Dead men do not sue, but they also do not answer follow-up questions.' }, { requiresClues: [CLUES.PRESS_BADGE], unlocksSecret: 'undercover_journalist', suspicionDelta: 10, text: 'Fine. Naomi Sable, investigative desk. The canapés were cover, not motive.' }],
      alibi: [{ text: 'Pantry corridor. Staff interviews. Three people lied better than I did.' }, { requiresSecrets: ['undercover_journalist'], text: 'My recorder caught footsteps near the boathouse door. Trade me a clue and I may share names.' }],
      secret: [{ text: 'Secrets are my profession. Mine are simply better edited.' }, { requiresSecrets: ['undercover_journalist'], text: 'Marlowe knew my alias by dessert. Someone warned him before I could.' }],
    },
    contradictions: [{ id: 'false_guest_badge', evidenceClue: CLUES.PRESS_BADGE, prompt: 'This press badge proves you lied about being invited.', response: 'It proves I lied about the invitation, not the knife. Precision matters.', suspicionDelta: 8, unlocksSecret: 'undercover_journalist' }],
  },
});

export function createInitialGameState() {
  return {
    discoveredClues: [],
    suspects: Object.fromEntries(Object.values(suspectDefinitions).map((suspect) => [suspect.id, {
      suspicion: suspect.baseSuspicion,
      unlockedSecrets: [],
      askedTopics: {},
      contradictionsResolved: [],
    }])),
  };
}

export function discoverClue(state, clueId) {
  if (!Object.values(CLUES).includes(clueId)) throw new Error(`Unknown clue: ${clueId}`);
  if (!state.discoveredClues.includes(clueId)) state.discoveredClues.push(clueId);
  return state;
}

export function getSuspect(id) {
  const suspect = suspectDefinitions[id];
  if (!suspect) throw new Error(`Unknown suspect: ${id}`);
  return suspect;
}

function hasAll(values, required = []) {
  return required.every((value) => values.includes(value));
}

function chooseLine(lines, suspectState, state) {
  const eligible = lines.filter((line) => hasAll(state.discoveredClues, line.requiresClues) && hasAll(suspectState.unlockedSecrets, line.requiresSecrets));
  const chosen = eligible.at(-1) ?? lines[0];
  return chosen;
}

export function askSuspect(state, suspectId, topic = TOPICS.INTRO) {
  const suspect = getSuspect(suspectId);
  const suspectState = state.suspects[suspectId];
  const lines = suspect.dialogue[topic];
  if (!lines) throw new Error(`Unknown topic for ${suspect.name}: ${topic}`);

  const line = chooseLine(lines, suspectState, state);
  suspectState.askedTopics[topic] = (suspectState.askedTopics[topic] ?? 0) + 1;
  if (line.suspicionDelta) suspectState.suspicion += line.suspicionDelta;
  if (line.unlocksSecret && !suspectState.unlockedSecrets.includes(line.unlocksSecret)) {
    suspectState.unlockedSecrets.push(line.unlocksSecret);
  }

  return {
    suspect: suspect.name,
    topic,
    text: line.text,
    suspicion: suspectState.suspicion,
    unlockedSecrets: [...suspectState.unlockedSecrets],
  };
}

export function challengeSuspect(state, suspectId, contradictionId) {
  const suspect = getSuspect(suspectId);
  const suspectState = state.suspects[suspectId];
  const contradiction = suspect.contradictions.find((item) => item.id === contradictionId);
  if (!contradiction) throw new Error(`Unknown contradiction for ${suspect.name}: ${contradictionId}`);
  if (!state.discoveredClues.includes(contradiction.evidenceClue)) {
    return { suspect: suspect.name, accepted: false, text: `${suspect.name} refuses the challenge; you lack the evidence to press this contradiction.`, suspicion: suspectState.suspicion };
  }
  if (!suspectState.contradictionsResolved.includes(contradiction.id)) {
    suspectState.contradictionsResolved.push(contradiction.id);
    suspectState.suspicion += contradiction.suspicionDelta;
    if (contradiction.unlocksSecret && !suspectState.unlockedSecrets.includes(contradiction.unlocksSecret)) {
      suspectState.unlockedSecrets.push(contradiction.unlocksSecret);
    }
  }
  return {
    suspect: suspect.name,
    accepted: true,
    prompt: contradiction.prompt,
    text: contradiction.response,
    suspicion: suspectState.suspicion,
    unlockedSecrets: [...suspectState.unlockedSecrets],
  };
}

export function listSuspects() {
  return Object.values(suspectDefinitions).map(({ id, name, role, personality, motive, alibi, secret, baseSuspicion }) => ({ id, name, role, personality, motive, alibi, secret, baseSuspicion }));
}

export { CLUES, SUSPECT_IDS, TOPICS, suspectDefinitions };
