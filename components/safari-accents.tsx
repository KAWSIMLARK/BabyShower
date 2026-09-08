// Motifs décoratifs (feuillages, animaux, montgolfière) inspirés de la palette
// et de l'esprit safari de l'invitation, dessinés en SVG original — pas une
// reproduction de l'illustration achetée, qui reste soumise à ses propres droits.

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
      {/* lavis (wash) doux sous le trait, pour un rendu aquarelle */}
      <g fill="currentColor" opacity="0.12">
        <ellipse cx="62" cy="26" rx="13" ry="16" />
        <path d="M52 40 Q56 90 42 132 Q55 148 68 132 Q76 90 72 40 Z" />
        <ellipse cx="55" cy="150" rx="27" ry="19" />
      </g>
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
        {/* tête */}
        <ellipse cx="62" cy="26" rx="12" ry="15" />
        <path d="M50 16 44 4M74 16 80 4" />
        <circle cx="45" cy="3" r="4" fill="currentColor" stroke="none" opacity="0.6" />
        <circle cx="79" cy="3" r="4" fill="currentColor" stroke="none" opacity="0.6" />
        <circle cx="57" cy="24" r="1.6" fill="currentColor" stroke="none" />
        <path d="M70 30 78 34" />
        <path d="M55 33 Q60 36 66 33" />
        {/* cou */}
        <path d="M53 40 40 130" />
        <path d="M71 40 78 130" />
        <path d="M58 60 52 100" strokeWidth="1.4" opacity="0.5" />
        {/* corps */}
        <ellipse cx="55" cy="150" rx="26" ry="18" />
        {/* crinière */}
        <path d="M71 40 Q78 60 74 90 Q80 100 76 130" strokeWidth="1.6" opacity="0.5" />
        {/* pattes */}
        <path d="M36 165 32 214M50 168 48 214M62 168 64 214M76 163 82 214" />
        <path d="M32 208 25 214M48 208 41 214M64 208 71 214M82 208 89 214" strokeWidth="1.6" />
        {/* queue */}
        <path d="M80 148 92 168 88 178" />
        <path d="M88 178 84 186 92 188 88 186" strokeWidth="1.4" />
        {/* taches */}
        {[
          [46, 100], [64, 112], [50, 60], [66, 70], [40, 150], [62, 155], [50, 130], [58, 78], [44, 118],
        ].map(([cx, cy], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx="5" ry="4" fill="currentColor" stroke="none" opacity="0.32" />
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
      <g fill="currentColor" opacity="0.12">
        <path d="M50 66C40 50 52 30 76 30C104 30 122 48 122 68C122 86 106 96 88 96H58C46 96 38 88 38 78C38 70 44 66 50 66Z" />
        <path d="M46 40C30 30 26 55 40 66C48 72 56 66 56 58" />
      </g>
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
        {/* oreille */}
        <path d="M46 40C30 30 26 55 40 66C48 72 56 66 56 58" />
        <path d="M42 44 Q38 54 46 60" strokeWidth="1.4" opacity="0.5" />
        {/* corps + tête */}
        <path d="M50 66C40 50 52 30 76 30C104 30 122 48 122 68C122 86 106 96 88 96H58C46 96 38 88 38 78C38 70 44 66 50 66Z" />
        {/* rides du dos */}
        <path d="M64 34 Q80 28 100 34M60 40 Q78 34 100 40" strokeWidth="1.2" opacity="0.4" />
        {/* trompe */}
        <path d="M50 78C40 82 34 92 40 100C44 106 52 104 52 98" />
        <path d="M46 84 Q42 90 46 96" strokeWidth="1.2" opacity="0.5" />
        {/* oeil + défense */}
        <circle cx="90" cy="52" r="1.8" fill="currentColor" stroke="none" />
        <path d="M108 60 118 64" />
        {/* pattes */}
        <path d="M62 96 60 112M80 96 80 112M96 96 96 112M110 92 112 110" />
        <path d="M56 110 66 112M74 110 86 112M90 110 102 112M106 108 116 110" strokeWidth="1.4" />
        {/* queue */}
        <path d="M122 70 132 78 130 88" />
      </g>
    </svg>
  );
}

export function AcaciaTree({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 180"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g fill="currentColor" opacity="0.14">
        <path d="M20 60 Q70 20 120 58 Q100 50 70 52 Q40 50 20 60Z" />
      </g>
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
        {/* tronc */}
        <path d="M68 180 70 100" />
        <path d="M70 130 58 108M70 118 84 100" strokeWidth="1.8" />
        {/* canopée en parasol, silhouette emblématique */}
        <path d="M70 100C40 100 14 88 10 66C24 76 44 78 60 72C40 66 26 54 22 38C40 52 62 58 78 56C64 46 56 32 56 18C68 34 82 44 96 46C90 34 90 22 96 10C98 28 108 40 122 44C118 56 104 66 84 68C100 74 116 74 128 66C120 86 96 100 70 100Z" />
        <path d="M40 66 Q60 62 74 68M56 40 Q74 44 88 50" strokeWidth="1.4" opacity="0.5" />
      </g>
    </svg>
  );
}

export function BirdFlock({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 60"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.55">
        <path d="M20 40 Q28 30 36 40 Q44 30 52 40" />
        <path d="M60 20 Q70 8 80 20 Q90 8 100 20" />
        <path d="M92 44 Q99 36 106 44 Q113 36 120 44" />
      </g>
    </svg>
  );
}

export function HotAirBalloon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 92"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M30 2C14 2 4 22 4 38C4 54 16 62 30 62C44 62 56 54 56 38C56 22 46 2 30 2Z"
        fill="currentColor"
        opacity="0.1"
      />
      <g stroke="currentColor" strokeWidth="2.2" opacity="0.6" strokeLinecap="round">
        <path d="M30 2C14 2 4 22 4 38C4 54 16 62 30 62C44 62 56 54 56 38C56 22 46 2 30 2Z" />
        {/* gores (quartiers) de la montgolfière */}
        <path d="M30 2V62M17 5C10 16 6 27 6 38C6 48 10 56 17 61M43 5C50 16 54 27 54 38C54 48 50 56 43 61" strokeWidth="1.4" opacity="0.5" />
        <path d="M30 62V72" />
        <path d="M18 72H42L37 88H23L18 72Z" />
        <path d="M30 62 18 72M30 62 42 72" strokeWidth="1.4" opacity="0.5" />
      </g>
    </svg>
  );
}
