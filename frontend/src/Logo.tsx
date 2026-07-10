export function Logo({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-lg"
    >
      {/* Gradient définition */}
      <defs>
        <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>

        {/* Filtre pour l'éclat */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Lettre "A" - Pyramide du savoir */}
      <g transform="translate(15, 35)">
        {/* Triangle principal */}
        <polygon
          points="20,0 40,50 0,50"
          fill="url(#aiGradient)"
          opacity="0.95"
        />
        {/* Barre horizontale au milieu (stylisation) */}
        <line
          x1="10"
          y1="30"
          x2="30"
          y2="30"
          stroke="white"
          strokeWidth="3"
          opacity="0.8"
        />
      </g>

      {/* Lettre "I" - Éclat lumineux */}
      <g transform="translate(55, 30)">
        {/* Barreau supérieur */}
        <rect x="5" y="0" width="10" height="8" fill="url(#aiGradient)" />

        {/* Barreau principal */}
        <rect x="5" y="12" width="10" height="38" fill="url(#aiGradient)" />

        {/* Barreau inférieur */}
        <rect x="5" y="52" width="10" height="8" fill="url(#aiGradient)" />

        {/* Éclats/sparkles autour du "I" */}
        <g filter="url(#glow)" opacity="0.9">
          {/* Éclat haut-gauche */}
          <circle cx="-8" cy="8" r="3" fill="#fbbf24" />
          {/* Éclat haut-droit */}
          <circle cx="28" cy="12" r="3.5" fill="#fbbf24" />
          {/* Éclat bas-gauche */}
          <circle cx="-5" cy="55" r="2.5" fill="#fbbf24" />
          {/* Éclat bas-droit */}
          <circle cx="26" cy="58" r="3" fill="#fbbf24" />
          {/* Éclat central droit (plus grand) */}
          <circle cx="30" cy="32" r="4" fill="#fbbf24" opacity="0.8" />
        </g>

        {/* Rayon de lumière autour */}
        <circle cx="10" cy="31" r="22" stroke="url(#aiGradient)" strokeWidth="1" opacity="0.3" />
      </g>

      {/* "Lesson" en texte petit sous le logo (optionnel, peut être commenté) */}
      <text
        x="60"
        y="115"
        fontSize="10"
        fontWeight="600"
        fill="url(#aiGradient)"
        textAnchor="middle"
        letterSpacing="1"
        opacity="0.8"
      >
        LESSON
      </text>
    </svg>
  );
}
