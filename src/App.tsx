import { NavLink, Route, Routes } from 'react-router-dom'
import { AppState, usePrefs } from './lib/state'
import { Home, Deck } from './pages/Home'
import { Session } from './pages/Session'
import { Review } from './pages/Review'
import { Stats } from './pages/Stats'
import { Data } from './pages/Data'
import { Drill, DrillHome } from './pages/Drill'
import { Graph } from './pages/Graph'
import { clickTick } from './lib/fx'

const NAV: { to: string; label: string; icon: string; end?: boolean }[] = [
  { to: '/', label: 'Peta', icon: 'ph-map-trifold', end: true },
  { to: '/drill', label: 'Drill', icon: 'ph-lightning' },
  { to: '/graph', label: 'Komponen', icon: 'ph-puzzle-piece' },
  { to: '/review', label: 'Leech', icon: 'ph-bug-beetle' },
  { to: '/stats', label: 'Kebun', icon: 'ph-plant' },
  { to: '/data', label: 'Data', icon: 'ph-database' },
]

function Header() {
  const { prefs, set } = usePrefs()

  return (
    <header className="topbar">
      <NavLink to="/" className="brand">
        <span className="chop">漢</span>
        <span className="brand-text">
          <span className="brand-title">Hanzi Quest</span>
          <span className="brand-sub">Petualangan Hanzi HSK</span>
        </span>
      </NavLink>

      <nav className="nav">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}>
            <i className={`ph-duotone ${n.icon}`} />
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          className="btn btn--ghost"
          style={{ padding: '8px 12px', fontSize: 13, borderRadius: '9999px' }}
          onClick={() => {
            set({ sound: !prefs.sound })
            clickTick(!prefs.sound)
          }}
          title={prefs.sound ? 'Suara aktif' : 'Suara bisu'}
          aria-label="Toggle suara"
        >
          <i
            className={`ph-duotone ${prefs.sound ? 'ph-speaker-high' : 'ph-speaker-slash'}`}
            style={{ color: prefs.sound ? 'var(--cinnabar)' : 'var(--ink-soft)' }}
          />
        </button>

        <button
          type="button"
          className="btn btn--ghost"
          style={{
            padding: '8px 12px',
            fontSize: 13,
            borderRadius: '9999px',
            borderColor: prefs.arcade ? '#FCD34D' : undefined,
            background: prefs.arcade ? '#FEF3C7' : undefined,
          }}
          onClick={() => {
            set({ arcade: !prefs.arcade })
            clickTick(prefs.sound)
          }}
          title={prefs.arcade ? 'Mode Arkade Aktif' : 'Mode Arkade Santai'}
          aria-label="Toggle mode arkade"
        >
          <i
            className={`ph-duotone ph-joystick`}
            style={{ color: prefs.arcade ? '#D97706' : 'var(--ink-soft)' }}
          />
        </button>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <AppState>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/deck/:level" element={<Deck />} />
          <Route path="/session/:level" element={<Session />} />
          <Route path="/drill" element={<DrillHome />} />
          <Route path="/drill/:level/:kind" element={<Drill />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/review" element={<Review />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/data" element={<Data />} />
        </Routes>
      </main>
      <nav className="dock">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}>
            <i className={`ph-duotone ${n.icon}`} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </AppState>
  )
}
