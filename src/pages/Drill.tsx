import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { db, type Vocab } from '../lib/db'
import { findSimilar, shuffle, type SimKind } from '../lib/similar'
import { bumpStats } from '../lib/io'
import { usePrefs } from '../lib/state'
import { playErrorBuzz, playSuccessChime, speakHanzi } from '../lib/fx'

const KINDS: { id: SimKind; name: string; hint: string; icon: string }[] = [
  { id: 'tone', name: 'Jebakan Nada', hint: 'Bunyi sama, nada beda', icon: 'ph-music-notes' },
  { id: 'radical', name: 'Satu Atap', hint: 'Radikal sama', icon: 'ph-puzzle-piece' },
  { id: 'visual', name: 'Kembaran Mirip', hint: 'Bentuk aksara mirip', icon: 'ph-eye' },
]

export function Drill() {
  const { level, kind } = useParams()
  const lv = Number(level ?? 1) || 1
  const k = (kind as SimKind) || 'tone'
  const { prefs } = usePrefs()
  const [all, setAll] = useState<Vocab[]>([])
  const [qi, setQi] = useState(0)
  const [score, setScore] = useState(0)
  const [pick, setPick] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    db.vocab.where('level').equals(lv).toArray().then((a) => {
      setAll(a)
      setQi(0)
      setScore(0)
      setPick(null)
      setDone(false)
    })
  }, [lv, k])

  const rounds = useMemo(() => {
    if (all.length < 2) return []
    // Deduplicate all vocabulary by hanzi to prevent any duplicate source data
    const uniquePool = Array.from(new Map(all.map((v) => [v.hanzi, v])).values())
    const targets = shuffle(uniquePool).slice(0, 10)

    return targets.map((t) => {
      const foes = findSimilar(t, uniquePool, k, 6)
      const map = new Map<string, Vocab>()
      // Guarantee correct answer is present
      map.set(t.hanzi, t)

      for (const f of foes) {
        if (!map.has(f.hanzi)) {
          map.set(f.hanzi, f)
        }
        if (map.size >= 4) break
      }

      // If still fewer than 4 choices, fill from unique pool
      if (map.size < 4) {
        const remaining = shuffle(uniquePool.filter((v) => !map.has(v.hanzi)))
        for (const rem of remaining) {
          map.set(rem.hanzi, rem)
          if (map.size >= 4) break
        }
      }

      const opts = shuffle(Array.from(map.values()))
      return { t, opts }
    })
  }, [all, k])

  const cur = rounds[qi]

  const answer = async (id?: number) => {
    if (!cur || pick !== null) return
    setPick(id ?? -1)
    const ok = id === cur.t.id
    if (ok) {
      setScore((s) => s + 1)
      playSuccessChime(prefs.sound)
      speakHanzi(cur.t.hanzi)
    } else {
      playErrorBuzz(prefs.sound)
    }
    await bumpStats(1, ok ? 1 : 0, ok ? 12 : 2, false)

    setTimeout(() => {
      if (qi + 1 >= rounds.length) setDone(true)
      else {
        setQi((i) => i + 1)
        setPick(null)
      }
    }, 900)
  }

  if (!all.length) {
    return (
      <div className="card" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', padding: '48px 24px' }}>
        <i className="ph-duotone ph-book-open" style={{ fontSize: 44, color: 'var(--ochre)' }} />
        <h2 style={{ marginTop: 12 }}>Memuat data HSK {lv}…</h2>
        <p className="small" style={{ marginTop: 6 }}>Sedang menyiapkan aksara untuk latihan drill.</p>
        <div className="btn-row" style={{ justifyContent: 'center', marginTop: 20 }}>
          <Link className="btn btn--ghost" to="/">Kembali ke Peta</Link>
        </div>
      </div>
    )
  }

  if (!rounds.length) {
    return (
      <div className="card" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', padding: '48px 24px' }}>
        <h2>Jumlah kata belum cukup</h2>
        <p className="small" style={{ marginTop: 6 }}>Dibutuhkan minimal 2 kata di level ini untuk memulai drill.</p>
        <div className="btn-row" style={{ justifyContent: 'center', marginTop: 20 }}>
          <Link className="btn btn--ghost" to="/">Kembali</Link>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="card" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: 72, color: 'var(--cinnabar)', fontFamily: 'var(--font-hanzi)', marginBottom: 8 }}>
          辨
        </div>
        <h2>Drill Selesai! Skor: {score}/{rounds.length}</h2>
        <p className="small" style={{ marginTop: 8 }}>
          {score === rounds.length
            ? 'Luar biasa! Mata elang, semua jebakan teratasi sempurna.'
            : score >= 7
            ? 'Bagus sekali! Pemahaman aksaramu semakin terasah tajam.'
            : 'Tetap semangat! Melatih kontras bentuk & nada butuh pembiasaan bertahap.'}
        </p>
        <div className="btn-row" style={{ justifyContent: 'center', marginTop: 24 }}>
          <button
            className="btn btn--primary"
            onClick={() => {
              setQi(0)
              setScore(0)
              setPick(null)
              setDone(false)
            }}
          >
            <i className="ph-duotone ph-arrow-counter-clockwise" /> Ulangi Drill
          </button>
          <Link className="btn btn--jade" to={`/deck/${lv}`}>
            Deck HSK {lv}
          </Link>
          <Link className="btn btn--ghost" to="/">
            Peta
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="pack-badge">
          HSK {lv} · {KINDS.find((x) => x.id === k)?.name}
        </span>
        <span className="small">
          Soal <b>{qi + 1}</b> dari {rounds.length} · Skor: <b>{score}</b>
        </span>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '36px 24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          <div className="pinyin-line" style={{ fontSize: 36, margin: 0 }}>
            {cur.t.pinyin}
          </div>
          <button
            type="button"
            className="btn btn--ghost"
            style={{ padding: '6px 10px', borderRadius: '50%' }}
            onClick={() => speakHanzi(cur.t.hanzi)}
            title="Dengarkan pengucapan"
            aria-label="Dengarkan suara"
          >
            <i className="ph-duotone ph-speaker-high" style={{ color: 'var(--cinnabar)' }} />
          </button>
        </div>

        <div className="meaning-line" style={{ fontSize: 22, color: 'var(--ink)', marginTop: 8 }}>
          {cur.t.meaning}
        </div>
        <p className="small" style={{ marginTop: 4 }}>
          Pilih hanzi yang tepat! (Pengecoh: {KINDS.find((x) => x.id === k)?.hint})
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 14,
            marginTop: 28,
          }}
        >
          {cur.opts.map((o) => {
            const isT = o.id === cur.t.id
            const chosen = pick === o.id
            const wrong = pick !== null && chosen && !isT
            const show = pick !== null && isT

            return (
              <button
                key={`${o.id}-${o.hanzi}`}
                className="btn btn--ghost"
                style={{
                  fontFamily: 'var(--font-hanzi)',
                  fontSize: 40,
                  padding: '24px 12px',
                  borderRadius: 'var(--radius)',
                  background: show
                    ? 'linear-gradient(180deg, #10B981, #059669)'
                    : wrong
                    ? 'linear-gradient(180deg, #F43F5E, #E11D48)'
                    : undefined,
                  color: show || wrong ? '#FFFFFF' : undefined,
                  boxShadow: show
                    ? '0 4px 14px rgba(5, 150, 105, 0.4)'
                    : wrong
                    ? '0 4px 14px rgba(225, 29, 72, 0.4)'
                    : undefined,
                }}
                onClick={() => answer(o.id)}
                disabled={pick !== null}
              >
                {o.hanzi}
              </button>
            )
          })}
        </div>

        {pick !== null && (
          <div className="example-box" style={{ marginTop: 24 }}>
            <b>{cur.t.hanzi}</b> · {cur.t.pinyin} · {cur.t.meaning}
            <br />
            <span className="small">
              {cur.t.example} — {cur.t.exampleMeaning}
            </span>
          </div>
        )}
      </div>

      <div className="btn-row" style={{ justifyContent: 'center', marginTop: 18 }}>
        <Link className="btn btn--ghost" to={`/deck/${lv}`}>
          <i className="ph-duotone ph-x" /> Berhenti
        </Link>
      </div>
    </div>
  )
}

export function DrillHome() {
  return (
    <div className="card" style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <i className="ph-duotone ph-lightning" style={{ fontSize: 32, color: 'var(--cinnabar)' }} />
        <div>
          <h2>Drill Kata & Aksara Mirip</h2>
          <p className="small">
            Latih ketajaman membedakan aksara kembar, jebakan nada, dan pola radikal satu rumpun.
          </p>
        </div>
      </div>

      <div className="quest-path" style={{ marginTop: 24 }}>
        {[1, 2, 3, 4, 5, 6].map((l) => (
          <div key={l} className="quest-node">
            <span className="lvl">H{l}</span>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 16 }}>Pos HSK {l}</b>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {KINDS.map((kk) => (
                  <Link
                    key={kk.id}
                    className="btn btn--ghost"
                    style={{ padding: '6px 14px', fontSize: 13, borderRadius: '9999px' }}
                    to={`/drill/${l}/${kk.id}`}
                  >
                    <i className={`ph-duotone ${kk.icon}`} style={{ color: 'var(--cinnabar)' }} />
                    {kk.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
