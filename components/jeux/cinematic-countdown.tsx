"use client";

import { useEffect, useState } from "react";
import { jeuxConfig } from "@/lib/jeux/config";
import { jeuxSound } from "@/lib/jeux/sound";

const STEPS = ["3", "2", "1", "✨"];

export function CinematicCountdown({
  onDone,
  line,
}: {
  onDone: () => void;
  line?: string;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length) {
      const timeout = setTimeout(onDone, 500);
      return () => clearTimeout(timeout);
    }
    jeuxSound.click();
    const timeout = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-foreground/95 text-background">
      <p className="text-lg font-medium tracking-wide opacity-80">
        {line ?? jeuxConfig.countdown.heartbeatLine}
      </p>
      <p
        key={step}
        className="animate-in zoom-in fade-in font-display text-7xl font-bold duration-500 sm:text-8xl"
      >
        {STEPS[Math.min(step, STEPS.length - 1)]}
      </p>
    </div>
  );
}
