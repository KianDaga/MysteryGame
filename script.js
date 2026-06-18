const phaseContent = {
  party: {
    lighting: 'Sunset gold',
    weather: 'Warm ocean breeze',
    audio: 'Poolside deep house',
    scene: 'Guests arrive by speedboat beneath coral clouds. Gold lanterns glitter on the infinity pool and the villa glass glows like a jewel.'
  },
  clue: {
    lighting: 'Dimmed glass corridors',
    weather: 'Breeze turning cold',
    audio: 'Bass drops out; security monitor hum',
    scene: 'A missing bracelet appears inside the locked surveillance room. Camera feeds tear with a brief glitch, then recover as if nothing happened.'
  },
  death: {
    lighting: 'Red emergency sweep',
    weather: 'Clouds swallowing the moon',
    audio: 'Music cuts to a low warning tone',
    scene: 'The first body is found beside the mirrored pool. Gold reflections curdle into red as warning lights crawl across the villa walls.'
  },
  storm: {
    lighting: 'Lightning and backup LEDs',
    weather: 'Tropical storm lockdown',
    audio: 'Rain hammers glass; distant thunder',
    scene: 'The helipad floods and the island goes silent. Rain lashes the windows while each flash reveals a different shadow in the palms.'
  },
  finale: {
    lighting: 'Flickering crimson power',
    weather: 'Storm over black water',
    audio: 'Tense strings; heartbeat pulse',
    scene: 'The final clue aligns every secret. Power flickers, blood trails point to the atrium, and the killer steps through a surveillance blind spot.'
  }
};

const body = document.body;
const sceneText = document.querySelector('#sceneText');
const lightingStatus = document.querySelector('#lightingStatus');
const weatherStatus = document.querySelector('#weatherStatus');
const audioStatus = document.querySelector('#audioStatus');
const hero = document.querySelector('.hero-card');

function setPhase(phase) {
  const content = phaseContent[phase];
  body.className = `phase-${phase}`;
  sceneText.textContent = content.scene;
  lightingStatus.textContent = content.lighting;
  weatherStatus.textContent = content.weather;
  audioStatus.textContent = content.audio;
  hero.classList.remove('scene-reveal');
  void hero.offsetWidth;
  hero.classList.add('scene-reveal');
}

document.querySelectorAll('[data-phase]').forEach((button) => {
  button.addEventListener('click', () => setPhase(button.dataset.phase));
});
