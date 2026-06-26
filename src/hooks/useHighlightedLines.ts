import { codeToANSI } from '@shikijs/cli'
import { useEffect, useState } from 'react'
import type { BundledLanguage } from 'shiki'

export function useHighlightedLines(
  lines: string[],
  language: BundledLanguage | null,
): string[] | null {
  const [highlighted, setHighlighted] = useState<string[] | null>(null)
  const joined = lines.join('\n')

  useEffect(() => {
    if (!language) {
      setHighlighted(null)
      return
    }
    let cancelled = false
    void codeToANSI(joined, language, 'github-dark').then((result) => {
      if (!cancelled) {
        setHighlighted(result.replace(/\n$/, '').split('\n'))
      }
    })
    return () => {
      cancelled = true
    }
  }, [joined, language])

  return highlighted
}
