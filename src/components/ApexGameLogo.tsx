import React, { useId } from 'react';

interface OfficialGameCoverIconProps {
  size?: number;
  className?: string;
}

/**
 * Official "Apex Hill RACING" Circular Emblem & Game Logo
 * Matches the attached reference artwork 100%:
 * - Circular neon-gold & electric-cyan outer ring
 * - Rainy twilight mountain valley, full moon, storm clouds & stylized pine trees
 * - Metallic highway guardrail with green grass tufts & wet reflective dark-grey asphalt
 * - Red 4x4 Trailblazer HD with 6-spoke gold rims, red coil springs, roof rack + 3 round floodlights,
 *   black A-pillar snorkel, rear spare tire, transparent cabin windows with driver, and glowing headlights
 * - 3D brushed-chrome "Apex Hill" & fiery brush-script "RACING" title over chevron wings
 */
export const OfficialGameCoverIcon: React.FC<OfficialGameCoverIconProps> = ({
  size = 220,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');

  const renderWheel = (cx: number, cy: number) => {
    const lugAngles = [0, 60, 120, 180, 240, 300];
    const treadCount = 18;
    const treads = Array.from({ length: treadCount }, (_, i) => (i * 360) / treadCount);

    return (
      <g transform={`translate(${cx}, ${cy})`}>
        {/* 3D Rear Tire Depth Offset */}
        <circle cx="-3" cy="2" r="44" fill="#04070E" />

        {/* Aggressive Outer Knobby Mud-Terrain Treads */}
        {treads.map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <rect
              x="-5.5"
              y="-47.5"
              width="11"
              height="7.5"
              rx="2"
              fill="#111827"
              stroke="#030712"
              strokeWidth="1"
            />
            <rect x="-3.5" y="-46.5" width="7" height="2.5" rx="1" fill="#374151" />
          </g>
        ))}

        {/* Main Tire Sidewall */}
        <circle
          cx="0"
          cy="0"
          r="41.5"
          fill={`url(#${uid}-tireSidewall)`}
          stroke="#090D16"
          strokeWidth="2.5"
        />

        {/* Sidewall Shoulder Lug Blocks */}
        {treads.map((deg) => (
          <g key={`side-${deg}`} transform={`rotate(${deg + 10})`}>
            <rect x="-3" y="-39" width="6" height="5.5" rx="1" fill="#1F2937" />
          </g>
        ))}

        {/* Tire Inner Bead Ring */}
        <circle
          cx="0"
          cy="0"
          r="31"
          fill="#090D16"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Golden Alloy Deep-Dish Outer Barrel */}
        <circle
          cx="0"
          cy="0"
          r="28.5"
          fill={`url(#${uid}-goldRimGrad)`}
          stroke="#78350F"
          strokeWidth="1.5"
        />

        {/* Dark Inner Wheel Well & Brake Rotor */}
        <circle cx="0" cy="0" r="23" fill="#0B111E" />
        <circle
          cx="0"
          cy="0"
          r="16.5"
          fill="none"
          stroke="#475569"
          strokeWidth="3.5"
          strokeDasharray="6 3"
        />
        {/* Red Brake Caliper */}
        <path
          d="M -15,-9 A 17,17 0 0,1 -5,-17 L -3,-11 A 11,11 0 0,0 -10,-5 Z"
          fill="#DC2626"
        />

        {/* 6-Spoke Golden Alloy Wheel Star (جنوط ذهبية سداسية الأضلاع) */}
        {lugAngles.map((deg) => (
          <g key={`spoke-${deg}`} transform={`rotate(${deg})`}>
            <polygon
              points="-4.5,-6 -3.2,-26.5 3.2,-26.5 4.5,-6"
              fill={`url(#${uid}-goldSpokeGrad)`}
              stroke="#92400E"
              strokeWidth="0.9"
            />
            <rect x="-1.4" y="-24" width="2.8" height="16" rx="1" fill="#FEF08A" opacity="0.55" />
          </g>
        ))}

        {/* Golden Rim Lip Highlight */}
        <circle
          cx="0"
          cy="0"
          r="27"
          fill="none"
          stroke="#FEF08A"
          strokeWidth="1.4"
          opacity="0.8"
        />

        {/* Center Hub Cap */}
        <circle
          cx="0"
          cy="0"
          r="8.5"
          fill={`url(#${uid}-goldRimGrad)`}
          stroke="#78350F"
          strokeWidth="1.2"
        />
        <circle cx="0" cy="0" r="5" fill="#1E293B" stroke="#F59E0B" strokeWidth="1" />
      </g>
    );
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Ambient Outer Neon Gold & Electric Blue Halo (GPU-friendly radial gradient) */}
      <div
        className="absolute -inset-3 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(245,158,11,0.42) 0%, rgba(14,165,233,0.34) 55%, rgba(0,0,0,0) 75%)',
        }}
      />

      <svg
        viewBox="-26 -24 552 566"
        className="w-full h-full relative z-10 overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Circular Scene Clip */}
          <clipPath id={`${uid}-circleClip`}>
            <circle cx="250" cy="246" r="218" />
          </clipPath>

          {/* Outer Neon Gold-to-Blue Ring Gradient */}
          <linearGradient id={`${uid}-outerRingGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="22%" stopColor="#FEF08A" />
            <stop offset="46%" stopColor="#00F0FF" />
            <stop offset="72%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>

          <linearGradient id={`${uid}-innerRingGrad`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="35%" stopColor="#FDE047" />
            <stop offset="70%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#00F0FF" />
          </linearGradient>

          {/* Twilight Rainy Sky Gradient */}
          <linearGradient id={`${uid}-skyGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#031124" />
            <stop offset="38%" stopColor="#072F4F" />
            <stop offset="75%" stopColor="#0E5E6F" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>

          {/* Metallic Guardrail W-Beam Gradient */}
          <linearGradient id={`${uid}-guardrailGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="25%" stopColor="#94A3B8" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="78%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Wet Dark Grey Asphalt Gradient */}
          <linearGradient id={`${uid}-asphaltGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="35%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Classic Red 4x4 Metallic Paint */}
          <linearGradient id={`${uid}-redBodyGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF4D4D" />
            <stop offset="22%" stopColor="#EF4444" />
            <stop offset="68%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>

          {/* Tire & Golden 6-Spoke Rim Gradients */}
          <radialGradient id={`${uid}-tireSidewall`} cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#1F2937" />
            <stop offset="88%" stopColor="#111827" />
            <stop offset="100%" stopColor="#030712" />
          </radialGradient>

          <linearGradient id={`${uid}-goldRimGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="85%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#FDE047" />
          </linearGradient>

          <linearGradient id={`${uid}-goldSpokeGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* Headlight Volumetric Cone Gradient */}
          <linearGradient id={`${uid}-headlightCone`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FEF9C3" stopOpacity="0.92" />
            <stop offset="40%" stopColor="#FEF08A" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
          </linearGradient>

          {/* 3D Brushed Chrome "Apex Hill" Text Gradient */}
          <linearGradient id={`${uid}-chromeTextGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="42%" stopColor="#E2E8F0" />
            <stop offset="54%" stopColor="#64748B" />
            <stop offset="85%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          {/* Fiery Yellow-Orange-Red "RACING" Text Gradient */}
          <linearGradient id={`${uid}-fireTextGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="38%" stopColor="#FACC15" />
            <stop offset="72%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>

          <filter id={`${uid}-softGlow`} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ================= 1. CLIPPED CIRCULAR SCENE ================= */}
        <g clipPath={`url(#${uid}-circleClip)`}>
          {/* Sky Backdrop */}
          <rect x="20" y="20" width="460" height="460" fill={`url(#${uid}-skyGrad)`} />

          {/* Pale Yellow Full Moon behind Right Mountain */}
          <circle
            cx="366"
            cy="118"
            r="34"
            fill="#E2F1A0"
            opacity="0.9"
            filter={`url(#${uid}-softGlow)`}
          />

          {/* Layered Storm Clouds in Upper Sky */}
          <g fill="#475569" opacity="0.58">
            <circle cx="110" cy="112" r="36" />
            <circle cx="152" cy="108" r="44" />
            <circle cx="195" cy="122" r="32" />
            <circle cx="72" cy="130" r="28" />
            <circle cx="385" cy="145" r="34" />
            <circle cx="425" cy="138" r="38" />
          </g>
          <g fill="#334155" opacity="0.72">
            <ellipse cx="140" cy="134" rx="86" ry="22" />
            <ellipse cx="395" cy="158" rx="68" ry="18" />
          </g>

          {/* Distant Teal-Blue Alpine Mountain Peaks */}
          <polygon
            points="25,255 108,162 188,255"
            fill="#0A364E"
            stroke="#1E5670"
            strokeWidth="1.5"
          />
          <polygon
            points="135,255 245,148 335,255"
            fill="#0D445E"
          />
          <polygon
            points="255,255 344,104 445,255"
            fill="#0F4C68"
            stroke="#38BDF8"
            strokeWidth="1.2"
            strokeOpacity="0.45"
          />
          {/* Mountain Ridge Highlight Facets */}
          <polygon points="344,104 368,255 445,255" fill="#083346" opacity="0.65" />

          {/* Midground Lush Green Mountain Foothills (100% Tree-Free Unobstructed Vista) */}
          <path
            d="M 20,255 Q 110,205 220,232 T 480,218 L 480,295 L 20,295 Z"
            fill="#14532D"
          />

          {/* Left Brown Faceted Rock Cliff & Wooden Fence (matching reference image!) */}
          <g>
            {/* Wooden Fence on Cliff Top */}
            <rect x="64" y="182" width="8" height="32" rx="1" fill="#78350F" />
            <rect x="114" y="186" width="8" height="28" rx="1" fill="#78350F" />
            <rect x="25" y="190" width="98" height="6" fill="#92400E" />
            <rect x="25" y="200" width="98" height="6" fill="#78350F" />
            {/* Faceted Rock Bank */}
            <polygon
              points="20,208 95,212 146,232 152,276 20,276"
              fill="#573B26"
            />
            <polygon points="20,208 75,222 62,272 20,272" fill="#784F33" />
            <polygon points="75,222 128,228 115,274 62,272" fill="#432C1C" />
          </g>

          {/* ================= 2. METAL HIGHWAY GUARDRAIL & GRASS ================= */}
          {/* Bright Green Grass Strip Behind & Under Guardrail */}
          <rect x="20" y="266" width="460" height="24" fill="#16A34A" />
          {/* Guardrail Vertical Support Posts */}
          {[55, 118, 182, 268, 345, 415, 465].map((px) => (
            <g key={px}>
              <rect x={px - 5} y="254" width="10" height="34" fill="#78350F" stroke="#451A03" strokeWidth="1" />
            </g>
          ))}
          {/* Horizontal Corrugated W-Beam Metal Guardrail */}
          <rect
            x="20"
            y="249"
            width="460"
            height="21"
            fill={`url(#${uid}-guardrailGrad)`}
            stroke="#334155"
            strokeWidth="1.2"
          />
          <line x1="20" y1="259.5" x2="480" y2="259.5" stroke="#334155" strokeWidth="2.2" />
          <line x1="20" y1="251.5" x2="480" y2="251.5" stroke="#F8FAFC" strokeWidth="1.2" opacity="0.65" />

          {/* Grass Blades Along Road Shoulder */}
          <path
            d="M 28,286 L 32,274 L 36,286 M 52,286 L 55,272 L 60,286 M 84,286 L 88,275 L 92,286 M 112,286 L 116,273 L 120,286 M 242,286 L 246,274 L 250,286 M 280,286 L 284,275 L 288,286 M 388,286 L 392,273 L 396,286 M 422,286 L 426,274 L 430,286"
            stroke="#4ADE80"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />

          {/* ================= 3. WET DARK-GREY ASPHALT ROAD & REFLECTIONS ================= */}
          <rect x="20" y="284" width="460" height="190" fill={`url(#${uid}-asphaltGrad)`} />
          {/* Road Shoulder Curb Line */}
          <line x1="20" y1="285" x2="480" y2="285" stroke="#94A3B8" strokeWidth="2" opacity="0.65" />

          {/* Wet Asphalt Mirror Reflections of Golden Wheels, Lights & Cyan Sky */}
          <ellipse cx="174" cy="316" rx="48" ry="11" fill="#F59E0B" opacity="0.35" filter={`url(#${uid}-softGlow)`} />
          <ellipse cx="326" cy="316" rx="48" ry="11" fill="#F59E0B" opacity="0.35" filter={`url(#${uid}-softGlow)`} />
          <ellipse cx="250" cy="306" rx="95" ry="9" fill="#020617" opacity="0.82" />
          <ellipse cx="242" cy="322" rx="70" ry="8" fill="#38BDF8" opacity="0.35" filter={`url(#${uid}-softGlow)`} />
          <ellipse cx="395" cy="304" rx="55" ry="10" fill="#FEF08A" opacity="0.42" filter={`url(#${uid}-softGlow)`} />

          {/* Wet Puddle Shimmer Ripples on Asphalt */}
          <g stroke="#BAE6FD" strokeWidth="1.3" opacity="0.55" fill="none">
            <line x1="45" y1="302" x2="115" y2="302" />
            <line x1="68" y1="312" x2="142" y2="312" />
            <line x1="210" y1="315" x2="290" y2="315" />
            <line x1="355" y1="308" x2="442" y2="308" />
            <ellipse cx="174" cy="296" rx="46" ry="4.5" />
            <ellipse cx="326" cy="296" rx="46" ry="4.5" />
          </g>

          {/* ================= 4. HERO RED 4x4 TRAILBLAZER HD ================= */}
          <g transform="translate(0, 2)">
            {/* Volumetric Front Headlight Beam Cone */}
            <polygon
              points="376,192 485,158 485,256 376,214"
              fill={`url(#${uid}-headlightCone)`}
            />
            {/* Roof Floodlights Beam Glow */}
            <polygon
              points="272,126 425,95 425,165 272,140"
              fill={`url(#${uid}-headlightCone)`}
              opacity="0.55"
            />

            {/* Rear-Mounted Chunky Spare Tire on Left Tailgate */}
            <g transform="translate(128, 178)">
              <rect
                x="-16"
                y="-28"
                width="26"
                height="56"
                rx="7"
                fill="#111827"
                stroke="#030712"
                strokeWidth="2"
              />
              {/* Tire Treads on Spare */}
              {[-22, -14, -6, 2, 10, 18].map((ty) => (
                <rect key={ty} x="-18" y={ty} width="10" height="5" rx="1" fill="#1F2937" />
              ))}
              <rect x="-12" y="-8" width="22" height="16" rx="2" fill="#334155" />
            </g>

            {/* Undercarriage Heavy-Duty Differential Axle Truss & Chassis Frame */}
            <path
              d="M 162,226 L 338,226 L 326,242 L 174,242 Z"
              fill="#0F172A"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <rect x="228" y="232" width="44" height="12" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
            <circle cx="222" cy="238" r="5" fill="#090D16" stroke="#64748B" strokeWidth="1.5" />
            <circle cx="278" cy="238" r="5" fill="#090D16" stroke="#64748B" strokeWidth="1.5" />

            {/* Dark Wheel-Well Arch Cavities */}
            <path d="M 128,232 A 48,48 0 0,1 220,232 Z" fill="#04070E" />
            <path d="M 280,232 A 48,48 0 0,1 372,232 Z" fill="#04070E" />

            {/* RED SUSPENSION COILOVER SPRINGS (مساعدين رياضية حمراء وواضحة) */}
            {[
              { x: 174, rot: -10 },
              { x: 322, rot: 8 },
            ].map((sp, idx) => (
              <g key={idx} transform={`translate(${sp.x}, 208) rotate(${sp.rot})`}>
                {/* Inner Chrome Damper Rod */}
                <rect x="-3.5" y="-22" width="7" height="44" fill="#94A3B8" stroke="#0F172A" strokeWidth="1" />
                {/* Red Helical Spring Coils */}
                {[-16, -10, -4, 2, 8, 14].map((cy) => (
                  <rect
                    key={cy}
                    x="-8.5"
                    y={cy}
                    width="17"
                    height="4.2"
                    rx="2"
                    fill="#EF4444"
                    stroke="#7F1D1D"
                    strokeWidth="0.9"
                  />
                ))}
              </g>
            ))}

            {/* Rear External Roll-Cage Diagonal Bars (Behind Rear Cabin) */}
            <path
              d="M 145,175 L 166,134 L 180,134 L 160,175 Z"
              fill="#1E293B"
              stroke="#F59E0B"
              strokeWidth="1.2"
            />

            {/* Main Classic Red 4x4 SUV Body Shell */}
            <path
              d="M 134,218 L 134,174 L 154,172 L 168,132 L 280,132 L 306,174 L 368,180 C 374,181 377,185 377,192 L 377,218 L 358,222 L 346,192 L 298,192 L 284,224 L 216,224 L 202,192 L 154,192 L 142,222 Z"
              fill={`url(#${uid}-redBodyGrad)`}
              stroke="#450A0A"
              strokeWidth="2.2"
            />

            {/* Roof Specular Highlight Only (No yellow side stripe) */}
            <line
              x1="170"
              y1="135"
              x2="278"
              y2="135"
              stroke="#FCA5A5"
              strokeWidth="2"
              opacity="0.8"
            />

            {/* Sculpted Black Fender Flares & Side Rocker Step Bar */}
            <path
              d="M 136,222 L 150,188 L 205,188 L 219,224 L 209,224 L 198,196 L 156,196 L 145,222 Z"
              fill="#111827"
              stroke="#334155"
              strokeWidth="1"
            />
            <path
              d="M 281,224 L 295,188 L 350,188 L 364,222 L 354,222 L 344,196 L 302,196 L 291,224 Z"
              fill="#111827"
              stroke="#334155"
              strokeWidth="1"
            />
            {/* Side Step Running Board */}
            <rect
              x="215"
              y="220"
              width="68"
              height="7"
              rx="2"
              fill="#0F172A"
              stroke="#475569"
              strokeWidth="1.2"
            />

            {/* Rear Window (Tinted Transparent Glass) */}
            <path
              d="M 173,139 L 222,139 L 222,171 L 163,171 Z"
              fill="#0F172A"
              fillOpacity="0.82"
              stroke="#020617"
              strokeWidth="2.2"
            />
            <path
              d="M 176,141 L 206,141 L 192,169 L 166,169 Z"
              fill="#BAE6FD"
              fillOpacity="0.22"
            />

            {/* Front Driver Window (Transparent Glass Showing Driver & Orange-Tan Seat) */}
            <g>
              <path
                d="M 232,139 L 275,139 L 296,171 L 232,171 Z"
                fill="#091526"
                fillOpacity="0.78"
                stroke="#020617"
                strokeWidth="2.2"
              />
              {/* Tan/Orange Racing Bucket Seat & Driver Silhouette Inside Cabin */}
              <rect x="236" y="149" width="11" height="20" rx="3" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />
              <circle cx="249" cy="151" r="6.5" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
              <path d="M 244,158 L 262,163 L 256,170 L 240,170 Z" fill="#1E293B" />
              {/* Steering Wheel */}
              <line x1="276" y1="160" x2="285" y2="170" stroke="#0F172A" strokeWidth="3" />
              <ellipse cx="275" cy="159" rx="3" ry="7" transform="rotate(-22 275 159)" fill="none" stroke="#334155" strokeWidth="2.2" />
              {/* Glass Specular Reflection */}
              <polygon points="242,141 268,141 284,169 266,169" fill="#BAE6FD" fillOpacity="0.24" />
            </g>

            {/* Sculpted Door Seam, Golden-Orange Door Handle & Side Wing Mirror */}
            <rect
              x="229"
              y="137"
              width="69"
              height="79"
              rx="3"
              fill="none"
              stroke="#450A0A"
              strokeWidth="1.8"
            />
            {/* Golden Door Handle */}
            <rect
              x="234"
              y="180"
              width="14"
              height="5.5"
              rx="2"
              fill="#F59E0B"
              stroke="#020617"
              strokeWidth="1.2"
            />
            {/* Black Side Mirror */}
            <rect
              x="286"
              y="157"
              width="10"
              height="13"
              rx="2.5"
              fill="#0F172A"
              stroke="#334155"
              strokeWidth="1.2"
            />

            {/* BLACK TUBULAR ROOF RACK + 3 GLOWING ROUND FLOODLIGHTS (السلة العلوية والكشافات الدائرية) */}
            <g>
              {/* Roof Rack Basket Frame */}
              <rect x="172" y="120" width="96" height="6" rx="2" fill="#0F172A" stroke="#334155" strokeWidth="1" />
              <line x1="176" y1="126" x2="174" y2="132" stroke="#0F172A" strokeWidth="4" />
              <line x1="205" y1="126" x2="205" y2="132" stroke="#0F172A" strokeWidth="4" />
              <line x1="236" y1="126" x2="236" y2="132" stroke="#0F172A" strokeWidth="4" />
              <line x1="262" y1="126" x2="262" y2="132" stroke="#0F172A" strokeWidth="4" />
              {/* 3 Round Glowing Floodlights on Front of Roof Rack */}
              {[260, 270, 280].map((lx, i) => (
                <g key={i} transform={`translate(${lx}, 123)`}>
                  <ellipse cx="-2" cy="0" rx="5.5" ry="7.5" fill="#0F172A" stroke="#475569" strokeWidth="1" />
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="4.2"
                    ry="6.2"
                    fill="#FEF08A"
                    stroke="#F59E0B"
                    strokeWidth="1.2"
                    filter={`url(#${uid}-softGlow)`}
                  />
                  <ellipse cx="0.8" cy="0" rx="2.2" ry="3.8" fill="#FFFFFF" />
                </g>
              ))}
            </g>

            {/* BLACK A-PILLAR SAFARI SNORKEL (أنبوب سحب الهواء الأسود) */}
            <g>
              <path
                d="M 294,126 L 303,126 C 306,126 307,128 306,132 L 298,132 L 315,172 L 336,176 L 336,182 L 309,179 L 289,131 C 288,128 290,126 294,126 Z"
                fill="#0F172A"
                stroke="#334155"
                strokeWidth="1.3"
              />
              {/* Snorkel Air Intake Grille */}
              <rect x="302" y="126.5" width="4" height="5.5" rx="1" fill="#F59E0B" />
            </g>

            {/* Front Glowing Round Headlight, Amber Turn Signal & Heavy Steel Bumper */}
            <g>
              {/* Headlight Bezel */}
              <rect
                x="365"
                y="184"
                width="13"
                height="24"
                rx="3"
                fill="#1E293B"
                stroke="#475569"
                strokeWidth="1.2"
              />
              {/* Glowing Round/Oval Headlight Lens */}
              <ellipse
                cx="374"
                cy="196"
                rx="4.5"
                ry="8.5"
                fill="#FEF9C3"
                stroke="#F59E0B"
                strokeWidth="1.5"
                filter={`url(#${uid}-softGlow)`}
              />
              <ellipse cx="375" cy="196" rx="2.5" ry="5.5" fill="#FFFFFF" />
              {/* Front Steel Off-Road Bumper */}
              <rect
                x="358"
                y="211"
                width="24"
                height="13"
                rx="3"
                fill="#1E293B"
                stroke="#475569"
                strokeWidth="1.4"
              />
              <circle cx="374" cy="217.5" r="3" fill="#F97316" />
              {/* Rear Bumper & Taillight */}
              <rect x="128" y="211" width="18" height="11" rx="2.5" fill="#0F172A" stroke="#334155" strokeWidth="1" />
              <rect x="133" y="182" width="4.5" height="16" rx="1.5" fill="#EA580C" stroke="#7F1D1D" strokeWidth="1" />
            </g>

            {/* Rear & Front Massive Knobby Tires with 6-Spoke Golden Rims */}
            {renderWheel(174, 248)}
            {renderWheel(326, 248)}
          </g>

          {/* Diagonal Falling Rain Streaks Across Scene */}
          <g stroke="#BAE6FD" strokeWidth="1.5" strokeLinecap="round" opacity="0.45">
            <line x1="95" y1="55" x2="82" y2="85" />
            <line x1="165" y1="45" x2="152" y2="78" />
            <line x1="238" y1="52" x2="225" y2="84" />
            <line x1="312" y1="62" x2="298" y2="95" />
            <line x1="395" y1="75" x2="382" y2="108" />
            <line x1="68" y1="145" x2="55" y2="178" />
            <line x1="142" y1="152" x2="128" y2="184" />
            <line x1="428" y1="168" x2="415" y2="200" />
          </g>
        </g>

        {/* ================= 5. CIRCULAR NEON GOLD & ELECTRIC BLUE OUTER RING ================= */}
        <circle
          cx="250"
          cy="246"
          r="226"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="12"
          strokeOpacity="0.22"
        />
        <circle
          cx="250"
          cy="246"
          r="222"
          fill="none"
          stroke="#020617"
          strokeWidth="12"
        />
        <circle
          cx="250"
          cy="246"
          r="222"
          fill="none"
          stroke={`url(#${uid}-outerRingGrad)`}
          strokeWidth="7.5"
        />
        <circle
          cx="250"
          cy="246"
          r="214"
          fill="none"
          stroke={`url(#${uid}-innerRingGrad)`}
          strokeWidth="3"
          opacity="0.9"
        />
        {/* Specular Ring Flares (Top-Left & Bottom — Unclipped!) */}
        <ellipse
          cx="196"
          cy="31"
          rx="22"
          ry="4.5"
          transform="rotate(-14 196 31)"
          fill="#FFFFFF"
          opacity="0.95"
        />
        <ellipse
          cx="250"
          cy="468"
          rx="24"
          ry="4.5"
          fill="#FFFFFF"
          opacity="0.95"
        />

        {/* ================= 6. "APEX HILL RACING" 3D METALLIC & FIRE SHIELD EMBLEM (100% Unclipped Bottom!) ================= */}
        <g transform="translate(0, -10)">
          {/* Angular Shield Backing Plate */}
          <polygon
            points="72,334 428,314 405,424 250,456 95,424"
            fill="#030712"
            stroke="#0284C7"
            strokeWidth="3.5"
          />
          <polygon
            points="84,340 416,322 396,418 250,446 104,418"
            fill="#090D16"
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeOpacity="0.65"
          />

          {/* Left & Right Glowing Tire-Tread Chevron Wings (>>> and <<<) */}
          <g transform="translate(94, 382) rotate(-8)">
            {[0, 14, 28, 42].map((dx, i) => (
              <polygon
                key={i}
                points={`${dx},-10 ${dx + 10},-10 ${dx + 16},0 ${dx + 10},10 ${dx},10 ${dx + 6},0`}
                fill={i < 2 ? '#F59E0B' : '#00F0FF'}
              />
            ))}
          </g>
          <g transform="translate(356, 370) rotate(-8)">
            {[0, 14, 28, 42].map((dx, i) => (
              <polygon
                key={i}
                points={`${dx},-10 ${dx + 10},-10 ${dx + 16},0 ${dx + 10},10 ${dx},10 ${dx + 6},0`}
                fill={i < 2 ? '#FACC15' : '#F97316'}
              />
            ))}
          </g>

          {/* 3D Extruded Dark Bevel Behind "Apex Hill" */}
          <g transform="translate(252, 364) rotate(-5) skewX(-10)">
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fill="#020617"
              stroke="#020617"
              strokeWidth="10"
              strokeLinejoin="round"
              style={{
                fontFamily: '"Chakra Petch", sans-serif',
                fontWeight: 900,
                fontSize: '54px',
                letterSpacing: '1px',
              }}
            >
              Apex Hill
            </text>
            {/* Brushed Chrome Metallic "Apex Hill" */}
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fill={`url(#${uid}-chromeTextGrad)`}
              stroke="#F8FAFC"
              strokeWidth="1.5"
              style={{
                fontFamily: '"Chakra Petch", sans-serif',
                fontWeight: 900,
                fontSize: '54px',
                letterSpacing: '1px',
              }}
            >
              Apex Hill
            </text>
          </g>

          {/* Fiery Brush-Script "RACING" Overlapping Bottom (100% Unclipped!) */}
          <g transform="translate(254, 418) rotate(-6) skewX(-12)">
            <text
              x="0"
              y="5"
              textAnchor="middle"
              fill="#020617"
              stroke="#020617"
              strokeWidth="11"
              strokeLinejoin="round"
              style={{
                fontFamily: '"Chakra Petch", sans-serif',
                fontWeight: 900,
                fontStyle: 'italic',
                fontSize: '58px',
                letterSpacing: '3px',
              }}
            >
              RACING
            </text>
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fill={`url(#${uid}-fireTextGrad)`}
              stroke="#FEF08A"
              strokeWidth="1.4"
              style={{
                fontFamily: '"Chakra Petch", sans-serif',
                fontWeight: 900,
                fontStyle: 'italic',
                fontSize: '58px',
                letterSpacing: '3px',
              }}
            >
              RACING
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};

interface ApexGameLogoProps {
  className?: string;
}

/**
 * Splash Screen 2 ("الشعار الثاني في شاشة البداية"):
 * Displays the complete attached "APEX HILL RACING" circular emblem prominently without any bottom clipping.
 */
export const ApexGameLogo: React.FC<ApexGameLogoProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative flex flex-row items-center justify-center gap-5 sm:gap-8 md:gap-10 py-4 pb-6 px-3 overflow-visible select-none ${className}`}
    >
      {/* Full-Size Unclipped Official "APEX HILL RACING" Circular Emblem */}
      <div className="shrink-0 flex items-center justify-center overflow-visible p-2">
        <OfficialGameCoverIcon
          size={205}
          className="w-[155px] h-[155px] sm:w-[195px] sm:h-[195px] md:w-[215px] md:h-[215px]"
        />
      </div>

      {/* Official Title & Subtitle Lockup */}
      <div className="text-right space-y-1.5 sm:space-y-2 max-w-xl py-2 overflow-visible">
        <div className="text-xs md:text-sm font-display font-bold tracking-widest text-cyan-400">
          MIDO NX STUDIOS · OFFICIAL EDITION
        </div>

        <h1
          className="font-display text-3xl sm:text-5xl md:text-6xl font-black italic tracking-tight text-white leading-normal py-1"
          style={{
            textShadow:
              '0 0 24px rgba(6, 182, 212, 0.5), 0 0 44px rgba(245, 158, 11, 0.35)',
          }}
        >
          APEX HILL{' '}
          <span className="inline-block pb-1 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-red-500">
            RACING
          </span>
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium leading-relaxed">
          Apex Red Trailblazer HD · أسفلت مبلل بانعكاسات واقعية · حواجز معدنية وطقس ديناميكي
        </p>
      </div>
    </div>
  );
};
