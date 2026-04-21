import type { SoundDefinition } from "@web-kits/audio";

// Subtle UI sound palette. All pitches sit in a C major pentatonic family
// (C5/E5/G5/A5) so triggers feel sonically related instead of random.

export const SOUNDS = {
  // Soft tap for small UI clicks (project Details, navbar links).
  click: {
    source: { type: "sine", frequency: 880 },
    envelope: { attack: 0.002, decay: 0.05 },
    gain: 0.08,
  },

  // Rising two-layer pop with a sub-bass thump that makes speakers
  // physically pulse — the closest thing to haptic feedback the web allows.
  open: {
    layers: [
      // Sub thump: quick pitch drop that punches the speaker cone.
      // Short decay keeps it a pulse, not a lingering bass note.
      {
        source: { type: "sine", frequency: { start: 140, end: 55 } },
        envelope: { attack: 0.001, decay: 0.08 },
        gain: 0.35,
      },
      // Bright chirp.
      {
        source: { type: "sine", frequency: { start: 440, end: 880 } },
        envelope: { attack: 0.003, decay: 0.12 },
        gain: 0.1,
      },
      // Sparkle harmonic.
      {
        source: { type: "sine", frequency: 1320 },
        envelope: { attack: 0.003, decay: 0.08 },
        gain: 0.04,
        delay: 0.02,
      },
    ],
  },

  // Descending counterpart for closing.
  close: {
    source: { type: "sine", frequency: { start: 880, end: 440 } },
    envelope: { attack: 0.003, decay: 0.12 },
    gain: 0.1,
  },

  // Crisp upward chirp on message send.
  send: {
    source: { type: "sine", frequency: { start: 880, end: 1175 } },
    envelope: { attack: 0.002, decay: 0.07 },
    gain: 0.11,
  },

  // Two-note rising confirmation (E5 → A5).
  success: {
    layers: [
      {
        source: { type: "sine", frequency: 659.25 },
        envelope: { attack: 0.003, decay: 0.1 },
        gain: 0.12,
      },
      {
        source: { type: "sine", frequency: 880 },
        envelope: { attack: 0.003, decay: 0.14 },
        gain: 0.12,
        delay: 0.11,
      },
    ],
  },

  // Tiny pop used when user toggles sounds on.
  toggle: {
    source: { type: "sine", frequency: 784 },
    envelope: { attack: 0.002, decay: 0.05 },
    gain: 0.09,
  },
} satisfies Record<string, SoundDefinition>;
