import React, { useState } from 'react'

export const FLAVOR: Record<number, string> = {
  1: 'Gerbang desa tempat langkah pertama, lentera menyala menyambut petualang.',
  2: 'Jembatan bambu di atas gemericik air jernih dan pepohonan giok.',
  3: 'Paviliun teh hijau, tempat rehat sejenak menyeruput aksara.',
  4: 'Menara lentera senja, mercusuar penuntun kata di kegelapan.',
  5: 'Puncak berkabut, hawa sejuk menguji ketekunan sang petualang.',
  6: 'Pagoda teratai langit, tempat para master mengukir aksara emas.',
}

export const OUTPOST_NAME: Record<number, string> = {
  1: 'Pos Gerbang Desa',
  2: 'Pos Jembatan Bambu',
  3: 'Pos Paviliun Teh',
  4: 'Pos Menara Lentera',
  5: 'Pos Gunung Berkabut',
  6: 'Pos Pagoda Puncak',
}

// Rich, cute, and atmospheric duotone illustrations for each outpost
function VillageGate() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="landmark-svg">
      <defs>
        <linearGradient id="gateRoof" x1="10" y1="18" x2="70" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F43F5E" />
          <stop offset="1" stopColor="#BE123C" />
        </linearGradient>
        <linearGradient id="gateGlow" x1="40" y1="36" x2="40" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEF3C7" stopOpacity="0.8" />
          <stop offset="1" stopColor="#FDE68A" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {/* Background soft glow */}
      <circle cx="40" cy="40" r="34" fill="#FFE4E6" fillOpacity="0.6" />
      {/* Gate Opening Light */}
      <rect x="28" y="34" width="24" height="34" rx="4" fill="url(#gateGlow)" />
      {/* Wooden Pillars */}
      <rect x="18" y="30" width="7" height="38" rx="2.5" fill="#78350F" />
      <rect x="55" y="30" width="7" height="38" rx="2.5" fill="#78350F" />
      <rect x="26" y="32" width="5" height="36" rx="2" fill="#92400E" />
      <rect x="49" y="32" width="5" height="36" rx="2" fill="#92400E" />
      {/* Base Foundation */}
      <rect x="12" y="66" width="56" height="6" rx="3" fill="#64748B" />
      {/* Main Arch Beam */}
      <rect x="14" y="27" width="52" height="6" rx="2" fill="#BE123C" />
      {/* Chinese curved tiled roof */}
      <path d="M8 26C16 25 24 18 40 18C56 18 64 25 72 26C68 21 54 13 40 13C26 13 12 21 8 26Z" fill="url(#gateRoof)" />
      <path d="M40 9L43 14H37L40 9Z" fill="#F59E0B" />
      {/* Hanging Red Lanterns */}
      <circle cx="21" cy="40" r="4.5" fill="#E11D48" />
      <path d="M21 35V36M21 44V47" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="59" cy="40" r="4.5" fill="#E11D48" />
      <path d="M59 35V36M59 44V47" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function BambooBridge() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="landmark-svg">
      <defs>
        <linearGradient id="bridgeWater" x1="10" y1="55" x2="70" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" stopOpacity="0.4" />
          <stop offset="1" stopColor="#0284C7" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="34" fill="#D1FAE5" fillOpacity="0.6" />
      {/* Water stream */}
      <path d="M6 62C22 58 38 68 54 62C64 58 72 64 76 66V74H4V62H6Z" fill="url(#bridgeWater)" />
      {/* Distant Sun */}
      <circle cx="58" cy="24" r="8" fill="#FDE68A" />
      {/* Bamboo Shoots */}
      <rect x="14" y="26" width="3.5" height="36" rx="1.5" fill="#059669" />
      <rect x="20" y="32" width="3" height="30" rx="1.5" fill="#10B981" />
      <rect x="62" y="24" width="3.5" height="38" rx="1.5" fill="#059669" />
      {/* Arched Bamboo Bridge */}
      <path d="M12 54C24 38 56 38 68 54" stroke="#78350F" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M14 54C24 40 56 40 66 54" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Bridge Posts & Railing */}
      <path d="M12 47C24 32 56 32 68 47" stroke="#92400E" strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" fill="none" />
      <line x1="28" y1="44" x2="28" y2="58" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="52" y1="44" x2="52" y2="58" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function TeaPavilion() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="landmark-svg">
      <defs>
        <linearGradient id="teaRoof" x1="12" y1="18" x2="68" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#059669" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="34" fill="#ECFDF5" fillOpacity="0.7" />
      {/* Steaming Tea Bowl silhouette */}
      <ellipse cx="40" cy="52" rx="7" ry="4" fill="#D97706" fillOpacity="0.3" />
      {/* Pavilion Pillars */}
      <rect x="22" y="32" width="4.5" height="32" rx="2" fill="#78350F" />
      <rect x="53.5" y="32" width="4.5" height="32" rx="2" fill="#78350F" />
      <rect x="33" y="34" width="3.5" height="30" rx="1.5" fill="#92400E" />
      <rect x="43.5" y="34" width="3.5" height="30" rx="1.5" fill="#92400E" />
      {/* Platform */}
      <rect x="14" y="62" width="52" height="6" rx="2.5" fill="#64748B" />
      {/* Hexagonal Pagoda Roof */}
      <path d="M10 32C22 30 28 20 40 20C52 20 58 30 70 32C64 26 52 16 40 16C28 16 16 26 10 32Z" fill="url(#teaRoof)" />
      <path d="M40 10L42.5 16H37.5L40 10Z" fill="#F59E0B" />
      {/* Floating Tea Leaves */}
      <path d="M26 44C27 41 30 42 30 44C28 46 26 46 26 44Z" fill="#10B981" />
      <path d="M50 42C51 39 54 40 54 42C52 44 50 44 50 42Z" fill="#10B981" />
    </svg>
  )
}

