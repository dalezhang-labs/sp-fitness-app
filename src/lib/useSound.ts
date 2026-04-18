"use client";

import { useCallback, useRef } from "react";

// ─── Sound preference key ────────────────────────────────────────────────────
const SOUND_KEY = "sp-fitness-sound";

export function getSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(SOUND_KEY);
  return raw === null ? true : raw === "true";
}

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem(SOUND_KEY, String(enabled));
}

// ─── Tone definitions ────────────────────────────────────────────────────────
type ToneConfig = {
  frequency: number;
  duration: number;       // seconds
  type?: OscillatorType;
  gainPeak?: number;
  fadeIn?: number;        // seconds
  fadeOut?: number;       // seconds
};

type ChordConfig = ToneConfig[];

const SOUNDS = {
  // Short, punchy "go!" beep — exercise set starts
  setStart: [
    { frequency: 880, duration: 0.12, type: "sine", gainPeak: 0.35, fadeIn: 0.005, fadeOut: 0.08 },
    { frequency: 1100, duration: 0.12, type: "sine", gainPeak: 0.25, fadeIn: 0.005, fadeOut: 0.08 },
  ] as ChordConfig,

  // Soft descending tone — rest period begins
  restStart: [
    { frequency: 660, duration: 0.18, type: "sine", gainPeak: 0.28, fadeIn: 0.01, fadeOut: 0.12 },
    { frequency: 440, duration: 0.22, type: "sine", gainPeak: 0.18, fadeIn: 0.01, fadeOut: 0.15 },
  ] as ChordConfig,

  // 3-2-1 countdown tick — last 3 seconds of any phase
  tick: [
    { frequency: 1200, duration: 0.08, type: "square", gainPeak: 0.15, fadeIn: 0.003, fadeOut: 0.06 },
  ] as ChordConfig,

  // Final tick (louder) — the "0" moment
  tickFinal: [
    { frequency: 1400, duration: 0.10, type: "square", gainPeak: 0.22, fadeIn: 0.003, fadeOut: 0.07 },
  ] as ChordConfig,

  // Triumphant ascending arpeggio — all sets done
  complete: [
    { frequency: 523.25, duration: 0.12, type: "sine", gainPeak: 0.30, fadeIn: 0.005, fadeOut: 0.08 },
    { frequency: 659.25, duration: 0.12, type: "sine", gainPeak: 0.28, fadeIn: 0.005, fadeOut: 0.08 },
    { frequency: 783.99, duration: 0.18, type: "sine", gainPeak: 0.32, fadeIn: 0.005, fadeOut: 0.12 },
    { frequency: 1046.5, duration: 0.28, type: "sine", gainPeak: 0.35, fadeIn: 0.005, fadeOut: 0.20 },
  ] as ChordConfig,

  // Soft click — UI action (start button, form save)
  click: [
    { frequency: 800, duration: 0.07, type: "sine", gainPeak: 0.18, fadeIn: 0.003, fadeOut: 0.05 },
  ] as ChordConfig,

  // Gentle negative tone — cancel / delete
  cancel: [
    { frequency: 440, duration: 0.14, type: "sine", gainPeak: 0.20, fadeIn: 0.005, fadeOut: 0.10 },
    { frequency: 330, duration: 0.18, type: "sine", gainPeak: 0.15, fadeIn: 0.005, fadeOut: 0.13 },
  ] as ChordConfig,
} as const;

export type SoundName = keyof typeof SOUNDS;

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  /**
   * Play a named sound. For "complete" we stagger the notes as an arpeggio.
   * All other sounds play their chord tones simultaneously.
   */
  const play = useCallback((name: SoundName) => {
    if (!getSoundEnabled()) return;
    const ctx = getCtx();
    if (!ctx) return;

    const chord = SOUNDS[name];
    const isArpeggio = name === "complete";
    const arpeggioStep = 0.10; // seconds between arpeggio notes

    chord.forEach((tone, i) => {
      const startOffset = isArpeggio ? i * arpeggioStep : 0;
      const startTime = ctx.currentTime + startOffset;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = (tone.type ?? "sine") as OscillatorType;
      osc.frequency.setValueAtTime(tone.frequency, startTime);

      const peak = tone.gainPeak ?? 0.3;
      const fadeIn = tone.fadeIn ?? 0.005;
      const fadeOut = tone.fadeOut ?? 0.08;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(peak, startTime + fadeIn);
      gain.gain.setValueAtTime(peak, startTime + tone.duration - fadeOut);
      gain.gain.linearRampToValueAtTime(0, startTime + tone.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + tone.duration + 0.01);
    });
  }, [getCtx]);

  return { play };
}
