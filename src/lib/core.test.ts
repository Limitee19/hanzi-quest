import { describe, expect, it } from 'vitest'
import { parsePinyin, comparePinyin } from './pinyin'
import { applySM2, gradeAnswer } from './srs'
import { findSimilar, groupByRadical, shuffle } from './similar'
import type { Vocab } from './db'

describe('pinyin', () => {
  it('parse nada', () => {
    expect(parsePinyin('nǐ hǎo')).toEqual({ base: 'ni hao', tones: [3, 3] })
  })
  it('beda pinyin vs nada', () => {
    expect(comparePinyin('ni hao', [3, 3], 'ni hao', [3, 3])).toEqual({ pinyinOk: true, toneOk: true })
    expect(comparePinyin('ni hao', [3, 2], 'ni hao', [3, 3]).toneOk).toBe(false)
  })
})

describe('srs', () => {
  it('benar naik interval, salah reset + leech', () => {
    const base = { ease: 2.5, interval: 6, reps: 2, lapses: 0, correct: 0, wrong: 0 }
    const ok = applySM2(base as never, 5)
    expect(ok.reps).toBe(3)
    expect(ok.interval! > 6).toBe(true)
    const badBase = { ease: 2.5, interval: 6, reps: 2, lapses: 2, correct: 0, wrong: 0 }
    const bad = applySM2(badBase as never, 0)
    expect(bad.reps).toBe(0)
    expect(bad.leech).toBe(true)
  })
  it('grade 3 aspek', () => {
    expect(gradeAnswer(true, true, true).quality).toBe(5)
    expect(gradeAnswer(true, false, false).quality).toBe(2)
  })
})

function fake(o: Partial<Vocab> & { hanzi: string }): Vocab {
  return {
    pinyin: '', pinyinBase: '', tones: [], meaning: '', example: '',
    level: 1, ease: 2.5, interval: 0, due: 0, reps: 0, lapses: 0,
    correct: 0, wrong: 0, leech: false, mastered: false, updatedAt: 0, createdAt: 0,
    ...o,
  } as Vocab
}

describe('similar', () => {
  const a = fake({ id: 1, hanzi: '买', pinyinBase: 'mai', tones: [3], radical: '乙', level: 1 })
  const b = fake({ id: 2, hanzi: '卖', pinyinBase: 'mai', tones: [4], radical: '十', level: 1 })
  const c = fake({ id: 3, hanzi: '猫', pinyinBase: 'mao', tones: [1], radical: '犭', level: 1 })
  const all = [a, b, c]
  it('jebakan nada: base sama nada beda', () => {
    expect(findSimilar(a, all, 'tone', 2).map((v) => v.hanzi)).toContain('卖')
  })
  it('visual fallback tidak kosong', () => {
    expect(findSimilar(c, all, 'visual', 2).length).toBe(2)
  })
  it('grup radikal jalan', () => {
    expect(groupByRadical(all).length).toBe(3)
  })
  it('shuffle stabil jumlah', () => {
    expect(shuffle([1, 2, 3])).toHaveLength(3)
  })
})
