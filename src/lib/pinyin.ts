const TONE_MARKS: Record<string, [string, number]> = {
  ā: ['a', 1], á: ['a', 2], ǎ: ['a', 3], à: ['a', 4],
  ē: ['e', 1], é: ['e', 2], ě: ['e', 3], è: ['e', 4],
  ī: ['i', 1], í: ['i', 2], ǐ: ['i', 3], ì: ['i', 4],
  ō: ['o', 1], ó: ['o', 2], ǒ: ['o', 3], ò: ['o', 4],
  ū: ['u', 1], ú: ['u', 2], ǔ: ['u', 3], ù: ['u', 4],
  ǖ: ['ü', 1], ǘ: ['ü', 2], ǚ: ['ü', 3], ǜ: ['ü', 4],
  ǖ_: ['ü', 1], ā_: ['a', 1],
  ê̄: ['ê', 1], ê̌: ['ê', 3], ê̂: ['ê', 4],
}

for (const [k, v] of Object.entries({ ...TONE_MARKS })) {
  TONE_MARKS[k.toUpperCase()] = [v[0].toUpperCase(), v[1]] as [string, number]
}

const VOWEL_TONES: Record<string, string[]> = {
  a: ['a', 'ā', 'á', 'ǎ', 'à', 'a'],
  o: ['o', 'ō', 'ó', 'ǒ', 'ò', 'o'],
  e: ['e', 'ē', 'é', 'ě', 'è', 'e'],
  i: ['i', 'ī', 'í', 'ǐ', 'ì', 'i'],
  u: ['u', 'ū', 'ú', 'ǔ', 'ù', 'u'],
  v: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
  ü: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
}

export function applyTone(syl: string, tone: number): string {
  if (tone < 1 || tone > 4) return syl.replace(/v/g, 'ü')
  const s = syl.toLowerCase()
  if (s.includes('a')) return s.replace('a', VOWEL_TONES.a[tone])
  if (s.includes('e')) return s.replace('e', VOWEL_TONES.e[tone])
  if (s.includes('ou')) return s.replace('o', VOWEL_TONES.o[tone])
  for (let i = s.length - 1; i >= 0; i--) {
    const ch = s[i]
    if (VOWEL_TONES[ch]) {
      return s.slice(0, i) + VOWEL_TONES[ch][tone] + s.slice(i + 1)
    }
  }
  return syl
}

export function formatPinyinWithTones(base: string, tones: number[]): string {
  const parts = base.trim().split(/\s+/)
  return parts.map((p, i) => applyTone(p, tones[i] ?? 5)).join(' ')
}

export function parsePinyin(marked: string): { base: string; tones: number[] } {
  // Normalize e.g. "ni3hao3" -> "ni3 hao3"
  let str = marked.trim().replace(/['’]/g, ' ')
  str = str.replace(/([1-5])([a-zA-Z])/g, '$1 $2')

  const syllables = str.split(/\s+/).filter(Boolean)
  const baseSyl: string[] = []
  const tones: number[] = []

  for (const syl of syllables) {
    let base = ''
    let tone = 5
    for (const ch of syl) {
      const hit = TONE_MARKS[ch]
      if (hit) {
        base += hit[0]
        tone = hit[1]
      } else {
        base += ch
      }
    }
    base = base.toLowerCase().replace(/ü/g, 'v').replace(/u:/g, 'v')
    if (/^[a-zêv]+[1-5]?$/.test(base)) {
      const m = base.match(/([1-5])$/)
      if (m) {
        tone = Number(m[1])
        base = base.slice(0, -1)
      }
    }
    baseSyl.push(base)
    tones.push(tone)
  }
  return { base: baseSyl.join(' '), tones }
}

export function normBase(s: string): string {
  return s.trim().toLowerCase().replace(/ü/g, 'v').replace(/u:/g, 'v').replace(/\s+/g, ' ')
}

export function comparePinyin(inputBase: string, inputTones: number[], expectedBase: string, expectedTones: number[]) {
  const pinyinOk = normBase(inputBase) === normBase(expectedBase)
  const toneOk =
    inputTones.length === expectedTones.length &&
    inputTones.every((t, i) => t === expectedTones[i])
  return { pinyinOk, toneOk }
}

export const TONE_LABEL = ['1', '2', '3', '4', '·']
export function toneArrow(t: number): string {
  return ['', 'ˉ', 'ˊ', 'ˇ', 'ˋ', '·'][t] ?? '?'
}

export interface ToneOption {
  pinyin: string
  tones: number[]
  isCorrect: boolean
  label: string
}

/** Generates 4 rich Duolingo-style tone options for any vocabulary card */
export function generateToneOptions(card: { pinyin: string; pinyinBase: string; tones: number[] }): ToneOption[] {
  const syllables = card.pinyinBase.trim().split(/\s+/)
  const correctTones = [...card.tones]
  const correctPinyin = card.pinyin

  const candidateTones: number[][] = []

  if (syllables.length === 1) {
    const t = correctTones[0] ?? 1
    const allTones = [1, 2, 3, 4]
    for (const alt of allTones) {
      if (alt !== t) candidateTones.push([alt])
    }
  } else if (syllables.length === 2) {
    const [t1, t2] = correctTones
    // Perturb first tone
    candidateTones.push([t1 === 1 ? 2 : t1 === 2 ? 3 : t1 === 3 ? 4 : 1, t2])
    // Perturb second tone
    candidateTones.push([t1, t2 === 1 ? 4 : t2 === 4 ? 2 : t2 === 2 ? 3 : 1])
    // Perturb both
    candidateTones.push([t1 === 3 ? 2 : 3, t2 === 4 ? 1 : 4])
    candidateTones.push([1, 1])
    candidateTones.push([4, 4])
  } else {
    // 3+ syllables
    for (let i = 0; i < 4; i++) {
      const copy = [...correctTones]
      const changeIdx = i % copy.length
      copy[changeIdx] = copy[changeIdx] === 1 ? 2 : copy[changeIdx] === 2 ? 3 : copy[changeIdx] === 3 ? 4 : 1
      candidateTones.push(copy)
    }
  }

  // Filter out duplicates and the correct answer
  const seen = new Set<string>([correctTones.join(',')])
  const distractorTones: number[][] = []

  for (const c of candidateTones) {
    const key = c.join(',')
    if (!seen.has(key)) {
      seen.add(key)
      distractorTones.push(c)
      if (distractorTones.length === 3) break
    }
  }

  // Fallback if needed
  while (distractorTones.length < 3) {
    const randomTones = syllables.map(() => Math.floor(Math.random() * 4) + 1)
    const key = randomTones.join(',')
    if (!seen.has(key)) {
      seen.add(key)
      distractorTones.push(randomTones)
    }
  }

  const options: ToneOption[] = [
    {
      pinyin: correctPinyin,
      tones: correctTones,
      isCorrect: true,
      label: correctTones.map((t) => toneArrow(t)).join(' '),
    },
    ...distractorTones.map((ts) => ({
      pinyin: formatPinyinWithTones(card.pinyinBase, ts),
      tones: ts,
      isCorrect: false,
      label: ts.map((t) => toneArrow(t)).join(' '),
    })),
  ]

  // Shuffle options so correct answer isn't always first
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[options[i], options[j]] = [options[j], options[i]]
  }

  return options
}
