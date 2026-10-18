import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db, type Vocab } from '../lib/db'
import { generateToneOptions, normBase, parsePinyin, type ToneOption } from '../lib/pinyin'
import { applySM2, gradeAnswer } from '../lib/srs'
import { bumpStats } from '../lib/io'
import { usePrefs } from '../lib/state'
import { playErrorBuzz, playSuccessChime, speakHanzi, StrokeOrder } from '../lib/fx'

type Phase = 'tone' | 'meaning' | 'done'
type InputMode = 'choice' | 'type'

interface MeaningOption {
  meaning: string
  isCorrect: boolean
}

export function Session() {
  const { level } = useParams()
  const lv = Number(level)
  const nav = useNavigate()
  const { prefs } = usePrefs()
  const [queue, setQueue] = useState<Vocab[]>([])
  const [vocabPool, setVocabPool] = useState<Vocab[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('tone')
  const [inputMode, setInputMode] = useState<InputMode>('choice')
  const [pinyinIn, setPinyinIn] = useState('')
  const [meaningIn, setMeaningIn] = useState('')
  const [selectedOption, setSelectedOption] = useState<ToneOption | null>(null)
  const [selectedMeaning, setSelectedMeaning] = useState<MeaningOption | null>(null)
  const [result, setResult] = useState<null | { pOk: boolean; tOk: boolean; mOk: boolean }>(null)
  const [shake, setShake] = useState(0)
  const [combo, setCombo] = useState(0)
  const [pops, setPops] = useState<{ id: number; txt: string; x: number; y: number }[]>([])
  const [confetti, setConfetti] = useState(false)
  const [showStroke, setShowStroke] = useState(true)
  const start = useRef(Date.now())
  const card = queue[idx]

  useEffect(() => {
    const now = Date.now()
    setIsLoaded(false)
    db.vocab.toArray().then((everything) => {
      setVocabPool(everything)
      const all = everything.filter((v) => v.level === lv)
      const due = all.filter((v) => v.due <= now).sort((a, b) => (b.leech ? 1 : 0) - (a.leech ? 1 : 0) || a.due - b.due)
      const fresh = all.filter((v) => v.due > now).sort((a, b) => a.due - b.due)
      const q = [...due, ...fresh].slice(0, prefs.target)
      setQueue(q.length ? q : all.slice(0, prefs.target))
      start.current = Date.now()
      setIsLoaded(true)
    })
  }, [lv, prefs.target])

  // Tone multiple-choice options for current card
  const toneOptions = useMemo(() => {
    if (!card) return []
    return generateToneOptions(card)
  }, [card?.id])

  // Random multiple-choice meaning options for current card (1 correct + 3 random distractors)
  const meaningOptions = useMemo(() => {
    if (!card) return []
    const correct = card.meaning
    const pool = vocabPool.length > 0 ? vocabPool : queue
    const otherMeanings = Array.from(
      new Set(
        pool
          .filter((v) => v.meaning !== correct && v.hanzi !== card.hanzi)
          .map((v) => v.meaning)
      )
    )
    const shuffledOthers = [...otherMeanings].sort(() => Math.random() - 0.5).slice(0, 3)
    const allChoices: MeaningOption[] = [
      { meaning: correct, isCorrect: true },
      ...shuffledOthers.map((m) => ({ meaning: m, isCorrect: false })),
    ]
    // Fill up to 4 if few items in db
    const fallbackList = ['makan', 'buku', 'teman', 'rumah', 'senang', 'bekerja', 'belajar', 'waktu', 'air', 'cantik']
    while (allChoices.length < 4) {
      const fb = fallbackList.find((f) => !allChoices.some((c) => c.meaning === f)) || `arti ${allChoices.length + 1}`
      allChoices.push({ meaning: fb, isCorrect: false })
    }
    return allChoices.sort(() => Math.random() - 0.5)
  }, [card?.id, vocabPool.length, queue.length])

  useEffect(() => {
    setPinyinIn('')
    setMeaningIn('')
    setSelectedOption(null)
    setSelectedMeaning(null)
    setResult(null)
    setPhase('tone')
  }, [idx, card?.id])

  if (isLoaded && queue.length === 0) {
    return (
      <div className="card session-container" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>📭</div>
        <h2>Pos HSK {lv} Belum Memiliki Kosakata</h2>
        <p className="small" style={{ marginTop: 8, maxWidth: 440, marginInline: 'auto' }}>
          Pos ini belum memiliki perbendaharaan kata aktif. Buka menu Impor Data untuk menambah kosakata atau kembali ke peta.
        </p>
        <div className="btn-row" style={{ justifyContent: 'center', marginTop: 24 }}>
          <Link className="btn btn--primary" to="/">
            <i className="ph-duotone ph-map-trifold" /> Kembali ke Peta
          </Link>
          <Link className="btn btn--ghost" to="/data">
            <i className="ph-duotone ph-database" /> Buka Menu Data
          </Link>
        </div>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="card session-container" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <i className="ph-duotone ph-coffee" style={{ fontSize: 48, color: 'var(--ochre)' }} />
        <h2 style={{ marginTop: 12 }}>Sedang menyiapkan kartu…</h2>
        <p className="small" style={{ marginTop: 6 }}>Memuat perbendaharaan kata HSK {lv}.</p>
        <div className="btn-row" style={{ justifyContent: 'center', marginTop: 20 }}>
          <Link className="btn btn--ghost" to="/">Kembali ke Peta</Link>
        </div>
      </div>
    )
  }

  // Handle tone choice selection (Duolingo style)
  const pickToneOption = (opt: ToneOption) => {
    setSelectedOption(opt)
    if (opt.isCorrect) {
      setResult({ pOk: true, tOk: true, mOk: false })
      playSuccessChime(prefs.sound)
      speakHanzi(card.hanzi)
      setTimeout(() => {
        setPhase('meaning')
      }, 400)
    } else {
      setShake((s) => s + 1)
      setResult({ pOk: true, tOk: false, mOk: false })
      playErrorBuzz(prefs.sound)
    }
  }

  // Handle meaning multiple choice selection
  const pickMeaningOption = (opt: MeaningOption) => {
    if (selectedMeaning) return
    setSelectedMeaning(opt)
    if (opt.isCorrect) {
      playSuccessChime(prefs.sound)
      setCombo((c) => c + 1)
      setTimeout(() => {
        submitAll(true)
      }, 550)
    } else {
      setShake((s) => s + 1)
      playErrorBuzz(prefs.sound)
      setCombo(0)
    }
  }

  // Handle manual typing
  const checkTypedPinyin = () => {
    let pOk = false
    let tOk = false
    try {
      const p = parsePinyin(pinyinIn)
      pOk = normBase(p.base) === normBase(card.pinyinBase)
      tOk =
        p.tones.length === card.tones.length &&
        p.tones.every((t, i) => t === card.tones[i])
      // Accept neutral tone fallback if applicable
      if (p.tones.some((t) => t === 5) && card.tones.includes(5)) tOk = true
    } catch {
      pOk = false
      tOk = false
    }

    if (!pOk || !tOk) {
      setShake((s) => s + 1)
      setResult({ pOk, tOk, mOk: false })
      playErrorBuzz(prefs.sound)
      return
    }

    setResult({ pOk: true, tOk: true, mOk: false })
    playSuccessChime(prefs.sound)
    speakHanzi(card.hanzi)
    setPhase('meaning')
  }

  const submitAll = async (forcedMeaningOk?: boolean) => {
    const r = result ?? { pOk: true, tOk: true, mOk: false }
    const mOk =
      forcedMeaningOk !== undefined
        ? forcedMeaningOk
        : selectedMeaning
        ? selectedMeaning.isCorrect
        : meaningIn.trim().toLowerCase().length > 0 &&
          card.meaning.toLowerCase().includes(meaningIn.trim().toLowerCase().slice(0, 3))

    const g = gradeAnswer(r.pOk, r.tOk, mOk)
    const patch = applySM2(card, g.quality)
    await db.vocab.update(card.id!, { ...patch, updatedAt: Date.now() })
    await db.reviews.add({
      vocabId: card.id!,
      ts: Date.now(),
      quality: g.quality,
      pinyinOk: r.pOk,
      toneOk: r.tOk,
      meaningOk: mOk,
      durationMs: Date.now() - start.current,
    })

    if (g.quality < 3) {
      const ex = await db.notes.where('vocabId').equals(card.id!).first()
      if (ex) await db.notes.update(ex.id!, { fails: ex.fails + 1, updatedAt: Date.now(), note: ex.note })
      else await db.notes.add({ vocabId: card.id!, note: `sulit: ${card.hanzi} (${card.pinyin})`, fails: 1, updatedAt: Date.now() })
      setCombo(0)
      setShake((s) => s + 1)
      playErrorBuzz(prefs.sound)
    } else {
      setCombo((c) => c + 1)
      playSuccessChime(prefs.sound)
    }

    const xp = g.quality === 5 ? 20 : g.quality === 3 ? 10 : 2
    await bumpStats(1, g.quality >= 3 ? 1 : 0, prefs.arcade ? xp : Math.round(xp / 2), card.reps === 0)

    if (prefs.arcade && g.quality >= 3) {
      const id = Date.now()
      setPops((p) => [...p, { id, txt: `+${xp} XP`, x: 50 + (Math.random() * 20 - 10), y: 35 }])
      setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 900)

      if ((combo + 1) % 5 === 0) {
        setConfetti(true)
        setTimeout(() => setConfetti(false), 1400)
      }
    }

    if (idx + 1 >= queue.length) {
      setPhase('done')
    } else {
      setIdx((i) => i + 1)
      start.current = Date.now()
    }
  }

  if (phase === 'done') {
    return (
      <div className="card session-container" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: 72, color: 'var(--cinnabar)', fontFamily: 'var(--font-hanzi)', marginBottom: 8 }}>
          完
        </div>
        <h2>Sesi Selesai! Otak Mekar.</h2>
        <p className="small" style={{ marginTop: 8 }}>
          Kamu telah menuntaskan <b>{queue.length} kartu</b> · Kombo tertinggi <b>{combo}x</b>.
        </p>

        <div className="btn-row" style={{ justifyContent: 'center', marginTop: 28 }}>
          <button className="btn btn--primary" onClick={() => nav('/')}>
            <i className="ph-duotone ph-map-trifold" /> Kembali ke Peta
          </button>
          <Link className="btn btn--jade" to="/review">
            <i className="ph-duotone ph-bug-beetle" /> Ulas Leech
          </Link>
          <Link className="btn btn--ochre" to="/stats">
            <i className="ph-duotone ph-plant" /> Kebun & Statistik
          </Link>
        </div>
      </div>
    )
  }

  const progressPct = Math.round(((idx + 1) / queue.length) * 100)

  return (
    <div className="session-container">
      {pops.map((p) => (
        <div key={p.id} className="xp-pop" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          {p.txt}
        </div>
      ))}

      {confetti && (
        <div className="confetti">
          {Array.from({ length: 40 }).map((_, i) => (
            <i
              key={i}
              style={{
                left: `${(i * 37) % 100}%`,
                top: '-10px',
                background: ['#E11D48', '#059669', '#F59E0B', '#6366F1'][i % 4],
                animationDelay: `${(i % 10) * 0.05}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Top Session Progress Bar */}
      <div className="session-progress">
        <span className="small">
          Kartu <b>{idx + 1}</b> / {queue.length}
        </span>
        <div className="session-progress__bar">
          <div className="session-progress__fill" style={{ width: `${progressPct}%` }} />
        </div>
        {combo > 1 && (
          <span className="combo-pill">
            <i className="ph-fill ph-fire" style={{ color: '#D97706' }} /> {combo}x
          </span>
        )}
      </div>

      {/* Main Flashcard */}
      <div key={`${card.id}-${shake}`} className={`hanzi-hero ${shake ? 'shake' : ''}`}>
        {/* Full Hanzi Display with multi-character stroke animation */}
        {showStroke ? (
          <div style={{ marginBottom: 14 }}>
            <StrokeOrder char={card.hanzi} size={90} />
          </div>
        ) : (
          <div className="hanzi-big" style={{ fontSize: card.hanzi.length > 2 ? 64 : 84 }}>
            {card.hanzi}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 4 }}>
          {card.radical && (
            <span className="pack-badge" style={{ padding: '4px 10px', fontSize: 12 }}>
              Radikal: {card.radical}
            </span>
          )}
          <button
            type="button"
            className="btn btn--ghost"
            style={{ padding: '4px 10px', fontSize: 12, borderRadius: '9999px' }}
            onClick={() => setShowStroke(!showStroke)}
          >
            <i className="ph-duotone ph-pen-nib" /> {showStroke ? 'Font Standar' : 'Animasi Goresan'}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            style={{ padding: '4px 12px', fontSize: 12, borderRadius: '9999px', color: 'var(--cinnabar)' }}
            onClick={() => speakHanzi(card.hanzi)}
            title="Dengarkan pelafalan Mandarin"
          >
            <i className="ph-duotone ph-speaker-high" /> Suara
          </button>
        </div>

        {/* Phase 1: Tone & Pinyin Quiz */}
        {phase === 'tone' && (
          <div style={{ marginTop: 24, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div className="field-label" style={{ margin: 0 }}>
                <i className="ph-duotone ph-music-notes" /> Pilih nada & pinyin yang benar:
              </div>

              {/* Mode Switcher: Duolingo Choice vs Keyboard Typing */}
              <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', padding: 3, borderRadius: '9999px' }}>
                <button
                  type="button"
                  style={{
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: inputMode === 'choice' ? '#FFFFFF' : 'transparent',
                    color: inputMode === 'choice' ? 'var(--cinnabar)' : 'var(--ink-soft)',
                    boxShadow: inputMode === 'choice' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  }}
                  onClick={() => setInputMode('choice')}
                >
                  Pilihan Ganda
                </button>
                <button
                  type="button"
                  style={{
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: inputMode === 'type' ? '#FFFFFF' : 'transparent',
                    color: inputMode === 'type' ? 'var(--cinnabar)' : 'var(--ink-soft)',
                    boxShadow: inputMode === 'type' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  }}
                  onClick={() => setInputMode('type')}
                >
                  Ketik Bebas
                </button>
              </div>
            </div>

            {/* Mode A: Duolingo-style 4 Tone Choices */}
            {inputMode === 'choice' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 12,
                }}
              >
                {toneOptions.map((opt, i) => {
                  const isSelected = selectedOption === opt
                  const isWrong = isSelected && !opt.isCorrect
                  const isRight = isSelected && opt.isCorrect

                  return (
                    <button
                      key={i}
                      type="button"
                      className="btn btn--ghost"
                      style={{
                        padding: '16px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        borderRadius: 'var(--radius)',
                        background: isRight
                          ? 'linear-gradient(180deg, #10B981, #059669)'
                          : isWrong
                          ? 'linear-gradient(180deg, #F43F5E, #E11D48)'
                          : undefined,
                        color: isRight || isWrong ? '#FFFFFF' : undefined,
                        boxShadow: isRight
                          ? '0 4px 12px rgba(5, 150, 105, 0.4)'
                          : isWrong
                          ? '0 4px 12px rgba(225, 29, 72, 0.4)'
                          : undefined,
                      }}
                      onClick={() => pickToneOption(opt)}
                    >
                      <span style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-ui), system-ui, sans-serif' }}>
                        {opt.pinyin}
                      </span>
                      <small style={{ fontSize: 11, opacity: 0.85, fontWeight: 700 }}>
                        Nada: {opt.tones.join(' ')} ({opt.label})
                      </small>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Mode B: Manual Typing Mode */}
            {inputMode === 'type' && (
              <div>
                <input
                  className="input"
                  value={pinyinIn}
                  onChange={(e) => setPinyinIn(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') checkTypedPinyin()
                  }}
                  placeholder="Ketik pinyin bernada (cth: ni3 hao3 atau nǐ hǎo)..."
                  autoFocus
                />
                <div style={{ marginTop: 12 }}>
                  <button className="btn btn--primary" style={{ width: '100%' }} onClick={checkTypedPinyin}>
                    Periksa Jawaban <i className="ph-bold ph-arrow-right" />
                  </button>
                </div>
              </div>
            )}

            {result && (!result.pOk || !result.tOk) && (
              <div className="example-box" style={{ marginTop: 16 }}>
                <b>Belum pas!</b> Jawaban yang tepat: <i>{card.pinyin}</i> (nada {card.tones.join(' ')}).
                Dengarkan intonasi dengan menekan tombol 🔊 di atas.
              </div>
            )}
          </div>
        )}

        {/* Phase 2: Meaning Multiple Choice (Pilgan) */}
        {phase === 'meaning' && (
          <div style={{ marginTop: 24, textAlign: 'left' }}>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <div className="pinyin-line">{card.pinyin}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label className="field-label" style={{ margin: 0 }}>
                <i className="ph-duotone ph-translate" /> Pilih arti yang tepat dalam Bahasa Indonesia:
              </label>
            </div>

            {/* 4 Multiple Choice Pilgan Options */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                marginTop: 6,
              }}
            >
              {meaningOptions.map((opt, i) => {
                const isSelected = selectedMeaning?.meaning === opt.meaning
                const showSuccess = selectedMeaning && opt.isCorrect
                const showError = isSelected && !opt.isCorrect

                return (
                  <button
                    key={`${opt.meaning}-${i}`}
                    type="button"
                    className="btn btn--choice"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px 12px',
                      minHeight: 72,
                      textAlign: 'center',
                      fontSize: 16,
                      fontWeight: 700,
                      borderRadius: 'var(--radius)',
                      background: showSuccess
                        ? 'linear-gradient(180deg, #10B981, #059669)'
                        : showError
                        ? 'linear-gradient(180deg, #F43F5E, #E11D48)'
                        : undefined,
                      color: showSuccess || showError ? '#FFFFFF' : 'var(--ink)',
                      boxShadow: showSuccess
                        ? '0 4px 12px rgba(5, 150, 105, 0.4)'
                        : showError
                        ? '0 4px 12px rgba(225, 29, 72, 0.4)'
                        : undefined,
                      transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      borderColor: showSuccess ? '#059669' : showError ? '#E11D48' : undefined,
                      cursor: selectedMeaning ? 'default' : 'pointer',
                    }}
                    onClick={() => pickMeaningOption(opt)}
                    disabled={selectedMeaning !== null}
                  >
                    <span>{opt.meaning}</span>
                  </button>
                )
              })}
            </div>

            {/* Example sentence box */}
            <div className="example-box" style={{ marginTop: 16 }}>
              <b>{card.example}</b>
              <br />
              <span className="small">{card.exampleMeaning}</span>
            </div>

            {/* If wrong choice selected, show feedback & continue button */}
            {selectedMeaning && !selectedMeaning.isCorrect && (
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#FFF1F2',
                    border: '1.5px solid #FDA4AF',
                    borderRadius: 'var(--radius-sm)',
                    color: '#BE123C',
                    fontSize: 14,
                    marginBottom: 12,
                  }}
                >
                  <b>Belum tepat!</b> Arti yang benar adalah: <b>{card.meaning}</b>.
                </div>
                <button
                  type="button"
                  className="btn btn--primary"
                  style={{ width: '100%', padding: '12px 20px', fontSize: 15 }}
                  onClick={() => submitAll(false)}
                >
                  Lanjut ke Kartu Berikutnya <i className="ph-bold ph-arrow-right" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="btn-row" style={{ justifyContent: 'center', marginTop: 18 }}>
        <Link className="btn btn--ghost" to="/">
          <i className="ph-duotone ph-x" /> Selesai Lebih Awal
        </Link>
      </div>
    </div>
  )
}
