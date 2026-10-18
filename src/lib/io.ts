import { db, todayKey, type Vocab } from './db'
import { parsePinyin } from './pinyin'
import { defaultCard } from './srs'
import { validateRow } from './seed'

export function toCSV(rows: Vocab[]): string {
  const head = 'hanzi,pinyin,meaning,example,exampleMeaning,level,radical'
  const esc = (s: string | number = '') => `"${String(s).replace(/"/g, '""')}"`
  const lines = rows.map((v) => [v.hanzi, v.pinyin, v.meaning, v.example, v.exampleMeaning ?? '', v.level, v.radical ?? ''].map(esc).join(','))
  return [head, ...lines].join('\n')
}

function splitCSV(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++ } else q = false
      } else cur += c
    } else if (c === '"') q = true
    else if (c === ',') { out.push(cur); cur = '' }
    else cur += c
  }
  out.push(cur)
  return out
}

export function fromCSV(text: string): { rows: Record<string, string>[]; errors: string[] } {
  const lines = text.trim().split(/\r?\n/)
  const errors: string[] = []
  const rows: Record<string, string>[] = []
  if (!lines.length) return { rows, errors: ['kosong'] }
  const head = splitCSV(lines[0]).map((h) => h.trim())
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const cells = splitCSV(lines[i])
    const r: Record<string, string> = {}
    head.forEach((h, j) => { r[h] = (cells[j] ?? '').trim() })
    const e = validateRow(r)
    if (e) errors.push(`baris ${i + 1}: ${e}`)
    else rows.push(r)
  }
  return { rows, errors }
}

export function rowToVocab(r: Record<string, string>, now = Date.now()): Vocab {
  const p = parsePinyin(r.pinyin)
  return {
    hanzi: r.hanzi.trim(),
    pinyin: r.pinyin.trim(),
    pinyinBase: p.base,
    tones: p.tones,
    meaning: r.meaning.trim(),
    example: (r.example ?? '').trim(),
    exampleMeaning: (r.exampleMeaning ?? '').trim(),
    level: Number(r.level),
    radical: (r.radical ?? '').trim() || undefined,
    ...defaultCard(),
    due: now,
    updatedAt: now,
    createdAt: now,
  }
}

export async function importRows(rows: Record<string, string>[]): Promise<number> {
  const now = Date.now()
  const vocabs = rows.map((r) => rowToVocab(r, now))
  await db.vocab.bulkAdd(vocabs)
  return vocabs.length
}

export async function exportAll(): Promise<Vocab[]> {
  return db.vocab.toArray()
}

export async function bumpStats(reviews: number, correct: number, xp: number, isNew: boolean) {
  const date = todayKey()
  const cur = await db.stats.get(date)
  if (!cur) {
    await db.stats.add({ date, reviews, correct, newWords: isNew ? 1 : 0, xp })
  } else {
    await db.stats.update(date, {
      reviews: cur.reviews + reviews,
      correct: cur.correct + correct,
      newWords: cur.newWords + (isNew ? 1 : 0),
      xp: cur.xp + xp,
    })
  }
}

export function download(name: string, text: string, mime = 'application/json') {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
