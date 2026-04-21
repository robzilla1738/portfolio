"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { SoundProvider as WebKitsSoundProvider } from "@web-kits/audio/react";
import { defineSound, ensureReady } from "@web-kits/audio";
import { SOUNDS } from "@/lib/sounds";

const STORAGE_KEY = "rc-sound-enabled";

type Ctx = {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  toggle: () => void;
};

const SoundSettingsContext = createContext<Ctx | null>(null);

export function useSoundSettings() {
  const ctx = useContext(SoundSettingsContext);
  if (!ctx) throw new Error("useSoundSettings must be used inside <SoundProvider>");
  return ctx;
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  // Default off. Users opt-in via the navbar toggle; choice persists via localStorage.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored === "true") setEnabled(true);
    } catch {
      // localStorage can throw in private browsing — safe to ignore.
    }
  }, []);

  const update = (next: boolean) => {
    setEnabled(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {}
    if (next) {
      // Immediate confirmation chirp, bypassing the provider so it fires on the
      // same tick as the user gesture (required for AudioContext unlock).
      ensureReady();
      defineSound(SOUNDS.toggle)();
    }
  };

  const toggle = () => update(!enabled);

  return (
    <SoundSettingsContext.Provider
      value={{ enabled, setEnabled: update, toggle }}
    >
      <WebKitsSoundProvider enabled={enabled} volume={0.9}>
        {children}
      </WebKitsSoundProvider>
    </SoundSettingsContext.Provider>
  );
}
