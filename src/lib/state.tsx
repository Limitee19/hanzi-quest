import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { db } from './db'

interface Prefs {
  arcade: boolean
  sound: boolean
  target: number
}

const KEY = 'hq-prefs'
const DEF: Prefs = { arcade: false, sound: true, target: 10 }

const Ctx = createContext<{ prefs: Prefs; set: (p: Partial<Prefs>) => void; seeded: boolean }>({ prefs: DEF, set: () => {}, seeded: false })

export function usePrefs() {
  return useContext(Ctx)
}

export function AppState({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => {
    try {
      return { ...DEF, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
    } catch {
      return DEF
    }
  })
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(prefs))
  }, [prefs])

  useEffect(() => {
    db.vocab.count().then((c) => setSeeded(c >= 0))
  }, [])

  return <Ctx.Provider value={{ prefs, set: (p) => setPrefs((s) => ({ ...s, ...p })), seeded }}>{children}</Ctx.Provider>
}