function LanternTower() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="landmark-svg">
      <defs>
        <radialGradient id="lanternGlow" cx="40" cy="40" r="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="#F59E0B" stopOpacity="0.4" />
          <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="34" fill="#FEF3C7" fillOpacity="0.6" />
      {/* Lantern Glow */}
      <circle cx="40" cy="38" r="16" fill="url(#lanternGlow)" />
      {/* Stone Spire Tower */}
      <rect x="35" y="48" width="10" height="20" rx="1" fill="#475569" />
      <path d="M28 66H52V70H28V66Z" fill="#334155" />
      {/* Lantern Chamber */}
      <rect x="31" y="32" width="18" height="14" rx="2" fill="#F59E0B" />
      <rect x="34" y="34" width="12" height="10" rx="1" fill="#FEF08A" />
      <line x1="40" y1="32" x2="40" y2="46" stroke="#92400E" strokeWidth="1.5" />
      {/* Roof Tier 1 */}
      <path d="M22 34C30 32 34 26 40 26C46 26 50 32 58 34C52 29 46 23 40 23C34 23 28 29 22 34Z" fill="#E11D48" />
      {/* Top Roof & Finial */}
      <path d="M26 24C32 23 35 18 40 18C45 18 48 23 54 24C49 20 45 15 40 15C35 15 31 20 26 24Z" fill="#BE123C" />
      <circle cx="40" cy="12" r="3" fill="#F59E0B" />
      {/* Stars/Fireflies */}
      <circle cx="20" cy="22" r="1.5" fill="#F59E0B" />
      <circle cx="62" cy="28" r="1.5" fill="#F59E0B" />
      <circle cx="58" cy="54" r="1.5" fill="#F59E0B" />
    </svg>
  )
}

function MistyMountain() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="landmark-svg">
      <defs>
        <linearGradient id="mountSnow" x1="40" y1="16" x2="40" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="0.6" stopColor="#4338CA" />
          <stop offset="1" stopColor="#1E1B4B" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="34" fill="#EEF2FF" fillOpacity="0.7" />
      {/* Distant Sun */}
      <circle cx="24" cy="26" r="7" fill="#FCA5A5" fillOpacity="0.8" />
      {/* Mountain Peaks */}
      <path d="M8 68L28 32L38 46L54 22L72 68H8Z" fill="url(#mountSnow)" />
      {/* Snowcaps */}
      <path d="M54 22L46 34L54 36L62 34L54 22Z" fill="#FFFFFF" fillOpacity="0.9" />
      <path d="M28 32L21 42L28 44L35 42L28 32Z" fill="#FFFFFF" fillOpacity="0.85" />
      {/* Cloud & Mist swirl */}
      <path d="M12 56C20 52 30 52 42 56C54 60 66 56 74 54" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.85" />
      <path d="M4 64C16 60 28 62 44 64C56 66 68 62 76 62" stroke="#E0E7FF" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.8" />
    </svg>
  )
}

