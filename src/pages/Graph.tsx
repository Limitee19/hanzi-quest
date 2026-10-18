import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { db, type Vocab } from '../lib/db'
import { groupByRadical } from '../lib/similar'
import { StrokeOrder } from '../lib/fx'

export function Graph() {
  const [level, setLevel] = useState(1)
  const [all, setAll] = useState<Vocab[]>([])
  const [sel, setSel] = useState<string | null>(null)

  useEffect(() => {
    db.vocab.where('level').equals(level).toArray().then((a) => {
      setAll(a)
      setSel(null)
    })
  }, [level])

  const groups = useMemo(() => groupByRadical(all), [all])
  const active = groups.find((g) => g.radical === sel)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <i className="ph-duotone ph-puzzle-piece" style={{ fontSize: 32, color: 'var(--jade)' }} />
          <div>
            <h2>Peta Komponen & Radikal</h2>
            <p className="small">
              Kenali pola satu keluarga aksara. Memahami radikal membantu menghafal ratusan kata secara logis.
            </p>
          </div>
        </div>

        {/* Level Selector Tabs */}
        <div className="segmented" style={{ maxWidth: 480, margin: '20px 0' }}>
          {[1, 2, 3, 4, 5, 6].map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={l === level}
              onClick={() => setLevel(l)}
            >
              HSK {l}
            </button>
          ))}
        </div>

        {/* Radical Badges Grid */}
        <div className="garden" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))' }}>
          {groups.map((g) => (
            <button
              key={g.radical}
              className="sprout"
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                background: sel === g.radical ? 'var(--cinnabar)' : undefined,
                color: sel === g.radical ? '#FFFFFF' : undefined,
                borderColor: sel === g.radical ? 'var(--cinnabar-shadow)' : undefined,
              }}
              onClick={() => setSel(g.radical)}
              title={`${g.radical} · ${g.words.length} kata`}
            >
              <span style={{ fontFamily: 'var(--font-hanzi)', fontSize: 26, lineHeight: 1.1 }}>
                {g.radical}
              </span>
              <span style={{ fontSize: 11, opacity: 0.85 }}>×{g.words.length}</span>
            </button>
          ))}
        </div>

        {!groups.length && (
          <p className="small" style={{ marginTop: 14 }}>
            Deck HSK {level} masih kosong. Kamu bisa menyinkronkan seed di halaman Data.
          </p>
        )}
      </div>

      {active && (
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span
              className="chop"
              style={{ width: 36, height: 36, fontSize: 20, borderRadius: 8 }}
            >
              {active.radical}
            </span>
            <div>
              <h3>Keluarga Radikal {active.radical}</h3>
              <p className="small">Ditemukan {active.words.length} kata dengan radikal ini di HSK {level}.</p>
            </div>
          </div>

          <div className="quest-path">
            {active.words.slice(0, 30).map((w) => (
              <Link key={w.id} className="quest-node" to={`/session/${w.level}`}>
                <div style={{ width: 48, height: 48 }}>
                  <StrokeOrder char={w.hanzi} size={48} />
                </div>
                <div>
                  <b style={{ fontSize: 18, fontFamily: 'var(--font-hanzi)' }}>{w.hanzi}</b>
                  <div className="small" style={{ marginTop: 2 }}>
                    {w.pinyin} · {w.meaning}
                  </div>
                </div>
                <span style={{ marginLeft: 'auto', color: 'var(--ink-soft)' }}>
                  <i className="ph-bold ph-arrow-right" />
                </span>
              </Link>
            ))}
          </div>

          {active.words.length > 30 && (
            <p className="small" style={{ marginTop: 14, textAlign: 'center' }}>
              + {active.words.length - 30} kata lainnya. Ketuk salah satu untuk melatihnya di sesi belajar.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
