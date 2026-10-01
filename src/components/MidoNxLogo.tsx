import React from 'react';

interface MidoNxLogoProps {
  size?: number;
  className?: string;
}

export const MidoNxLogo: React.FC<MidoNxLogoProps> = ({
  size = 210,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer Crimson Atmospheric Aura (GPU-friendly radial gradient without heavy blur filter) */}
      <div
        className="absolute -inset-4 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(220,38,38,0.42) 0%, rgba(185,28,28,0.18) 52%, rgba(0,0,0,0) 74%)',
        }}
      />

      <svg
        viewBox="-16 -16 432 432"
        className="w-full h-full relative z-10 overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Dark Carbon Medallion Gradient */}
          <radialGradient id="obsidianBg" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#1E2028" />
            <stop offset="65%" stopColor="#0B0C10" />
            <stop offset="100%" stopColor="#040406" />
          </radialGradient>

          {/* Brushed Gunmetal / Silver Gradient for Crown & M */}
          <linearGradient id="gunmetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="28%" stopColor="#94A3B8" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="75%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          {/* Metallic Bevel Highlight */}
          <linearGradient id="silverFace" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>

          {/* Crimson Neon Gradient */}
          <linearGradient id="crimsonNeon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF2A2A" />
            <stop offset="50%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>
        </defs>

        {/* Outer Glowing Crimson Halo & Ring */}
        <circle
          cx="200"
          cy="200"
          r="186"
          fill="none"
          stroke="#EF4444"
          strokeWidth="12"
          strokeOpacity="0.24"
        />
        <circle
          cx="200"
          cy="200"
          r="182"
          fill="url(#obsidianBg)"
          stroke="#FF1E1E"
          strokeWidth="4.5"
        />

        {/* Inner Dark Metallic Bezel Ring */}
        <circle
          cx="200"
          cy="200"
          r="170"
          fill="none"
          stroke="url(#gunmetalGrad)"
          strokeWidth="6"
          opacity="0.85"
        />

        {/* Subtle Crimson Energy Cracks in Background */}
        <path
          d="M 55 170 L 95 185 L 125 165 M 285 130 L 335 150 L 350 135 M 75 265 L 125 245 M 285 275 L 330 255"
          stroke="#EF4444"
          strokeWidth="1.5"
          strokeOpacity="0.35"
          fill="none"
        />

        {/* 1. TOP METALLIC 3-PEAK CROWN */}
        <g transform="translate(0, 4)">
          {/* Red Underglow beneath Crown */}
          <path
            d="M 138 106 Q 200 92 262 106"
            stroke="#FF1E1E"
            strokeWidth="7"
            strokeOpacity="0.55"
            fill="none"
          />

          {/* Crown Main Body */}
          <path
            d="M 136 104 L 120 62 L 162 82 L 200 28 L 238 82 L 280 62 L 264 104 Q 200 90 136 104 Z"
            fill="url(#gunmetalGrad)"
            stroke="#E2E8F0"
            strokeWidth="2"
          />

          {/* Crown Center Red Diamond Gem */}
          <polygon
            points="200,52 211,72 200,90 189,72"
            fill="url(#crimsonNeon)"
            stroke="#FCA5A5"
            strokeWidth="1.5"
          />

          {/* Crown Side Gems */}
          <polygon points="154,78 160,88 152,94 146,85" fill="#DC2626" />
          <polygon points="246,78 254,85 248,94 240,88" fill="#DC2626" />
        </g>

        {/* 2. MASSIVE SHARP METALLIC "M" WITH RED RIM GLOW */}
        <g>
          {/* Red Back-Glow Behind M */}
          <path
            d="M 92 104 L 156 126 L 200 174 L 244 126 L 308 104 L 288 238 L 242 238 L 248 164 L 200 216 L 152 164 L 158 238 L 112 238 Z"
            fill="none"
            stroke="#FF1E1E"
            strokeWidth="9"
            strokeOpacity="0.42"
          />

          {/* Main 3D Beveled M */}
          <path
            d="M 94 104 L 158 126 L 200 174 L 242 126 L 306 104 L 286 238 L 240 238 L 246 162 L 200 214 L 154 162 L 160 238 L 114 238 Z"
            fill="url(#gunmetalGrad)"
            stroke="#F8FAFC"
            strokeWidth="2.2"
          />

          {/* Dynamic Crimson & Silver Swoosh Slash Across Right Leg of M */}
          <path
            d="M 162 230 Q 245 168 308 148 Q 325 144 304 176 Q 296 186 286 188 Q 302 165 288 164 Q 235 178 162 230 Z"
            fill="url(#crimsonNeon)"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
        </g>

        {/* 3. "MIDO" METALLIC SILVER TEXT */}
        <text
          x="200"
          y="292"
          textAnchor="middle"
          fill="url(#silverFace)"
          stroke="#0F172A"
          strokeWidth="2"
          style={{
            fontFamily: '"Chakra Petch", sans-serif',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: '58px',
            letterSpacing: '4px',
          }}
        >
          MIDO
        </text>

        {/* 4. "NX" CRIMSON SLASH TEXT + SIDE LASER LINES */}
        <line
          x1="88"
          y1="335"
          x2="144"
          y2="335"
          stroke="#FF1E1E"
          strokeWidth="3.5"
        />
        <line
          x1="256"
          y1="335"
          x2="312"
          y2="335"
          stroke="#FF1E1E"
          strokeWidth="3.5"
        />

        <text
          x="200"
          y="356"
          textAnchor="middle"
          fill="url(#crimsonNeon)"
          stroke="#FCA5A5"
          strokeWidth="0.8"
          style={{
            fontFamily: '"Chakra Petch", sans-serif',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: '64px',
            letterSpacing: '3px',
          }}
        >
          NX
        </text>
      </svg>
    </div>
  );
};
