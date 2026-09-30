"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { jeuxConfig } from "@/lib/jeux/config";
import { jeuxSound } from "@/lib/jeux/sound";

export function TwistQuestion({ onAnswer }: { onAnswer: (choice: "girl" | "boy") => void }) {
  const [showQuestion, setShowQuestion] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowQuestion(true), 1400);
    return () => clearTimeout(timeout);
  }, []);

  function choose(choice: "girl" | "boy") {
    jeuxSound.click();
    onAnswer(choice);
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="animate-in fade-in font-display text-2xl font-semibold duration-700 sm:text-3xl">
        {jeuxConfig.gotcha.twistLine}
      </p>
      {showQuestion && (
        <div className="animate-in fade-in flex flex-col items-center gap-4 duration-700">
          <p className="text-muted-foreground">{jeuxConfig.gotcha.subLine}</p>
          <p className="font-display text-xl font-semibold">{jeuxConfig.gotcha.question}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="outline" onClick={() => choose("girl")}>
              {jeuxConfig.gotcha.optionGirl}
            </Button>
            <Button size="lg" variant="outline" onClick={() => choose("boy")}>
              {jeuxConfig.gotcha.optionBoy}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