function SummitPagoda() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="landmark-svg">
      <defs>
        <linearGradient id="pagodaGold" x1="16" y1="14" x2="64" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="34" fill="#FFFBEB" fillOpacity="0.8" />
      {/* Cloud underneath */}
      <path d="M14 66C24 62 34 62 46 65C56 68 66 64 72 66" stroke="#FEF3C7" strokeWidth="5" strokeLinecap="round" />
      {/* Base */}
      <rect x="24" y="58" width="32" height="6" rx="2" fill="#64748B" />
      {/* Lower tier */}
      <rect x="29" y="47" width="22" height="12" rx="1" fill="#78350F" />
      <path d="M14 48C24 45 32 38 40 38C48 38 56 45 66 48C58 42 50 34 40 34C30 34 22 42 14 48Z" fill="#E11D48" />
      {/* Mid tier */}
      <rect x="32" y="32" width="16" height="8" rx="1" fill="#92400E" />
      <path d="M18 34C26 31 32 26 40 26C48 26 54 31 62 34C55 29 48 23 40 23C32 23 25 29 18 34Z" fill="#BE123C" />
      {/* Top tier & Golden Needle */}
      <path d="M22 24C30 21 34 16 40 16C46 16 50 21 58 24C52 20 46 14 40 14C34 14 28 20 22 24Z" fill="url(#pagodaGold)" />
      <line x1="40" y1="6" x2="40" y2="14" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="6" r="2.5" fill="#E11D48" />
    </svg>
  )
}

const MARKS: Record<number, () => React.ReactElement> = {
  1: VillageGate,
  2: BambooBridge,
  3: TeaPavilion,
  4: LanternTower,
  5: MistyMountain,
  6: SummitPagoda,
}

export function Landmark({ level }: { level: number }) {
  const [imgOk, setImgOk] = useState(false)
  const Mark = MARKS[level] ?? VillageGate
  const src = `/assets/pos-hsk${level}.png`

  return (
    <div className={`landmark-container landmark--hsk${level}`}>
      <Mark />
      {imgOk && <img src={src} alt="" className="landmark-img" onError={() => setImgOk(false)} />}
      <img
        src={src}
        alt=""
        style={{ display: imgOk ? undefined : 'none' }}
        onLoad={() => setImgOk(true)}
        onError={() => setImgOk(false)}
      />
      <span className="landmark__stamp">H{level}</span>
    </div>
  )
}

/** Sweet, charming Plum Blossom (Meihua) with glowing petals and bloom effect */
export function Plum({ bloomed }: { bloomed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`plum-flower ${bloomed ? 'plum--bloomed' : 'plum--bud'}`} aria-hidden="true">
      <defs>
        <radialGradient id="petalGlow" cx="50%" cy="50%" r="50%">
          <stop stopColor="#FDA4AF" />
          <stop offset="1" stopColor="#E11D48" />
        </radialGradient>
      </defs>
      {bloomed ? (
        <g>
          {/* 5 Blooming Petals */}
          <circle cx="12" cy="5.5" r="3.6" fill="url(#petalGlow)" />
          <circle cx="18.2" cy="10" r="3.6" fill="url(#petalGlow)" />
          <circle cx="15.8" cy="17.2" r="3.6" fill="url(#petalGlow)" />
          <circle cx="8.2" cy="17.2" r="3.6" fill="url(#petalGlow)" />
          <circle cx="5.8" cy="10" r="3.6" fill="url(#petalGlow)" />
          {/* Blossom Center Core */}
          <circle cx="12" cy="12" r="2.6" fill="#F59E0B" />
          <circle cx="12" cy="12" r="1.2" fill="#FEF3C7" />
        </g>
      ) : (
        <g opacity="0.45">
          {/* Unopened Bud */}
          <path d="M12 7C9.5 9.5 9 14 12 17C15 14 14.5 9.5 12 7Z" fill="#94A3B8" />
          <circle cx="12" cy="18.5" r="1.5" fill="#64748B" />
          <path d="M12 19V22" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}
