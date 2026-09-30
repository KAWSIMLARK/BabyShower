import { jeuxConfig } from "@/lib/jeux/config";
import type { JeuxProgress } from "@/lib/jeux/use-local-storage";

const keys: (keyof JeuxProgress)[] = ["maze", "shapes", "puzzle"];

export function ProgressionBar({ progress, current }: { progress: JeuxProgress; current: number }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {jeuxConfig.missions.map((mission, index) => {
        const done = progress[keys[index]];
        const active = index === current;
        return (
          <div key={mission.label} className="flex flex-col items-center gap-1">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg transition-colors ${
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : active
                    ? "border-primary bg-primary/10"
                    : "border-border bg-white/60"
              }`}
            >
              {mission.symbol}
            </div>
            <span className="max-w-[5.5rem] text-center text-[11px] leading-tight text-muted-foreground">
              {mission.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
