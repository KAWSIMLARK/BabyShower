// Motifs décoratifs simples (feuillages, pois) inspirés de la palette safari,
// dessinés en SVG plutôt que reproduits depuis une illustration existante.

export function LeafBranch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M60 200V40"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} opacity={0.35 + i * 0.1}>
          <ellipse
            cx={60 - 22}
            cy={170 - i * 32}
            rx="20"
            ry="11"
            transform={`rotate(-30 ${60 - 22} ${170 - i * 32})`}
            fill="currentColor"
          />
          <ellipse
            cx={60 + 22}
            cy={155 - i * 32}
            rx="20"
            ry="11"
            transform={`rotate(30 ${60 + 22} ${155 - i * 32})`}
            fill="currentColor"
          />
        </g>
      ))}
      <circle cx="60" cy="34" r="8" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function DotCluster({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="5" fill="currentColor" opacity="0.5" />
      <circle cx="45" cy="10" r="3" fill="currentColor" opacity="0.35" />
      <circle cx="70" cy="30" r="6" fill="currentColor" opacity="0.4" />
      <circle cx="15" cy="55" r="4" fill="currentColor" opacity="0.3" />
      <circle cx="55" cy="60" r="3.5" fill="currentColor" opacity="0.45" />
      <circle cx="85" cy="70" r="5" fill="currentColor" opacity="0.35" />
      <circle cx="30" cy="85" r="4.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function Giraffe({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 220"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55">
        {/* tête */}
        <ellipse cx="62" cy="26" rx="12" ry="15" />
        <path d="M50 16 44 4M74 16 80 4" />
        <circle cx="45" cy="3" r="4" fill="currentColor" stroke="none" opacity="0.6" />
        <circle cx="79" cy="3" r="4" fill="currentColor" stroke="none" opacity="0.6" />
        <circle cx="57" cy="24" r="1.6" fill="currentColor" stroke="none" />
        <path d="M70 30 78 34" />
        {/* cou */}
        <path d="M53 40 40 130" />
        <path d="M71 40 78 130" />
        {/* corps */}
        <ellipse cx="55" cy="150" rx="26" ry="18" />
        {/* pattes */}
        <path d="M36 165 32 214M50 168 48 214M62 168 64 214M76 163 82 214" />
        {/* queue */}
        <path d="M80 148 92 168 88 178" />
        {/* taches */}
        {[
          [46, 100], [64, 112], [50, 60], [66, 70], [40, 150], [62, 155], [50, 130],
        ].map(([cx, cy], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx="5" ry="4" fill="currentColor" stroke="none" opacity="0.35" />
        ))}
      </g>
    </svg>
  );
}

export function Elephant({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55">
        {/* oreille */}
        <path d="M46 40C30 30 26 55 40 66C48 72 56 66 56 58" />
        {/* corps + tête */}
        <path d="M50 66C40 50 52 30 76 30C104 30 122 48 122 68C122 86 106 96 88 96H58C46 96 38 88 38 78C38 70 44 66 50 66Z" />
        {/* trompe */}
        <path d="M50 78C40 82 34 92 40 100C44 106 52 104 52 98" />
        {/* oeil + défense */}
        <circle cx="90" cy="52" r="1.8" fill="currentColor" stroke="none" />
        <path d="M108 60 118 64" />
        {/* pattes */}
        <path d="M62 96 60 112M80 96 80 112M96 96 96 112M110 92 112 110" />
        {/* queue */}
        <path d="M122 70 132 78 130 88" />
      </g>
    </svg>
  );
}

export function HotAirBalloon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 90"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M30 2C14 2 4 22 4 38C4 54 16 62 30 62C44 62 56 54 56 38C56 22 46 2 30 2Z"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.55"
      />
      <path d="M30 62V70" stroke="currentColor" strokeWidth="2" opacity="0.55" />
      <path
        d="M20 70H40L36 84H24L20 70Z"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.55"
      />
    </svg>
  );
}
