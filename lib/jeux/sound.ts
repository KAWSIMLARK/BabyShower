// Petits effets sonores synthétisés avec la Web Audio API — aucun fichier
// audio à héberger. Un seul AudioContext est partagé et créé au premier son
// (les navigateurs interdisent de le démarrer avant une interaction).

let sharedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedContext) sharedContext = new AudioContextClass();
  if (sharedContext.state === "suspended") void sharedContext.resume();
  return sharedContext;
}

function tone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType = "sine",
  peakGain = 0.15
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

export const jeuxSound = {
  click() {
    const ctx = getContext();
    if (!ctx) return;
    tone(ctx, 520, ctx.currentTime, 0.08, "sine", 0.08);
  },
  wallBump() {
    const ctx = getContext();
    if (!ctx) return;
    tone(ctx, 140, ctx.currentTime, 0.12, "sawtooth", 0.08);
  },
  missionComplete() {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      tone(ctx, freq, now + i * 0.11, 0.35, "triangle", 0.12);
    });
  },
  reveal() {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [392, 523.25, 659.25, 783.99, 987.77, 1174.66].forEach((freq, i) => {
      tone(ctx, freq, now + i * 0.14, 0.6, "triangle", 0.14);
    });
  },
};
