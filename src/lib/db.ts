import Dexie, { type Table } from 'dexie'

export interface Vocab {
  id?: number
  hanzi: string
  pinyinBase: string
  pinyin: string
  tones: number[]
  meaning: string
  example: string
  exampleMeaning?: string
  level: number
  radical?: string
  ease: number
  interval: number
  due: number
  reps: number
  lapses: number
  correct: number
  wrong: number
  leech: boolean
  mastered: boolean
  updatedAt: number
  createdAt: number
}

export interface ReviewLog {
  id?: number
  vocabId: number
  ts: number
  quality: number
  pinyinOk: boolean
  toneOk: boolean
  meaningOk: boolean
  durationMs: number
}

export interface MistakeNote {
  id?: number
  vocabId: number
  note: string
  fails: number
  updatedAt: number
}

export interface StatsDay {
  date: string
  reviews: number
  correct: number
  newWords: number
  xp: number
}

class HanziDB extends Dexie {
  vocab!: Table<Vocab, number>
  reviews!: Table<ReviewLog, number>
  notes!: Table<MistakeNote, number>
  stats!: Table<StatsDay, string>

  constructor() {
    super('hanzi-quest')
    this.version(1).stores({
      vocab: '++id, hanzi, level, due, leech, mastered',
      reviews: '++id, vocabId, ts',
      notes: '++id, vocabId',
      stats: 'date',
    })
  }
}

export const db = new HanziDB()
export const todayKey = (d = new Date()) => d.toISOString().slice(0, 10)
