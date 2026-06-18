# MysteryGame

A dependency-free JavaScript scene/event engine for a branching locked-room mystery.

## Scene engine

`src/sceneEngine.js` exports:

- `SceneEngine` — runtime state manager for scene progression.
- `SCENES` — immutable scene metadata for the intro, murders, investigations, blackout, accusation, and endings.
- `ENDINGS` and `ENDING_TEXT` — ending identifiers and player-facing ending copy.
- Pure helpers for state changes, choice gating, reveal playback, and ending resolution.

## Usage

```js
const { SceneEngine } = require('./src/sceneEngine');

const engine = new SceneEngine();
console.log(engine.getCurrentScene().title);

engine.choose('inspect_hall');
engine.playStagedReveals();
console.log(engine.getAvailableChoices().map((choice) => choice.label));
```

Staged reveals can be previewed without mutating state via `peekStagedReveals()` or applied once via `playStagedReveals()`.
