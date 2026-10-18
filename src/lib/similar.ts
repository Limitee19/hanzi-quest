import type { Vocab } from './db'

export type SimKind = 'tone' | 'radical' | 'visual'

export function sameBase(a: Vocab, b: Vocab): boolean {
  return a.pinyinBase === b.pinyinBase && a.hanzi !== b.hanzi
}

export function toneClash(a: Vocab, b: Vocab): boolean {
  if (!sameBase(a, b)) return false
  return a.tones.join(',') !== b.tones.join(',')
}

export function sharedChars(a: string, b: string): number {
  const sa = [...a]
  const sb = new Set([...b])
  return sa.filter((c) => sb.has(c)).length
}

export function findSimilar(target: Vocab, all: Vocab[], kind: SimKind, n = 3): Vocab[] {
  const pool = all.filter((v) => v.id !== target.id && v.level === target.level)
  let ranked: { v: Vocab; s: number }[] = []
  if (kind === 'tone') {
    ranked = pool.filter((v) => toneClash(target, v)).map((v) => ({ v, s: 2 + sharedChars(target.hanzi, v.hanzi) }))
    if (!ranked.length) ranked = pool.filter((v) => sameBase(target, v)).map((v) => ({ v, s: 1 }))
  } else if (kind === 'radical') {
    ranked = pool
      .filter((v) => target.radical && v.radical === target.radical)
      .map((v) => ({ v, s: 2 + sharedChars(target.hanzi, v.hanzi) }))
  } else {
    ranked = pool
      .map((v) => ({ v, s: sharedChars(target.hanzi, v.hanzi) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
  }
  ranked.sort((a, b) => b.s - a.s)
  const out = ranked.slice(0, n).map((x) => x.v)
  if (out.length < n) {
    const need = n - out.length
    const rest = pool.filter((v) => !out.includes(v) && v.hanzi !== target.hanzi)
    for (let i = 0; i < need && rest.length; i++) {
      out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0])
    }
  }
  return out
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function groupByRadical(all: Vocab[]): { radical: string; words: Vocab[] }[] {
  const m = new Map<string, Vocab[]>()
  for (const v of all) {
    const k = v.radical?.trim() || '？'
    if (!m.has(k)) m.set(k, [])
    m.get(k)!.push(v)
  }
  return [...m.entries()]
    .map(([radical, words]) => ({ radical, words: words.sort((a, b) => a.hanzi.localeCompare(b.hanzi, 'zh')) }))
    .sort((a, b) => b.words.length - a.words.length || a.radical.localeCompare(b.radical, 'zh'))
}
