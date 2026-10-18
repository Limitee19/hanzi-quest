import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'

export function StrokeOrder({
  char,
  size = 56,
  dark = '#0F172A',
  radical = '#E11D48',
}: {
  char: string
  size?: number
  dark?: string
  radical?: string
}) {
  const chars = Array.from(char || '')
  if (!chars.length) return null

  // If single character
  if (chars.length === 1) {
    return <SingleStrokeOrder char={chars[0]} size={size} dark={dark} radical={radical} />
  }

  // Multi-character word (e.g. 你好, 出租车)
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      {chars.map((c, i) => (
        <SingleStrokeOrder key={`${c}-${i}`} char={c} size={size} dark={dark} radical={radical} />
      ))}
    </div>
  )
}

function SingleStrokeOrder({
  char,
  size,
  dark,
  radical,
}: {
  char: string
  size: number
  dark: string
  radical: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current || !char) return
    ref.current.innerHTML = ''
    try {
      const w = HanziWriter.create(ref.current, char, {
        width: size,
        height: size,
        strokeColor: dark,
        radicalColor: radical,
        showOutline: true,
        outlineColor: '#CBD5E1',
        strokeAnimationSpeed: 1.2,
        delayBetweenStrokes: 120,
      }) as unknown as { animateCharacter: () => void }
      w.animateCharacter()
    } catch {
      if (ref.current) ref.current.textContent = char
    }
  }, [char, size, dark, radical])

  return (
    <div
      ref={ref}
      className="stroke-order-box"
      style={{ width: size, height: size }}
      aria-label={`urutan goresan ${char}`}
    />
  )
}

export function useTick(): number {
  const [n, setN] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setN((v) => v + 1), 1000)
    return () => clearInterval(t)
  }, [])
  return n
}

/** Native Mandarin Chinese pronunciation with multi-tier fallback */
export function speakHanzi(text: string) {
  if (!text || typeof window === 'undefined') return

  // Tier 1: Try native Youdao / Chinese audio stream
  try {
    const encoded = encodeURIComponent(text.trim())
    const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encoded}&le=zh`
    const audio = new Audio(audioUrl)
    audio.playbackRate = 0.95
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback to SpeechSynthesis if blocked or offline
        fallbackSpeechSynthesis(text)
      })
    }
  } catch {
    fallbackSpeechSynthesis(text)
  }
}

function fallbackSpeechSynthesis(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-CN'
    u.rate = 0.85
    const voices = window.speechSynthesis.getVoices()
    const zhVoice = voices.find((v) => v.lang.startsWith('zh') || v.lang.includes('Chinese'))
    if (zhVoice) u.voice = zhVoice
    window.speechSynthesis.speak(u)
  } catch {
    /* ignore */
  }
}

export function clickTick(enabled: boolean) {
  if (!enabled) return
  try {
    const ctx = new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(580, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.05)
    g.gain.setValueAtTime(0.08, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.06)
    setTimeout(() => ctx.close(), 100)
  } catch {
    /* ignore */
  }
}

export function playSuccessChime(enabled: boolean) {
  if (!enabled) return
  try {
    const ctx = new AudioContext()
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'triangle'
      o.frequency.value = freq
      const start = ctx.currentTime + idx * 0.07
      g.gain.setValueAtTime(0.06, start)
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.18)
      o.connect(g)
      g.connect(ctx.destination)
      o.start(start)
      o.stop(start + 0.19)
    })
    setTimeout(() => ctx.close(), 600)
  } catch {
    /* ignore */
  }
}

export function playErrorBuzz(enabled: boolean) {
  if (!enabled) return
  try {
    const ctx = new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(220, ctx.currentTime)
    o.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.12)
    g.gain.setValueAtTime(0.06, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14)
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.14)
    setTimeout(() => ctx.close(), 200)
  } catch {
    /* ignore */
  }
}
