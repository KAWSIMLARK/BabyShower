"use client";

import { useMemo, useState } from "react";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressionBar } from "@/components/jeux/progression-bar";
import { MissionCompleteOverlay } from "@/components/jeux/mission-complete-overlay";
import { MazeGame } from "@/components/jeux/maze-game";
import { ShapesGame } from "@/components/jeux/shapes-game";
import { PuzzleGame } from "@/components/jeux/puzzle-game";
import { FinalTransition } from "@/components/jeux/final-transition";
import { CinematicCountdown } from "@/components/jeux/cinematic-countdown";
import { TwistQuestion } from "@/components/jeux/twist-question";
import { RevealScreen } from "@/components/jeux/reveal-screen";
import { jeuxConfig } from "@/lib/jeux/config";
import {
  defaultJeuxProgress,
  JEUX_PROGRESS_KEY,
  useLocalStorageState,
} from "@/lib/jeux/use-local-storage";

type Stage =
  | "intro"
  | "maze"
  | "maze-done"
  | "shapes"
  | "shapes-done"
  | "puzzle"
  | "puzzle-done"
  | "transition"
  | "countdown-1"
  | "twist"
  | "countdown-2"
  | "reveal";

function stageFromProgress(progress: typeof defaultJeuxProgress): Stage {
  if (!progress.maze) return "intro";
  if (!progress.shapes) return "shapes";
  if (!progress.puzzle) return "puzzle";
  if (progress.revealed) return "reveal";
  return "transition";
}

export function GameExperience({
  publicEnabled,
  isAdminViewer,
  testGender,
  startAtReveal,
}: {
  publicEnabled: boolean;
  isAdminViewer?: boolean;
  testGender?: "girl" | "boy" | null;
  startAtReveal?: boolean;
}) {
  const showTestBadge = !publicEnabled || Boolean(isAdminViewer);
  const shouldRecordVote = publicEnabled && !isAdminViewer;
  const [progress, setProgress, hydrated] = useLocalStorageState(
    JEUX_PROGRESS_KEY,
    defaultJeuxProgress
  );
  const [stage, setStage] = useState<Stage | null>(startAtReveal ? "reveal" : null);

  // Aperçu admin (?apercu=reveal) : ne touche jamais à la progression
  // sauvegardée du joueur, seul l'affichage saute directement à la fin.
  const activeStage = startAtReveal
    ? "reveal"
    : (stage ?? (hydrated ? stageFromProgress(progress) : "intro"));

  const currentMissionIndex = useMemo(() => {
    if (["maze", "maze-done"].includes(activeStage)) return 0;
    if (["shapes", "shapes-done"].includes(activeStage)) return 1;
    if (["puzzle", "puzzle-done"].includes(activeStage)) return 2;
    return -1;
  }, [activeStage]);

  function restart() {
    setProgress(defaultJeuxProgress);
    setStage("intro");
  }

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-10">
      {showTestBadge && (
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <FlaskConical className="h-3 w-3" />
            {publicEnabled ? "VUE ADMIN (vote ignoré)" : "MODE TEST"}
          </Badge>
          {isAdminViewer && testGender && (
            <Badge
              className="animate-pulse gap-1 border-none"
              style={{
                backgroundColor: jeuxConfig.reveal[testGender].colorSoft,
                color: jeuxConfig.reveal[testGender].color,
              }}
            >
              {testGender === "girl" ? "💕 Fille" : "💙 Garçon"}
            </Badge>
          )}
        </div>
      )}

      {currentMissionIndex >= 0 && (
        <div className="mb-8">
          <ProgressionBar progress={progress} current={currentMissionIndex} />
        </div>
      )}

      {activeStage === "intro" && (
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="font-display text-3xl font-bold sm:text-4xl">{jeuxConfig.intro.title}</p>
          <p className="max-w-md text-muted-foreground">{jeuxConfig.intro.subtitle}</p>
          <Button size="lg" onClick={() => setStage("maze")}>
            {jeuxConfig.intro.startLabel}
          </Button>
        </div>
      )}

      {activeStage === "maze" && (
        <MazeGame
          onComplete={() => {
            setProgress((p) => ({ ...p, maze: true }));
            setStage("maze-done");
          }}
        />
      )}
      {activeStage === "maze-done" && (
        <MissionCompleteOverlay
          symbol={jeuxConfig.missions[0].symbol}
          successTitle={jeuxConfig.maze.successTitle}
          clueTitle={jeuxConfig.maze.clueTitle}
          onContinue={() => setStage("shapes")}
        />
      )}

      {activeStage === "shapes" && (
        <ShapesGame
          onComplete={() => {
            setProgress((p) => ({ ...p, shapes: true }));
            setStage("shapes-done");
          }}
        />
      )}
      {activeStage === "shapes-done" && (
        <MissionCompleteOverlay
          symbol={jeuxConfig.missions[1].symbol}
          successTitle={jeuxConfig.shapes.successTitle}
          clueTitle={jeuxConfig.shapes.clueTitle}
          onContinue={() => setStage("puzzle")}
        />
      )}

      {activeStage === "puzzle" && (
        <PuzzleGame
          onComplete={() => {
            setProgress((p) => ({ ...p, puzzle: true }));
            setStage("puzzle-done");
          }}
        />
      )}
      {activeStage === "puzzle-done" && (
        <MissionCompleteOverlay
          symbol={jeuxConfig.missions[2].symbol}
          successTitle={jeuxConfig.puzzle.successTitle}
          clueTitle={jeuxConfig.puzzle.clueTitle}
          onContinue={() => setStage("transition")}
        />
      )}

      {activeStage === "transition" && (
        <FinalTransition onContinue={() => setStage("countdown-1")} />
      )}
      {activeStage === "countdown-1" && (
        <CinematicCountdown onDone={() => setStage("twist")} />
      )}
      {activeStage === "twist" && (
        <TwistQuestion
          onAnswer={(choice) => {
            if (shouldRecordVote && !progress.voted) {
              setProgress((p) => ({ ...p, voted: true }));
              fetch("/api/gender-reveal/guess", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ guess: choice }),
              }).catch(() => {
                // Le vote est un bonus ludique : une erreur réseau ne doit
                // jamais bloquer la suite du jeu.
              });
            }
            setStage("countdown-2");
          }}
        />
      )}
      {activeStage === "countdown-2" && (
        <CinematicCountdown line={jeuxConfig.countdown.secondLine} onDone={() => setStage("reveal")} />
      )}
      {activeStage === "reveal" && (
        <RevealScreen
          onRestart={startAtReveal ? () => window.location.assign("/jeux") : restart}
          onRevealed={() => {
            if (!startAtReveal) setProgress((p) => ({ ...p, revealed: true }));
          }}
        />
      )}
    </div>
  );
}
