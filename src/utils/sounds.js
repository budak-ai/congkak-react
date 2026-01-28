/**
 * Congkak Sound Engine — Web Audio API procedural sounds
 * No external files needed. All sounds synthesized.
 */

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// Ensure context is resumed (browsers block autoplay)
export function unlockAudio() {
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
}

/**
 * Wood tap — seed dropping into a hole
 * Short percussive click with wood-like resonance
 */
export function playSeedDrop() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Noise burst for the "click"
  const bufferSize = ctx.sampleRate * 0.03;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 8);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Bandpass to make it "woody"
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800 + Math.random() * 400;
  filter.Q.value = 2;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start(t);
  noise.stop(t + 0.06);
}

/**
 * Deeper thud — seed dropping into house (scoring)
 */
export function playHouseDrop() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Low tone
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

  // Noise layer
  const bufferSize = ctx.sampleRate * 0.05;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 6);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.12, t);
  nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

  osc.connect(gain).connect(ctx.destination);
  noise.connect(nGain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.15);
  noise.start(t);
  noise.stop(t + 0.08);
}

/**
 * Scoop — picking up seeds from a hole
 */
export function playPickup() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(600, t + 0.08);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.1);
}

/**
 * Sweep — capturing seeds (swoosh sound)
 */
export function playCapture() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Swoosh = filtered noise sweep
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const env = Math.sin((i / bufferSize) * Math.PI);
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(400, t);
  filter.frequency.exponentialRampToValueAtTime(2000, t + 0.15);
  filter.frequency.exponentialRampToValueAtTime(300, t + 0.3);
  filter.Q.value = 1.5;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start(t);
  noise.stop(t + 0.3);
}

/**
 * Victory chime — ascending notes
 */
export function playWin() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    const start = t + i * 0.12;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

/**
 * Countdown tick
 */
export function playCountdownTick() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 880;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.08);
}

/**
 * Countdown GO — deeper, more satisfying
 */
export function playCountdownGo() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  [523, 784].forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

/**
 * Button click — subtle UI feedback
 */
export function playClick() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 1000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.04);
}
