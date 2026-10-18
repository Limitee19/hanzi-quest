import type { Vocab } from './db'

export interface Grade {
  quality: number
  pinyinOk: boolean
  toneOk: boolean
  meaningOk: boolean
}

export function gradeAnswer(pinyinOk: boolean, toneOk: boolean, meaningOk: boolean): Grade {
  const hits = (pinyinOk ? 1 : 0) + (toneOk ? 1 : 0) + (meaningOk ? 1 : 0)
  const quality = hits === 3 ? 5 : hits === 2 ? 3 : hits === 1 ? 2 : 0
  return { quality, pinyinOk, toneOk, meaningOk }
}

export function applySM2(v: Vocab, quality: number, now = Date.now()): Partial<Vocab> {
  const DAY = 86_400_000
  let { ease, interval, reps, lapses, correct, wrong } = v
  if (quality >= 3) {
    correct += 1
    if (reps === 0) interval = 1
    else if (reps === 1) interval = 6
    else interval = Math.round(interval * ease)
    reps += 1
    ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  } else {
    wrong += 1
    lapses += 1
    reps = 0
    interval = 0
    ease = Math.max(1.3, ease - 0.2)
  }
  const leech = lapses >= 3
  const mastered = !leech && reps >= 4 && interval >= 14
  const due = quality >= 3 ? now + interval * DAY : now + 10 * 60_000
  return { ease, interval, due, reps, lapses, correct, wrong, leech, mastered }
}

export function defaultCard(): Pick<Vocab, 'ease' | 'interval' | 'due' | 'reps' | 'lapses' | 'correct' | 'wrong' | 'leech' | 'mastered'> {
  return { ease: 2.5, interval: 0, due: Date.now(), reps: 0, lapses: 0, correct: 0, wrong: 0, leech: false, mastered: false }
}
