"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/jeux/confetti";
import { jeuxConfig } from "@/lib/jeux/config";
import { jeuxSound } from "@/lib/jeux/sound";

type Gender = "girl" | "boy" | null;
type Status = "loading" | "revealed" | "unavailable";

export function RevealScreen({
  onRestart,
  onRevealed,
}: {
  onRestart: () => void;
  onRevealed: () => void;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [gender, setGender] = useState<Gender>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/gender-reveal/reveal", { method: "POST" })
      .then(async (response) => {
        if (!response.ok) {
          if (!cancelled) setStatus("unavailable");
          return;
        }
        const data = await response.json();
        if (cancelled) return;
        if (data.gender === "girl" || data.gender === "boy") {
          setGender(data.gender);
          setStatus("revealed");
          jeuxSound.reveal();
          onRevealed();
        } else {
          setStatus("unavailable");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        <p className="text-muted-foreground">Un instant de suspense…</p>
      </div>
    );
  }

  if (status === "unavailable" || !gender) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-display text-2xl font-semibold">{jeuxConfig.reveal.unconfigured.title}</p>
        <p className="max-w-sm text-muted-foreground">{jeuxConfig.reveal.unconfigured.subtitle}</p>
      </div>
    );
  }

  const theme = jeuxConfig.reveal[gender];
  const sportsEmojis = ["⚽", "🏀", "🏈", "⚾", "🎾", "🏒", "🏐", "🥎"];

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-5 rounded-3xl px-4 text-center"
      style={{ backgroundColor: theme.colorSoft }}
    >
      <Confetti color={theme.color} emojis={gender === "boy" ? sportsEmojis : undefined} />
      <p
        className="animate-in zoom-in fade-in font-display text-4xl font-bold duration-700 sm:text-5xl"
        style={{ color: theme.color }}
      >
        {theme.title}
      </p>
      <p className="text-lg text-foreground/80">{theme.subtitle}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRestart}>
        {jeuxConfig.restartLabel}
      </Button>
    </div>
  );
}
