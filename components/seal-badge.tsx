// Badge décoratif en forme de sceau/étoile (contour ondulé), dans la couleur
// primaire du site, pour mettre en valeur une mention spéciale.

function sealPath(points: number, outerR: number, innerR: number, cx: number, cy: number) {
  const step = (Math.PI * 2) / points;
  let d = "";
  for (let i = 0; i < points; i++) {
    const angle1 = i * step - Math.PI / 2;
    const angle2 = angle1 + step / 2;
    const angle3 = angle1 + step;
    const outerX = cx + outerR * Math.cos(angle1);
    const outerY = cy + outerR * Math.sin(angle1);
    const midX = cx + innerR * Math.cos(angle2);
    const midY = cy + innerR * Math.sin(angle2);
    const outerX2 = cx + outerR * Math.cos(angle3);
    const outerY2 = cy + outerR * Math.sin(angle3);
    d += i === 0 ? `M ${outerX} ${outerY} ` : "";
    d += `Q ${midX} ${midY} ${outerX2} ${outerY2} `;
  }
  return d + "Z";
}

const SEAL_PATH = sealPath(12, 100, 80, 100, 100);

export function SealBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-primary drop-shadow-md">
        <path d={SEAL_PATH} fill="currentColor" />
      </svg>
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 p-8 text-center text-primary-foreground">
        {children}
      </div>
    </div>
  );
}
