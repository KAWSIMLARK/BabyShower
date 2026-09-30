"use client";

import { Button } from "@/components/ui/button";

export function MissionCompleteOverlay({
  symbol,
  successTitle,
  clueTitle,
  onContinue,
  continueLabel = "Continuer",
}: {
  symbol: string;
  successTitle: string;
  clueTitle: string;
  onContinue: () => void;
  continueLabel?: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <div className="flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-primary/10 text-5xl">
        {symbol}
      </div>
      <div className="space-y-1">
        <p className="font-display text-2xl font-semibold">{successTitle}</p>
        <p className="text-sm font-medium text-primary">{clueTitle} ✨</p>
      </div>
      <Button size="lg" onClick={onContinue}>
        {continueLabel}
      </Button>
    </div>
  );
}
