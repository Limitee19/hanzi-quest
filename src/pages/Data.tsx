import { useEffect, useRef, useState } from 'react'
import { db } from '../lib/db'
import { download, exportAll, fromCSV, importRows, toCSV } from '../lib/io'
import { syncSeed } from '../lib/seed'
import { parsePinyin } from '../lib/pinyin'
import { defaultCard } from '../lib/srs'
import { StrokeOrder } from '../lib/fx'

export function Data() {
  const [count, setCount] = useState(0)
  const [msg, setMsg] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [form, setForm] = useState({
    hanzi: '',
    pinyin: '',
    meaning: '',
    example: '',
    exampleMeaning: '',
    level: '1',
    radical: '',
  })
  const file = useRef<HTMLInputElement>(null)

  const refresh = () => {
    db.vocab.count().then(setCount)
  }
  useEffect(() => {
    refresh()
  }, [])

  const addManual = async () => {
    if (!form.hanzi.trim() || !form.pinyin.trim() || !form.meaning.trim()) {
      setMsg('Hanzi, pinyin, dan arti wajib diisi!')
      return
    }
    const p = parsePinyin(form.pinyin)
    const now = Date.now()
    await db.vocab.add({
      hanzi: form.hanzi.trim(),
      pinyin: form.pinyin.trim(),
      pinyinBase: p.base,
      tones: p.tones,
      meaning: form.meaning.trim(),
      example: form.example.trim(),
      exampleMeaning: form.exampleMeaning.trim(),
      level: Number(form.level),
      radical: form.radical.trim() || undefined,
      ...defaultCard(),
      due: now,
      updatedAt: now,
      createdAt: now,
    })
    setForm({
      hanzi: '',
      pinyin: '',
      meaning: '',
      example: '',
      exampleMeaning: '',
      level: '1',
      radical: '',
    })
    setMsg('Aksara baru berhasil ditambahkan ke perbendaharaan!')
    refresh()
  }

  const onFile = async (f: File) => {
    const text = await f.text()
    if (f.name.endsWith('.json')) {
      try {
        const arr = JSON.parse(text)
        const rows = (Array.isArray(arr) ? arr : []).map((r) => ({
          hanzi: String(r.hanzi ?? ''),
          pinyin: String(r.pinyin ?? ''),
          meaning: String(r.meaning ?? ''),
          example: String(r.example ?? ''),
          exampleMeaning: String(r.exampleMeaning ?? ''),
          level: String(r.level ?? '1'),
          radical: String(r.radical ?? ''),
        }))
        const n = await importRows(rows)
        setMsg(`Berhasil mengimpor ${n} kata dari berkas JSON.`)
        refresh()
      } catch {
        setMsg('Format JSON tidak valid atau rusak.')
      }
    } else {
      const { rows, errors } = fromCSV(text)
      const n = await importRows(rows)
      setMsg(`Berhasil mengimpor ${n} kata dari CSV.${errors.length ? ` (Catatan: ${errors.slice(0, 2).join(' | ')})` : ''}`)
      refresh()
    }
  }

  const handleSyncSeed = async () => {
    setSyncing(true)
    try {
      const r = await syncSeed()
      setMsg(`Sinkronisasi selesai: +${r.added} kata baru ditambahkan (total ${r.total} kata).`)
      refresh()
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Overview & Cadangan Data */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span
              className="action-card__icon"
              style={{ width: 48, height: 48, background: 'var(--ochre-soft)', color: 'var(--ochre)', fontSize: 24 }}
            >
              <i className="ph-duotone ph-database" />
            </span>
            <div>
              <h2>Pusat Data & Cadangan</h2>
              <p className="small">
                Seluruh data kosakata dan riwayat latihan tersimpan lokal di perangkatmu (IndexedDB).
              </p>
            </div>
          </div>
          <span className="pack-badge">
            <i className="ph-duotone ph-backpack" />
            <b>{count}</b> kata tersimpan
          </span>
        </div>

        <div className="btn-row" style={{ marginTop: 22 }}>
          <button
            className="btn btn--jade"
            onClick={async () => {
              const a = await exportAll()
              download(`hanzi-quest-${Date.now()}.json`, JSON.stringify(a, null, 2))
            }}
          >
            <i className="ph-duotone ph-file-code" /> Ekspor JSON
          </button>
          <button
            className="btn btn--ochre"
            onClick={async () => {
              const a = await exportAll()
              download(`hanzi-quest-${Date.now()}.csv`, toCSV(a), 'text/csv')
            }}
          >
            <i className="ph-duotone ph-file-csv" /> Ekspor CSV
          </button>
          <button className="btn btn--ghost" onClick={() => file.current?.click()}>
            <i className="ph-duotone ph-upload-simple" /> Impor Berkas
          </button>
          <button className="btn btn--ghost" disabled={syncing} onClick={handleSyncSeed}>
            <i className={`ph-duotone ${syncing ? 'ph-spinner' : 'ph-arrows-clockwise'}`} />{' '}
            {syncing ? 'Menyinkronkan…' : 'Sinkronkan Seed HSK 1'}
          </button>
          <input
            ref={file}
            type="file"
            accept=".json,.csv"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFile(f)
            }}
          />
        </div>

        {msg && (
          <div className="example-box" style={{ marginTop: 18 }}>
            <i className="ph-duotone ph-info" style={{ marginRight: 6 }} />
            {msg}
          </div>
        )}
      </div>

      {/* Tambah Kosakata Manual dengan Live Preview */}
      <div className="card">
        <h3>Tambah Kosakata Manual</h3>
        <p className="small" style={{ marginTop: 4 }}>
          Punya kata baru yang ingin kamu pelajari? Tambahkan ke dalam pos petualanganmu.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: form.hanzi ? '1fr 240px' : '1fr',
            gap: 24,
            alignItems: 'start',
            marginTop: 20,
          }}
        >
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label className="field-label" style={{ marginTop: 0 }}>
                Karakter Hanzi (Aksara Mandarin)
              </label>
              <input
                className="input"
                placeholder="cth: 学 (xué)"
                value={form.hanzi}
                onChange={(e) => setForm({ ...form, hanzi: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="field-label" style={{ marginTop: 0 }}>
                  Pinyin Bernada
                </label>
                <input
                  className="input"
                  placeholder="cth: xué atau xue2"
                  value={form.pinyin}
                  onChange={(e) => setForm({ ...form, pinyin: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label" style={{ marginTop: 0 }}>
                  Arti Bahasa Indonesia
                </label>
                <input
                  className="input"
                  placeholder="cth: belajar / menuntut ilmu"
                  value={form.meaning}
                  onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="field-label" style={{ marginTop: 0 }}>
                  Contoh Kalimat Mandarin
                </label>
                <input
                  className="input"
                  placeholder="cth: 我在学习汉语。"
                  value={form.example}
                  onChange={(e) => setForm({ ...form, example: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label" style={{ marginTop: 0 }}>
                  Arti Kalimat Contoh
                </label>
                <input
                  className="input"
                  placeholder="cth: Saya sedang belajar bahasa Mandarin."
                  value={form.exampleMeaning}
                  onChange={(e) => setForm({ ...form, exampleMeaning: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="field-label" style={{ marginTop: 0 }}>
                  Tingkatan Pos HSK
                </label>
                <select
                  className="input"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                >
                  {[1, 2, 3, 4, 5, 6].map((l) => (
                    <option key={l} value={l}>
                      Pos HSK {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label" style={{ marginTop: 0 }}>
                  Radikal (Opsional)
                </label>
                <input
                  className="input"
                  placeholder="cth: 孑"
                  value={form.radical}
                  onChange={(e) => setForm({ ...form, radical: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <button className="btn btn--primary" onClick={addManual}>
                <i className="ph-duotone ph-plus-circle" /> Simpan Kata ke Pos HSK {form.level}
              </button>
            </div>
          </div>

          {/* Live Preview Card */}
          {form.hanzi && (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '24px 16px',
                background: '#F8FAFC',
                border: '1.5px dashed var(--border-hover)',
              }}
            >
              <span className="small" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Pratinjau Kartu
              </span>
              <div style={{ margin: '14px 0' }}>
                <StrokeOrder char={form.hanzi} size={72} />
              </div>
              <div className="pinyin-line" style={{ fontSize: 22, margin: '4px 0' }}>
                {form.pinyin || '—'}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{form.meaning || '—'}</div>
              {form.example && (
                <div className="example-box" style={{ marginTop: 14, fontSize: 13 }}>
                  <b>{form.example}</b>
                  <br />
                  <span className="small">{form.exampleMeaning}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
