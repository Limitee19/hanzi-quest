import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { clickTick } from '../lib/fx'
import { FLAVOR, Landmark, OUTPOST_NAME, Plum } from '../lib/landmark'

interface GameWorldMapProps {
  counts: Record<number, { total: number; due: number; mastered: number }>
  soundEnabled: boolean
  currentActiveStage: number
}

interface PosCoord {
  level: number
  x: number // SVG viewBox x (out of 1000)
  y: number // SVG viewBox y (out of 1250)
  name: string
  subtitle: string
  biome: string
  color: string
}

const POS_COORDS: PosCoord[] = [
  { level: 1, x: 200, y: 1040, name: 'Pos 1: Gerbang Desa', subtitle: 'HSK 1 · Lembah Permulaan', biome: 'village', color: '#E11D48' },
  { level: 2, x: 640, y: 910, name: 'Pos 2: Jembatan Bambu', subtitle: 'HSK 2 · Hutan Bambu & Sungai', biome: 'river', color: '#10B981' },
  { level: 3, x: 240, y: 640, name: 'Pos 3: Paviliun Teh', subtitle: 'HSK 3 · Air Terjun & Kebun Sakura', biome: 'falls', color: '#059669' },
  { level: 4, x: 730, y: 520, name: 'Pos 4: Menara Lentera', subtitle: 'HSK 4 · Ngarai Lentera Senja', biome: 'canyon', color: '#F59E0B' },
  { level: 5, x: 350, y: 310, name: 'Pos 5: Gunung Berkabut', subtitle: 'HSK 5 · Tebing Awan & Salju', biome: 'mountain', color: '#6366F1' },
  { level: 6, x: 770, y: 140, name: 'Pos 6: Pagoda Puncak', subtitle: 'HSK 6 · Istana Awan Emas', biome: 'summit', color: '#D97706' },
]

