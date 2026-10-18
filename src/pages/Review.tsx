import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db, type MistakeNote, type Vocab } from '../lib/db'
import { StrokeOrder } from '../lib/fx'

export function Review() {
  const [rows, setRows] = useState<{ v: Vocab; n?: MistakeNote }[]>([])
  const [note, setNote] = useState<Record<number, string>>({})
  const [savedId, setSavedId] = useState<number | null>(null)

  const load = () => {
    db.vocab.where('leech').equals(1).toArray().then(async (leeches) => {
      const notes = await db.notes.toArray()
      const m = new Map(notes.map((n) => [n.vocabId, n]))
      const init: Record<number, string> = {}
      notes.forEach((n) => { init[n.vocabId] = n.note })
      setNote(init)
      setRows(leeches.map((v) => ({ v, n: m.get(v.id!) })))
    })
  }

  useEffect(load, [])

  const save = async (vocabId: number) => {
    const ex = await db.notes.where('vocabId').equals(vocabId).first()
    const txt = note[vocabId] ?? ''
    if (ex) await db.notes.update(ex.id!, { note: txt, updatedAt: Date.now() })
    else await db.notes.add({ vocabId, note: txt, fails: 3, updatedAt: Date.now() })
    setSavedId(vocabId)
    setTimeout(() => setSavedId(null), 1800)
  }

  const clear = async (v: Vocab) => {
    await db.vocab.update(v.id!, { leech: false, lapses: 0, interval: 1, due: Date.now(), updatedAt: Date.now() })
    load()
  }

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <i className="ph-duotone ph-bug-beetle" style={{ fontSize: 32, color: 'var(--cinnabar)' }} />
            <div>
              <h2>Ruang Leech · Kata Bandel</h2>
              <p className="small">
                Kata yang salah ≥3x disimpan di sini. Beri jembatan keledai (mnemonik) sampai jinak!
              </p>
            </div>
          </div>
          <Link className="btn btn--primary" to="/session/1">
            <i className="ph-duotone ph-play" /> Latih Sekarang
          </Link>
        </div>
      </div>

      <div className="quest-path" style={{ marginTop: 20 }}>
        {rows.map(({ v }) => (
          <div key={v.id} className="card">
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 56, height: 56 }}>
                <StrokeOrder char={v.hanzi} size={56} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <b style={{ fontSize: 24, fontFamily: 'var(--font-hanzi)' }}>{v.hanzi}</b>
                  <span className="pinyin-line" style={{ fontSize: 18, color: 'var(--cinnabar)' }}>{v.pinyin}</span>
                  <span className="pack-badge" style={{ padding: '2px 8px', fontSize: 11, marginLeft: 'auto' }}>
                    HSK {v.level}
                  </span>
                </div>
                <div className="small" style={{ marginTop: 2 }}>
                  Arti: <b>{v.meaning}</b> · Total salah {v.wrong}x (gagal {v.lapses}x beruntun)
                </div>
              </div>
            </div>

            <div className="example-box" style={{ margin: '14px 0' }}>
              <b>{v.example}</b>
              <br />
              <span className="small">{v.exampleMeaning}</span>
            </div>

            <div>
              <textarea
                className="input"
                rows={2}
                value={note[v.id!] ?? ''}
                onChange={(e) => setNote((s) => ({ ...s, [v.id!]: e.target.value }))}
                placeholder="Catatan mnemonik pribadi: Mengapa kata ini sulit? Mirip kata apa?"
                style={{ resize: 'vertical' }}
              />
              <div className="btn-row" style={{ marginTop: 10 }}>
                <button className="btn btn--jade" onClick={() => save(v.id!)}>
                  <i className="ph-duotone ph-floppy-disk" />
                  {savedId === v.id! ? 'Tersimpan!' : 'Simpan Catatan'}
                </button>
                <button className="btn btn--ochre" onClick={() => clear(v)}>
                  <i className="ph-duotone ph-check-circle" /> Sudah Jinak! Keluarkan
                </button>
              </div>
            </div>
          </div>
        ))}

        {!rows.length && (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <i className="ph-duotone ph-shield-check" style={{ fontSize: 48, color: 'var(--jade)', marginBottom: 8 }} />
            <h3>Ruang Leech Bersih!</h3>
            <p className="small" style={{ marginTop: 4 }}>
              Tidak ada kata bandel yang tersangkut. Seluruh kebun aksaramu tumbuh subur dan aman.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
