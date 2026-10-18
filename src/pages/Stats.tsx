import { useEffect, useState } from 'react'
import { db, type StatsDay } from '../lib/db'

export function Stats() {
  const [days, setDays] = useState<StatsDay[]>([])
  const [due, setDue] = useState(0)
  const [mastered, setMastered] = useState<string[]>([])
  const [acc, setAcc] = useState<Record<number, { c: number; t: number }>>({})

  useEffect(() => {
    db.stats.orderBy('date').reverse().limit(14).toArray().then((d) => setDays(d.reverse()))
    const now = Date.now()
    db.vocab.toArray().then((all) => {
      setDue(all.filter((v) => v.due <= now).length)
      setMastered(all.filter((v) => v.mastered).map((v) => v.hanzi).slice(0, 80))
    })
    db.reviews.orderBy('ts').reverse().limit(300).toArray().then(async (rs) => {
      const ids = [...new Set(rs.map((r) => r.vocabId))]
      const vs = await db.vocab.bulkGet(ids)
      const m = new Map(vs.filter(Boolean).map((v) => [v!.id!, v!.level]))
      const a: Record<number, { c: number; t: number }> = {}
      for (const r of rs) {
        const lv = m.get(r.vocabId) ?? 0
        a[lv] ??= { c: 0, t: 0 }
        a[lv].t += 1
        if (r.quality >= 3) a[lv].c += 1
      }
      setAcc(a)
    })
  }, [])

  const streak = (() => {
    let s = 0
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].reviews > 0) s += 1
      else if (i !== days.length - 1) break
    }
    return s
  })()

  const totalRev = days.reduce((a, d) => a + d.reviews, 0)
  const totalOk = days.reduce((a, d) => a + d.correct, 0)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Overview & Metric Cards */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <i className="ph-duotone ph-plant" style={{ fontSize: 32, color: 'var(--jade)' }} />
          <div>
            <h2>Kebun Aksara & Statistik</h2>
            <p className="small">
              Setiap kata yang kamu kuasai (mastered) menjadi bunga mekar di kebun petualanganmu.
            </p>
          </div>
        </div>

        <div className="stat-grid" style={{ marginTop: 22 }}>
          <div className="stat">
            <span className="small">Jatuh Tempo Hari Ini</span>
            <b style={{ color: due > 0 ? 'var(--cinnabar)' : 'var(--ink)' }}>{due}</b>
          </div>
          <div className="stat">
            <span className="small">Rentetan Hari (Streak)</span>
            <b style={{ color: '#D97706' }}>🔥 {streak} hari</b>
          </div>
          <div className="stat">
            <span className="small">Ulasan 14 Hari Terakhir</span>
            <b>{totalRev} kata</b>
          </div>
          <div className="stat">
            <span className="small">Rata-rata Akurasi</span>
            <b style={{ color: 'var(--jade)' }}>{totalRev ? Math.round((totalOk / totalRev) * 100) : 0}%</b>
          </div>
        </div>
      </div>

      {/* Petak Kebun Bunga Mekar */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3>Petak Bunga Aksara ({mastered.length} Mekar)</h3>
            <p className="small">Kata yang telah mekar (mastered: 4x benar berturut-turut + interval ≥14 hari).</p>
          </div>
          <span className="pack-badge" style={{ background: '#ECFDF5', borderColor: '#A7F3D0', color: '#065F46' }}>
            🌸 Tumbuh Subur
          </span>
        </div>

        <div className="garden" style={{ marginTop: 18 }}>
          {mastered.map((h) => (
            <span key={h} className="sprout" style={{ gap: 6 }}>
              <span>🌸</span>
              <span>{h}</span>
            </span>
          ))}
        </div>

        {!mastered.length && (
          <p className="small" style={{ marginTop: 14 }}>
            Belum ada aksara yang mekar sempurna. Teruslah menyiram kata dengan berlatih setiap hari!
          </p>
        )}
      </div>

      {/* Akurasi per Level HSK */}
      <div className="card">
        <h3>Akurasi Berdasarkan Pos HSK (300 Ulasan Terakhir)</h3>
        <p className="small">Performa ketepatan ingatan aksaramu di setiap tingkatan pos.</p>

        <div className="stat-grid" style={{ marginTop: 18 }}>
          {[1, 2, 3, 4, 5, 6].map((l) => {
            const s = acc[l]
            const pct = s && s.t ? Math.round((s.c / s.t) * 100) : null
            return (
              <div key={l} className="stat">
                <span className="small">Pos HSK {l}</span>
                <b style={{ color: pct !== null && pct >= 80 ? 'var(--jade)' : 'var(--ink)' }}>
                  {pct !== null ? `${pct}%` : '—'}
                </b>
                <span className="small" style={{ marginTop: 4 }}>
                  {s?.t ?? 0} ulasan selesai
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabel Riwayat 14 Hari */}
      <div className="card">
        <h3>Riwayat Belajar 14 Hari Terakhir</h3>
        <div style={{ overflowX: 'auto', marginTop: 16 }}>
          <table className="data">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Kartu Diulas</th>
                <th>Jawaban Benar</th>
                <th>Akurasi</th>
                <th>XP Diperoleh</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => {
                const dayPct = d.reviews ? Math.round((d.correct / d.reviews) * 100) : 0
                return (
                  <tr key={d.date}>
                    <td><b>{d.date}</b></td>
                    <td>{d.reviews} kartu</td>
                    <td>{d.correct} benar</td>
                    <td>
                      <span
                        className="pack-badge"
                        style={{
                          padding: '2px 8px',
                          fontSize: 12,
                          background: dayPct >= 75 ? '#ECFDF5' : '#FFF1F2',
                          color: dayPct >= 75 ? '#065F46' : '#BE123C',
                          borderColor: 'transparent',
                        }}
                      >
                        {dayPct}%
                      </span>
                    </td>
                    <td style={{ color: '#D97706', fontWeight: 700 }}>+{d.xp} XP</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