export function GameWorldMap({ counts, soundEnabled, currentActiveStage }: GameWorldMapProps) {
  // Hanya muncul saat salah satu pos / jalur dipencet (popup)
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedLevel(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const selPos = selectedLevel !== null ? POS_COORDS.find((p) => p.level === selectedLevel) ?? null : null
  const selStats = (selectedLevel !== null && counts[selectedLevel]) ? counts[selectedLevel] : { total: 0, due: 0, mastered: 0 }
  const selPct = selStats.total ? Math.round((selStats.mastered / selStats.total) * 100) : 0
  const selBloomed = Math.min(5, Math.round((selPct / 100) * 5))
  const isPlayable = selStats.due > 0 || (selectedLevel === 1 && selStats.total > 0)

  const handleSelect = (lv: number) => {
    setSelectedLevel(lv)
    clickTick(soundEnabled)
  }

  const handleClose = () => {
    setSelectedLevel(null)
    clickTick(soundEnabled)
  }

  return (
    <div className="game-map-container">
      {/* Scrollable / Responsive Game Canvas */}
      <div className="game-map-canvas-wrapper">
        <svg
          viewBox="0 0 1000 1250"
          className="game-map-svg"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Peta Petualangan HSK Interaktif"
        >
          <defs>
            {/* Parchment & Terrain Gradients */}
            <radialGradient id="mapVignette" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="#FFFDF7" />
              <stop offset="70%" stopColor="#FAF5E8" />
              <stop offset="100%" stopColor="#EFE5CD" />
            </radialGradient>

            {/* River Gradient */}
            <linearGradient id="riverFlow" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.9" />
            </linearGradient>

            {/* Glowing Golden Energy Trail */}
            <linearGradient id="goldenPathGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="25%" stopColor="#10B981" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="85%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#FCD34D" />
            </linearGradient>

            {/* Trail Glow Filter */}
            <filter id="pathGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Soft Shadow for Island Nodes */}
            <filter id="islandShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#451A03" floodOpacity="0.18" />
            </filter>

            <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feColorMatrix type="matrix" values="1 0 0 0 0.95  0 0.2 0 0 0.1  0 0 0.1 0 0.2  0 0 0 1 0" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Traditional Cloud Pattern */}
            <pattern id="riverRipple" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 0 10 Q 10 5, 20 10 T 40 10" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
            </pattern>
          </defs>

          {/* 1. Base Terrain Map Background */}
          <rect x="0" y="0" width="1000" height="1250" rx="20" fill="url(#mapVignette)" />

          {/* Oriental Double Golden Frame with Knot Flourishes */}
          <rect x="18" y="18" width="964" height="1214" rx="14" fill="none" stroke="#D4AF37" strokeWidth="3" opacity="0.6" />
          <rect x="26" y="26" width="948" height="1198" rx="10" fill="none" stroke="#C59B27" strokeWidth="1.2" strokeDasharray="8 6" opacity="0.45" />

          {/* Corner Calligraphy Knot Motifs */}
          <g stroke="#92400E" strokeWidth="1.8" fill="none" opacity="0.4">
            <path d="M 26 50 C 38 50, 50 38, 50 26 M 26 40 C 34 40, 40 34, 40 26" />
            <path d="M 974 50 C 962 50, 950 38, 950 26 M 974 40 C 966 40, 960 34, 960 26" />
            <path d="M 26 1200 C 38 1200, 50 1212, 50 1224 M 26 1210 C 34 1210, 40 1216, 40 1224" />
            <path d="M 974 1200 C 962 1200, 950 1212, 950 1224 M 974 1210 C 966 1210, 960 1216, 960 1224" />
          </g>

          {/* 2. Shanshui Ink Mountain Silhouettes in Background */}
          <g opacity="0.28">
            {/* Distant Mountain Ridges */}
            <path
              d="M 0 380 Q 140 200, 320 260 T 640 180 T 1000 220 L 1000 500 L 0 500 Z"
              fill="#94A3B8"
            />
            <path
              d="M 120 460 Q 280 320, 420 370 T 780 290 T 1000 350 L 1000 680 L 120 680 Z"
              fill="#64748B"
              opacity="0.5"
            />
          </g>

          {/* 3. Winding River & Cascading Waterfall */}
          <g>
            {/* Waterfall cascading from mountains near Pos 3 */}
            <path
              d="M 160 540 Q 180 570, 190 620 Q 200 660, 220 700"
              stroke="#BAE6FD"
              strokeWidth="24"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Waterfall Foam Lines */}
            <path
              d="M 165 545 Q 185 575, 195 625 M 175 550 Q 190 580, 205 640"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="8 8"
              opacity="0.9"
            />

            {/* Main Winding River */}
            <path
              id="riverMainPath"
              d="M 190 700 C 260 760, 420 740, 500 810 C 580 870, 520 960, 680 1010 C 780 1040, 890 1060, 1000 1100 L 1000 1200 L 820 1200 C 660 1140, 500 1050, 430 960 C 360 880, 220 860, 150 780 Z"
              fill="url(#riverFlow)"
            />

            {/* Animated Flowing Water Ripples */}
            <path
              d="M 210 730 C 300 780, 430 770, 520 830 C 600 890, 550 970, 700 1020 C 800 1050, 900 1070, 980 1110"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeDasharray="16 28"
              opacity="0.55"
              style={{ animation: 'riverFlowAnim 8s linear infinite' }}
            />
            <path
              d="M 230 760 C 320 810, 450 800, 530 860 C 620 920, 580 990, 720 1040"
              fill="none"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="2.5"
              strokeDasharray="12 24"
              style={{ animation: 'riverFlowAnim 6s linear infinite' }}
            />

            {/* Traditional Wooden Sampan Boats gently bobbing */}
            <g className="sampan-boat" transform="translate(360, 790) rotate(-12)">
              <ellipse cx="0" cy="0" rx="22" ry="7" fill="#78350F" />
              <ellipse cx="0" cy="-1" rx="19" ry="5" fill="#B45309" />
              <line x1="-12" y1="-1" x2="14" y2="-1" stroke="#FEF3C7" strokeWidth="1.5" />
              <path d="M -2 -1 L -2 -14 L 8 -1 Z" fill="#FDE68A" opacity="0.9" />
              <circle cx="-1" cy="-14" r="1.5" fill="#D97706" />
            </g>

            <g className="sampan-boat sampan-boat--delayed" transform="translate(820, 1075) rotate(18)">
              <ellipse cx="0" cy="0" rx="24" ry="8" fill="#78350F" />
              <ellipse cx="0" cy="-1" rx="21" ry="6" fill="#92400E" />
              <path d="M 0 -1 L 0 -16 L 10 -1 Z" fill="#FFFBEB" opacity="0.9" />
            </g>
          </g>

          {/* 4. Bamboo Grove Biome (Around Pos 2) */}
          <g opacity="0.75">
            {[530, 550, 570, 590, 710, 730, 750, 770].map((bx, i) => (
              <g key={`bamboo-${bx}-${i}`} transform={`translate(${bx}, ${840 + (i % 3) * 12})`}>
                <line x1="0" y1="0" x2="0" y2="70" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
                <line x1="0" y1="18" x2="8" y2="12" stroke="#10B981" strokeWidth="2.5" />
                <line x1="0" y1="36" x2="-8" y2="30" stroke="#10B981" strokeWidth="2.5" />
                <line x1="0" y1="52" x2="7" y2="46" stroke="#047857" strokeWidth="2.5" />
              </g>
            ))}
          </g>

          {/* 5. Cherry Blossom Grove Biome (Near Pos 3) */}
          <g opacity="0.85">
            {/* Sakura Tree Canopies */}
            <circle cx="150" cy="620" r="28" fill="#FDA4AF" opacity="0.8" />
            <circle cx="165" cy="605" r="22" fill="#F43F5E" opacity="0.75" />
            <circle cx="135" cy="610" r="20" fill="#FECDD3" opacity="0.9" />
            <path d="M 150 635 L 150 670" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />

            <circle cx="290" cy="710" r="24" fill="#FDA4AF" opacity="0.8" />
            <circle cx="305" cy="695" r="18" fill="#FB7185" opacity="0.8" />
            <path d="M 290 720 L 290 750" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* 6. Canyon Gorge Rocks & Lanterns (Near Pos 4) */}
          <g opacity="0.8">
            <path d="M 670 470 L 700 420 L 730 460 L 750 410 L 780 470 Z" fill="#94A3B8" opacity="0.5" />
            <path d="M 760 550 L 790 510 L 820 560 Z" fill="#64748B" opacity="0.5" />
            {/* Warm Lantern Glows along the canyon path */}
            <circle cx="690" cy="460" r="6" fill="#F59E0B" filter="url(#pathGlow)" opacity="0.8" />
            <circle cx="760" cy="480" r="6" fill="#F59E0B" filter="url(#pathGlow)" opacity="0.8" />
          </g>

          {/* 7. Summit Heavenly Clouds (Near Pos 6) */}
          <g opacity="0.9">
            {/* Celestial Golden Clouds around summit */}
            <path
              d="M 680 180 C 700 150, 740 150, 760 170 C 780 140, 830 140, 860 170 C 890 150, 920 170, 920 190 C 920 220, 840 230, 780 220 C 720 230, 670 210, 680 180 Z"
              fill="#FEF3C7"
              opacity="0.7"
            />
            <path
              d="M 710 130 C 730 100, 770 100, 790 120 C 810 90, 860 90, 890 120 C 900 140, 850 155, 780 150 C 730 155, 700 145, 710 130 Z"
              fill="#FDE68A"
              opacity="0.5"
            />
          </g>

          {/* 8. Winding RPG Adventure Trail (Golden Energy Stream) */}
          <g>
            {/* Trail Path Definition: Smooth Serpentine Curve connecting Pos 1 -> 2 -> 3 -> 4 -> 5 -> 6 */}
            {/* Pos 1 (200, 1040) -> Pos 2 (640, 910) -> Pos 3 (240, 640) -> Pos 4 (730, 520) -> Pos 5 (350, 310) -> Pos 6 (770, 140) */}
            <path
              id="adventureTrail"
              d="M 200 1040 C 380 1010, 520 980, 640 910 C 740 850, 500 750, 240 640 C 80 570, 480 570, 730 520 C 900 480, 600 370, 350 310 C 220 270, 540 190, 770 140"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="28"
              strokeLinecap="round"
              opacity="0.25"
            />

            {/* Stepping Stone Cobblestone Trail */}
            <path
              d="M 200 1040 C 380 1010, 520 980, 640 910 C 740 850, 500 750, 240 640 C 80 570, 480 570, 730 520 C 900 480, 600 370, 350 310 C 220 270, 540 190, 770 140"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="10"
              strokeDasharray="10 16"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Animated Luminous Energy Stream with Flowing Gradient */}
            <path
              d="M 200 1040 C 380 1010, 520 980, 640 910 C 740 850, 500 750, 240 640 C 80 570, 480 570, 730 520 C 900 480, 600 370, 350 310 C 220 270, 540 190, 770 140"
              fill="none"
              stroke="url(#goldenPathGrad)"
              strokeWidth="5"
              strokeDasharray="14 24"
              strokeLinecap="round"
              filter="url(#pathGlow)"
              style={{ animation: 'trailPulseFlow 12s linear infinite' }}
            />

            {/* Intermediate Milestone Stepping Stones */}
            {[
              { x: 380, y: 990, label: '1·1' },
              { x: 520, y: 960, label: '1·2' },
              { x: 500, y: 770, label: '2·1' },
              { x: 350, y: 690, label: '2·2' },
              { x: 420, y: 580, label: '3·1' },
              { x: 590, y: 550, label: '3·2' },
              { x: 560, y: 410, label: '4·1' },
              { x: 440, y: 350, label: '4·2' },
              { x: 480, y: 250, label: '5·1' },
              { x: 640, y: 190, label: '5·2' },
            ].map((st, i) => (
              <g key={`step-${i}`} transform={`translate(${st.x}, ${st.y})`} className="milestone-stone">
                <circle cx="0" cy="0" r="10" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="4" fill="#F59E0B" />
              </g>
            ))}
          </g>

          {/* 9. Flying Cranes (Bangau Melayang di Angkasa) */}
          <g className="flying-cranes" opacity="0.75">
            <g transform="translate(420, 160) scale(0.8)">
              <path d="M 0 0 Q 15 -10, 30 0 Q 20 8, 12 10 Q 5 6, 0 0 Z" fill="#334155" />
              <path d="M 12 10 L 8 20 M 14 10 L 12 20" stroke="#334155" strokeWidth="1.2" />
            </g>
            <g transform="translate(460, 140) scale(0.65)">
              <path d="M 0 0 Q 15 -10, 30 0 Q 20 8, 12 10 Q 5 6, 0 0 Z" fill="#475569" />
            </g>
            <g transform="translate(490, 175) scale(0.55)">
              <path d="M 0 0 Q 15 -10, 30 0 Q 20 8, 12 10 Q 5 6, 0 0 Z" fill="#64748B" />
            </g>
          </g>

          {/* 10. Atmospheric Overlay Elements (Mist, Compass, Seal) */}
          {/* Compass Rose in Top-Left */}
          <g transform="translate(90, 95)" className="compass-rose" opacity="0.8">
            <circle cx="0" cy="0" r="46" fill="rgba(255,255,255,0.7)" stroke="#B45309" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="40" fill="none" stroke="#D97706" strokeWidth="0.8" strokeDasharray="3 3" />
            {/* Compass Points */}
            <polygon points="0,-36 8,-8 0,0" fill="#BE123C" />
            <polygon points="0,-36 -8,-8 0,0" fill="#E11D48" />
            <polygon points="0,36 8,8 0,0" fill="#78350F" />
            <polygon points="0,36 -8,8 0,0" fill="#92400E" />
            <polygon points="36,0 8,8 0,0" fill="#78350F" />
            <polygon points="-36,0 -8,-8 0,0" fill="#92400E" />
            <circle cx="0" cy="0" r="5" fill="#F59E0B" />
            <text x="0" y="-40" textAnchor="middle" fontSize="13" fontWeight="900" fill="#92400E">U</text>
            <text x="44" y="5" textAnchor="middle" fontSize="11" fontWeight="800" fill="#78350F">T</text>
            <text x="0" y="48" textAnchor="middle" fontSize="11" fontWeight="800" fill="#78350F">S</text>
            <text x="-44" y="5" textAnchor="middle" fontSize="11" fontWeight="800" fill="#78350F">B</text>
          </g>

          {/* Title Header Banner on Map */}
          <g transform="translate(160, 68)">
            <rect x="0" y="0" width="280" height="48" rx="24" fill="rgba(255, 255, 255, 0.88)" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="24" y="30" fontSize="18" fontWeight="900" fill="#78350F" fontFamily="var(--font-display)">
              Jalur Petualangan HSK
            </text>
            <rect x="206" y="12" width="60" height="24" rx="12" fill="#D1FAE5" />
            <text x="236" y="28" fontSize="11.5" fontWeight="800" fill="#065F46" textAnchor="middle">
              HSK 1–6
            </text>
          </g>

          {/* Imperial Red Seal Stamp in Bottom-Right */}
          <g transform="translate(900, 1150)" opacity="0.85">
            <rect x="-30" y="-30" width="60" height="60" rx="10" fill="#BE123C" />
            <rect x="-26" y="-26" width="52" height="52" rx="7" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
            <text x="0" y="-4" fontSize="14" fontWeight="900" fill="#FFFFFF" textAnchor="middle" fontFamily="var(--font-chinese)">
              漢字
            </text>
            <text x="0" y="15" fontSize="14" fontWeight="900" fill="#FFFFFF" textAnchor="middle" fontFamily="var(--font-chinese)">
              秘境
            </text>
          </g>

          {/* 11. THE 6 SEPARATED INTERACTIVE STAGE ISLAND NODES */}
          {POS_COORDS.map((pos) => {
            const s = counts[pos.level] ?? { total: 0, due: 0, mastered: 0 }
            const isCurrent = pos.level === currentActiveStage
            const isSelected = pos.level === selectedLevel
            const hasDue = s.due > 0
            const pct = s.total ? Math.round((s.mastered / s.total) * 100) : 0
            const bloomedCount = Math.min(5, Math.round((pct / 100) * 5))

            return (
              <g
                key={pos.level}
                transform={`translate(${pos.x}, ${pos.y})`}
                className={`game-stage-node ${isSelected ? 'stage-node--selected' : ''} ${isCurrent ? 'stage-node--active' : ''}`}
                onClick={() => handleSelect(pos.level)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleSelect(pos.level)
                }}
                aria-label={`${pos.name}, ${hasDue ? `${s.due} kartu siap latih` : '0 kartu jatuh tempo'}`}
              >
                <g className="stage-node-inner">
                  {/* Active Pulsing Aura */}
                  {isCurrent && (
                    <circle
                      cx="0"
                      cy="0"
                      r="54"
                      fill="none"
                      stroke="#F43F5E"
                      strokeWidth="3"
                      opacity="0.8"
                      className="pulse-aura"
                    />
                  )}

                  {/* Selected Outer Highlight Ring */}
                  {isSelected && (
                    <circle
                      cx="0"
                      cy="0"
                      r="58"
                      fill="none"
                      stroke="#D97706"
                      strokeWidth="4"
                      strokeDasharray="8 6"
                      className="spin-ring"
                    />
                  )}

                  {/* 3D Floating Stage Island Pedestal */}
                  <ellipse cx="0" cy="18" rx="46" ry="24" fill="#334155" opacity="0.22" filter="url(#islandShadow)" />
                  <ellipse cx="0" cy="14" rx="44" ry="22" fill="#E2E8F0" />
                  <ellipse cx="0" cy="10" rx="42" ry="20" fill={isSelected ? '#FEF3C7' : '#FFFFFF'} stroke={pos.color} strokeWidth="3" />

                  {/* Embedded HTML Landmark Illustration Component */}
                  <foreignObject x="-36" y="-48" width="72" height="72">
                    <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
                      <Landmark level={pos.level} />
                    </div>
                  </foreignObject>

                  {/* Active Traveler Token Companion Avatar Sitting on the Node */}
                  {isCurrent && (
                    <g transform="translate(24, -54)">
                      <g className="avatar-companion-token">
                        <circle cx="0" cy="0" r="16" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2.5" />
                        <text x="0" y="5" fontSize="14" textAnchor="middle" fill="#FFFFFF">🧭</text>
                      </g>
                    </g>
                  )}

                  {/* Stage Pill Banner Label */}
                  <g transform="translate(0, 44)">
                    <rect
                      x="-95"
                      y="0"
                      width="190"
                      height="32"
                      rx="16"
                      fill={isSelected ? '#1E293B' : 'rgba(255, 255, 255, 0.94)'}
                      stroke={isSelected ? '#F59E0B' : '#CBD5E1'}
                      strokeWidth={isSelected ? '2' : '1.2'}
                      filter="url(#islandShadow)"
                    />
                    <text
                      x="-10"
                      y="20"
                      textAnchor="middle"
                      fontSize="12.5"
                      fontWeight="800"
                      fill={isSelected ? '#FFFFFF' : 'var(--ink)'}
                      fontFamily="var(--font-ui)"
                    >
                      {OUTPOST_NAME[pos.level]}
                    </text>
                    <rect
                      x="56"
                      y="5"
                      width="30"
                      height="22"
                      rx="11"
                      fill={hasDue ? '#E11D48' : '#10B981'}
                    />
                    <text
                      x="71"
                      y="20"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="900"
                      fill="#FFFFFF"
                    >
                      H{pos.level}
                    </text>
                  </g>

                  {/* Due Count Pill or Mastery Star Badge */}
                  <g transform="translate(0, 84)">
                    {hasDue ? (
                      <g>
                        <rect x="-60" y="0" width="120" height="22" rx="11" fill="#FFF1F2" stroke="#FDA4AF" strokeWidth="1" />
                        <text x="0" y="15" textAnchor="middle" fontSize="11" fontWeight="800" fill="#BE123C">
                          🔥 {s.due} Jatuh Tempo
                        </text>
                      </g>
                    ) : (
                      <g>
                        <rect x="-55" y="0" width="110" height="22" rx="11" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1" />
                        <text x="0" y="15" textAnchor="middle" fontSize="11" fontWeight="800" fill="#15803D">
                          🌸 {bloomedCount}/5 Bunga Mekar
                        </text>
                      </g>
                    )}
                  </g>
                </g>
              </g>
            )
          })}
        </svg>

        {/* 12. FLOATING STAGE POPUP MODAL (HANYA MUNCUL SAAT SALAH SATU POS DIKLIK) */}
        {selectedLevel !== null && selPos && (
          <div
            className="stage-popup-overlay"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stage-popup-title"
          >
            <div
              className="stage-popup-card"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Landmark, Level Pill, Title, & Close Button */}
              <div className="stage-popup-header">
                <div style={{ width: 68, height: 68, flexShrink: 0 }}>
                  <Landmark level={selPos.level} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge-tag" style={{ background: '#FEE2E2', color: '#BE123C', fontWeight: 800 }}>
                      HSK {selPos.level}
                    </span>
                    <span className="badge-tag" style={{ background: '#FEF3C7', color: '#92400E', fontWeight: 700 }}>
                      {selPos.subtitle}
                    </span>
                  </div>

                  <h3 id="stage-popup-title" style={{ margin: '6px 0 2px', fontSize: 20, color: 'var(--ink)' }}>
                    {OUTPOST_NAME[selPos.level]}
                  </h3>

                  <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                    {selStats.due > 0 ? (
                      <b style={{ color: 'var(--cinnabar)' }}>🔥 {selStats.due} kata jatuh tempo</b>
                    ) : (
                      <span style={{ color: 'var(--jade)' }}>🌸 Semua kata telah diulang!</span>
                    )}{' '}
                    · {selStats.mastered}/{selStats.total} mekar ({selPct}%)
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  className="stage-popup-close-btn"
                  onClick={handleClose}
                  aria-label="Tutup jendela pos"
                >
                  <i className="ph-bold ph-x" />
                </button>
              </div>

              {/* Flavor Lore Text */}
              <p className="inspector-card__flavor">
                "{FLAVOR[selPos.level]}"
              </p>

              {/* Progress Bar & Plum Blossoms */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, margin: '14px 0 16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', marginBottom: 4 }}>
                    <span>Progres Mekar Aksara</span>
                    <span>{selPct}%</span>
                  </div>
                  <div className="bloom-bar" style={{ height: 8 }}>
                    <div className="bloom-bar__fill" style={{ width: `${selPct}%` }} />
                  </div>
                </div>

                <div className="plum-row" style={{ margin: 0 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Plum key={i} bloomed={i < selBloomed} />
                  ))}
                </div>
              </div>

              {/* Quick Stage Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: '#F8FAFC', borderRadius: 'var(--radius)', marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)' }}>Pilih Pos Lain:</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3, 4, 5, 6].map((lv) => (
                    <button
                      key={lv}
                      type="button"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        border: 'none',
                        background: lv === selectedLevel ? 'var(--cinnabar)' : '#FFFFFF',
                        color: lv === selectedLevel ? '#FFFFFF' : 'var(--ink)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => handleSelect(lv)}
                      title={`Pindah ke Pos ${lv}`}
                    >
                      {lv}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive CTAs */}
              <div className="inspector-card__actions">
                <Link
                  to={isPlayable ? `/session/${selPos.level}` : `/deck/${selPos.level}`}
                  className={`btn ${isPlayable ? 'btn--primary' : 'btn--ghost'}`}
                  style={{ flex: 2, padding: '12px 24px', fontSize: 15 }}
                  onClick={handleClose}
                >
                  <i className="ph-bold ph-play" />
                  {isPlayable ? `Mulai Sesi Belajar (${selStats.due} kata)` : 'Lihat Aksara Pos'}
                </Link>

                <Link
                  to={`/drill/${selPos.level}/tone`}
                  className="btn btn--jade"
                  style={{ flex: 1, padding: '12px 18px', fontSize: 14 }}
                  onClick={handleClose}
                >
                  <i className="ph-duotone ph-lightning" />
                  Drill Nada
                </Link>

                <Link
                  to={`/deck/${selPos.level}`}
                  className="btn btn--ghost"
                  style={{ padding: '12px 18px', fontSize: 14 }}
                  onClick={handleClose}
                >
                  <i className="ph-duotone ph-cards" />
                  Deck
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
