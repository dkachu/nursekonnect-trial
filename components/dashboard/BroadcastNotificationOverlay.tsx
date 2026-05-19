"use client";

import React, { useTransition } from "react";
import { useRegistrySync } from "@/hooks/useRegistrySync";

export default function BroadcastNotificationOverlay() {
  const [, startTransition] = useTransition();

  const triggerAudioPulse = (frequency: number, duration: number) => {
    startTransition(() => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        console.warn("Audio hardware context occupied.");
      }
    });
  };

  useRegistrySync({
    onNewDispatch: () => {
      triggerAudioPulse(587.33, 0.15); // D5 clinical chime
      setTimeout(() => triggerAudioPulse(880.00, 0.25), 160); // A5 alert tone
    }
  });

  return null; // Operates completely statelessly inside background engine layers
}
