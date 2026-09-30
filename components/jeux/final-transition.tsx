"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { jeuxConfig } from "@/lib/jeux/config";

export function FinalTransition({ onContinue }: { onContinue: () => void }) {
  const [visibleLines, setVisibleLines] = useState(1);
  const lines = jeuxConfig.finalTransition.lines;

  useEffect(() => {
    if (visibleLines >= lines.length) return;
    const timeout = setTimeout(() => setVisibleLines((n) => n + 1), 1600);
    return () => clearTimeout(timeout);
  }, [visibleLines, lines.length]);

  const allShown = visibleLines >= lines.length;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-3">
        {lines.slice(0, visibleLines).map((line, i) => (
          <p
            key={i}
            className="animate-in fade-in font-display text-xl font-medium duration-700 sm:text-2xl"
          >
            {line}
          </p>
        ))}
      </div>
      {allShown && (
        <Button size="lg" className="animate-in fade-in duration-700" onClick={onContinue}>
          {jeuxConfig.finalTransition.buttonLabel}
        </Button>
      )}
    </div>
  );
}
