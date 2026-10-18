import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { db } from '../lib/db'
import { usePrefs } from '../lib/state'
import { syncSeed } from '../lib/seed'
import { clickTick, StrokeOrder } from '../lib/fx'
import { FLAVOR, Landmark, OUTPOST_NAME, Plum } from '../lib/landmark'
import { GameWorldMap } from '../components/GameWorldMap'

const ICON = 'ph-duotone'

export function Home() {
  const { prefs, set } = usePrefs()
  const [counts, setCounts] = useState<Record<number, { total: number; due: number; mastered: number }>>({})
  const [total, setTotal] = useState(0)
  const [viewMode, setViewMode] = useState<'animated' | 'grid'>('animated')
  const [activeInfo, setActiveInfo] = useState<'arcade' | 'sound' | null>(null)

  const reload = () => {
    db.vocab.toArray().then((all) => {
      const now = Date.now()
      const c: Record<number, { total: number; due: number; mastered: number }> = {}
      for (let l = 1; l <= 6; l++) c[l] = { total: 0, due: 0, mastered: 0 }
      for (const v of all) {
        const s = c[v.level] ?? (c[v.level] = { total: 0, due: 0, mastered: 0 })
        s.total += 1
        if (v.due <= now) s.due += 1
        if (v.mastered) s.mastered += 1
      }
      setCounts(c)
      setTotal(all.length)
    })
  }

  useEffect(() => {
    syncSeed().then(reload)
  }, [])

  const ACTIONS: { to: string; label: string; sub: string; icon: string; tone: string }[] = [
    { to: '/review', label: 'Ulas kesalahan', sub: 'jebak kata bandel', icon: 'ph-bug-beetle', tone: 'jade' },
    { to: '/stats', label: 'Kebun & statistik', sub: 'petak bunga mekar', icon: 'ph-plant', tone: 'ochre' },
    { to: '/drill', label: 'Drill mirip', sub: 'jangan tertukar', icon: 'ph-lightning', tone: 'cinnabar' },
    { to: '/graph', label: 'Peta komponen', sub: 'keluarga radikal', icon: 'ph-puzzle-piece', tone: 'jade' },
  ]

  // Find currently active stage (the first stage with due words, or level 1)
  const currentActiveStage = [1, 2, 3, 4, 5, 6].find((l) => (counts[l]?.due ?? 0) > 0) ?? 1

  return (
    <div className="layout">
      {/* Kolom Kiri: Kemah Petualang & Tas Bekal */}
      <div className="col-side">
        <section className={`hero card ${prefs.arcade ? 'hero--arcade' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="pack-badge">
              <i className={`${ICON} ph-backpack`} />
              <span><b>{total}</b> kata di bekalmu</span>
            </span>
            {prefs.arcade && (
              <span className="arcade-flag">
                <i className="ph-fill ph-lightning" /> Arkade
              </span>
            )}
          </div>

          <h1 className="hero__title">Tenang itu default. Arkade opsional.</h1>
          <p className="hero__tagline">
            Belajar santai, satu kartu satu napas. Siram aksara tiap hari agar tumbuh mekar.
          </p>

          <div className="switch-grid">
            <div className="switch-item">
              <div className="switch-row">
                <button
                  type="button"
                  className="toggle-pill toggle-pill--jade"
                  aria-pressed={prefs.arcade}
                  onClick={() => {
                    set({ arcade: !prefs.arcade })
                    clickTick(prefs.sound)
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className={`${ICON} ph-joystick`} />
                    <span>Mode arkade</span>
                  </span>
                  <span className="toggle-pill__led" />
                </button>
                <button
                  type="button"
                  className={`toggle-info-btn ${activeInfo === 'arcade' ? 'toggle-info-btn--active' : ''}`}
                  aria-label="Informasi fungsi Mode Arkade"
                  title="Apa itu Mode Arkade?"
                  onClick={() => {
                    setActiveInfo(activeInfo === 'arcade' ? null : 'arcade')
                    clickTick(prefs.sound)
                  }}
                >
                  <i className="ph-bold ph-info" />
                </button>
              </div>
              {activeInfo === 'arcade' && (
                <div className="toggle-info-box">
                  <div className="toggle-info-box__title">
                    <i className="ph-bold ph-sparkle" style={{ color: 'var(--amber)' }} />
                    <span>Apa fungsi Mode Arkade?</span>
                  </div>
                  <p>
                    Saat aktif, sesi belajar dilengkapi animasi seru seperti <strong>Streak beruntun 🔥</strong>, letupan bonus <strong>XP (+20 XP)</strong>, getaran visual interaktif, dan pesta <strong>hujan konfeti 🎉</strong> saat berhasil menjawab berturut-turut!
                  </p>
                </div>
              )}
            </div>

            <div className="switch-item">
              <div className="switch-row">
                <button
                  type="button"
                  className="toggle-pill"
                  aria-pressed={prefs.sound}
                  onClick={() => {
                    set({ sound: !prefs.sound })
                    clickTick(!prefs.sound)
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className={`${ICON} ph-speaker-high`} />
                    <span>Bunyi ketuk</span>
                  </span>
                  <span className="toggle-pill__led" />
                </button>
                <button
                  type="button"
                  className={`toggle-info-btn ${activeInfo === 'sound' ? 'toggle-info-btn--active' : ''}`}
                  aria-label="Informasi fungsi Bunyi Ketuk"
                  title="Apa itu Bunyi Ketuk?"
                  onClick={() => {
                    setActiveInfo(activeInfo === 'sound' ? null : 'sound')
                    clickTick(prefs.sound)
                  }}
                >
                  <i className="ph-bold ph-info" />
                </button>
              </div>
              {activeInfo === 'sound' && (
                <div className="toggle-info-box">
                  <div className="toggle-info-box__title">
                    <i className="ph-bold ph-speaker-high" style={{ color: 'var(--cinnabar)' }} />
                    <span>Apa fungsi Bunyi Ketuk?</span>
                  </div>
                  <p>
                    Mengaktifkan <strong>efek suara audio taktil</strong> saat belajar: denting klik saat menekan tombol, nada melodi ceria saat jawaban benar, dan nada pemberitahuan lembut saat salah.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="field-label">
            <i className={`${ICON} ph-crosshair`} /> Target sesi belajar
          </div>
          <div className="segmented">
            {[5, 10, 20, 50].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={prefs.target === n}
                onClick={() => {
                  set({ target: n })
                  clickTick(prefs.sound)
                }}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="bento">
            {ACTIONS.map((a) => (
              <Link key={a.to} className={`action-card action-card--${a.tone}`} to={a.to}>
                <span className="action-card__icon">
                  <i className={`${ICON} ${a.icon}`} />
                </span>
                <span>
                  <b>{a.label}</b>
                  <small>{a.sub}</small>
                </span>
              </Link>
            ))}

            <Link className="action-card action-card--wide" to="/data">
              <span className="action-card__icon" style={{ background: '#E2E8F0', color: 'var(--ink)' }}>
                <i className={`${ICON} ph-database`} />
              </span>
              <span>
                <b>Impor / ekspor data</b>
                <small>Riwayat milikmu sepenuhnya, bisa dicadangkan</small>
              </span>
              <span style={{ marginLeft: 'auto', color: 'var(--ink-soft)' }}>
                <i className="ph-bold ph-arrow-right" />
              </span>
            </Link>
          </div>
        </section>
      </div>

      {/* Kolom Kanan: Peta Jalur Petualangan RPG Hidup & Beranimasi */}
      <div className="col-map">
        <section className="map-frame" style={{ padding: '24px 24px 32px' }}>
          <div className="map-header">
            <div>
              <h2>
                <i className={`${ICON} ph-compass`} style={{ color: 'var(--cinnabar)', marginRight: 8, verticalAlign: '-2px' }} />
                Jalur Petualangan HSK
              </h2>
              <p className="map-sub">
                Jelajahi setiap pos pulau petualangan yang terhubung oleh jalur magis.
              </p>
            </div>

            {/* Toggle Mode: Peta Jalur Animasi vs Kartu Grid */}
            <div style={{ display: 'flex', gap: 6, background: '#F1F5F9', padding: 4, borderRadius: '9999px' }}>
              <button
                type="button"
                style={{
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: viewMode === 'animated' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'animated' ? 'var(--cinnabar)' : 'var(--ink-soft)',
                  boxShadow: viewMode === 'animated' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                }}
                onClick={() => {
                  setViewMode('animated')
                  clickTick(prefs.sound)
                }}
              >
                🎮 Peta Petualangan Game
              </button>
              <button
                type="button"
                style={{
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--cinnabar)' : 'var(--ink-soft)',
                  boxShadow: viewMode === 'grid' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                }}
                onClick={() => {
                  setViewMode('grid')
                  clickTick(prefs.sound)
                }}
              >
                📋 Tampilan Grid
              </button>
            </div>
          </div>

          {/* Mode 1: Animated Living RPG Expedition World Map */}
          {viewMode === 'animated' && (
            <GameWorldMap
              counts={counts}
              soundEnabled={prefs.sound}
              currentActiveStage={currentActiveStage}
            />
          )}

          {/* Mode 2: Outpost Cards Grid */}
          {viewMode === 'grid' && (
            <div className="path">
              <div className="path__grid">
                {[1, 2, 3, 4, 5, 6].map((l) => {
                  const s = counts[l] ?? { total: 0, due: 0, mastered: 0 }
                  const pct = s.total ? Math.round((s.mastered / s.total) * 100) : 0
                  const bloomedCount = Math.min(5, Math.round((pct / 100) * 5))
                  const active = s.due > 0 || (l === 1 && s.total > 0)

                  return (
                    <div
                      key={l}
                      className={`outpost ${active ? 'outpost--active' : 'outpost--dormant'}`}
                    >
                      <div className="outpost__top">
                        <Landmark level={l} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="outpost__name">
                            {OUTPOST_NAME[l]}
                            <span className="small">HSK {l}</span>
                          </div>
                          <span className="outpost__stats">
                            {s.due > 0 ? (
                              <b style={{ color: 'var(--cinnabar)' }}>{s.due} jatuh tempo</b>
                            ) : (
                              '0 jatuh tempo'
                            )}{' '}
                            · {s.mastered}/{s.total} mekar
                          </span>
                          <div className="bloom-bar">
                            <div className="bloom-bar__fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>

                      <p className="outpost__flavor">{FLAVOR[l]}</p>

                      {s.due > 0 && (
                        <span className="due-badge">
                          <i className="ph-fill ph-alarm" /> {s.due} jatuh tempo!
                        </span>
                      )}

                      <div className="plum-row" aria-label={`${bloomedCount} dari 5 bunga mekar`}>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Plum key={i} bloomed={i < bloomedCount} />
                        ))}
                      </div>

                      <div className="outpost__cta">
                        <Link
                          className={`btn ${active ? 'btn--primary' : 'btn--ghost'}`}
                          to={active ? `/session/${l}` : `/deck/${l}`}
                        >
                          {active ? 'Mulai Sesi' : 'Lihat Pos'}{' '}
                          <i className="ph-bold ph-arrow-right" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export function Deck() {
  const { level } = useParams()
  const lv = Number(level)
  const [words, setWords] = useState<{ hanzi: string }[]>([])

  useEffect(() => {
    db.vocab.where('level').equals(lv).limit(24).toArray().then((a) => setWords(a))
  }, [lv])

  return (
    <div className="card" style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Landmark level={lv} />
        <div>
          <h2>Deck HSK {lv} · {OUTPOST_NAME[lv]}</h2>
          <p className="small" style={{ marginTop: 4 }}>
            Salah bukan kegagalan — setiap kesalahan memperkuat ingatan goresan aksara.
          </p>
        </div>
      </div>

      <div className="btn-row" style={{ marginTop: 20 }}>
        <Link className="btn btn--primary" to={`/session/${lv}`}>
          <i className={`${ICON} ph-play`} /> Mulai sesi
        </Link>
        <Link className="btn btn--jade" to={`/drill/${lv}/tone`}>
          <i className={`${ICON} ph-lightning`} /> Drill nada
        </Link>
        <Link className="btn btn--ghost" to="/graph">
          <i className={`${ICON} ph-puzzle-piece`} /> Komponen
        </Link>
        <Link className="btn btn--ghost" to="/">
          <i className={`${ICON} ph-arrow-left`} /> Kembali ke peta
        </Link>
      </div>

      <div style={{ marginTop: 24 }}>
        <div className="field-label">
          <i className={`${ICON} ph-sparkle`} /> Intip Aksara di Pos Ini
        </div>
        <div className="garden" style={{ marginTop: 12 }}>
          {words.slice(0, 18).map((w) => (
            <span key={w.hanzi} className="sprout" title={w.hanzi}>
              <StrokeOrder char={w.hanzi} size={36} />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
