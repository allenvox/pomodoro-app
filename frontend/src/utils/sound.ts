/** Unlock audio for playback (call once after user gesture, e.g. on Start click). */
let audioContext: AudioContext | null = null;

export function resumeAudioContext(): void {
  if (audioContext?.state === 'suspended') {
    audioContext.resume();
  } else if (!audioContext && typeof window !== 'undefined') {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      audioContext = new Ctx();
    }
  }
}

/** Play a short alarm (two beeps) when timer ends. Uses Web Audio API, no files. */
export function playAlarmSound(): void {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = audioContext ?? new Ctx();
    if (!audioContext) audioContext = ctx;
    if (ctx.state === 'suspended') ctx.resume();

    const playBeep = (at: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, at);
      gain.gain.exponentialRampToValueAtTime(0.01, at + 0.2);
      osc.start(at);
      osc.stop(at + 0.2);
    };

    const t = ctx.currentTime;
    playBeep(t);
    playBeep(t + 0.35);
  } catch {
    // Ignore if audio is blocked or unsupported
  }
}
