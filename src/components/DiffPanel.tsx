import { Text, useBoxMetrics, useFocus, useFocusManager, useInput } from 'ink'
import { ScrollView, type ScrollViewRef } from 'ink-scroll-view'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import type { BundledLanguage } from 'shiki'

import { useHighlightedLines } from '../hooks/useHighlightedLines.js'
import { useRepository } from '../hooks/useRepository.js'
import { buildChunks, getMaxLineLength } from '../lib/diff.js'
import { type ChangedFile } from '../lib/git/status.js'
import { CodeLine } from './CodeLine.js'
import { LabelBox } from './LabelBox.js'
import { Separator } from './Separator.js'

type Props = {
  file: ChangedFile | undefined
  staged: boolean
  contextLines: number
  language: BundledLanguage | null
  visible: boolean
}

export function DiffPanel({
  file,
  staged,
  contextLines,
  language,
  visible,
}: Props) {
  const { isFocused } = useFocus({
    id: staged ? 'diff-staged' : 'diff-unstaged',
    isActive: visible,
  })
  const { focus } = useFocusManager()
  const { stage, unstage } = useRepository()
  const [horizontalOffset, setHorizontalOffset] = useState(0)
  const scrollRef = useRef<ScrollViewRef>(null)
  const ref = useRef(null)
  const { width: measuredWidth, height: measuredHeight } = useBoxMetrics(ref)

  const chunks = useMemo(
    () => buildChunks(file, contextLines, staged),
    [file, contextLines, staged],
  )
  const maxLineLength = useMemo(() => getMaxLineLength(chunks), [chunks])
  const maxHorizontal = Math.max(0, maxLineLength - measuredWidth)

  const allContents = useMemo(
    () => chunks.flatMap((c) => c.changes.map((ch) => ch.content)),
    [chunks],
  )
  const highlightedLines = useHighlightedLines(allContents, language)

  useInput(
    (input, key) => {
      if (key.upArrow) {
        scrollRef.current?.scrollBy(-1)
      }
      if (key.downArrow) {
        scrollRef.current?.scrollBy(1)
      }
      if (key.leftArrow) {
        setHorizontalOffset((s) => Math.max(0, s - 1))
      }
      if (key.rightArrow) {
        setHorizontalOffset((s) => Math.min(maxHorizontal, s + 1))
      }
      if (input === ' ' && file) {
        if (staged) {
          unstage(file.path)
          focus('diff-unstaged')
        } else {
          stage(file.path)
          focus('diff-staged')
        }
      }
    },
    { isActive: isFocused },
  )

  if (!visible) {
    return null
  }

  const labelColor = isFocused ? 'whiteBright' : 'gray'

  return (
    <LabelBox
      flexBasis={0}
      flexGrow={1}
      isFocused={isFocused}
      label={
        file && (
          <Text bold color={labelColor} wrap="truncate-middle">
            {file.displayPath}
          </Text>
        )
      }
      ref={ref}
      subLabel={
        file && (
          <Text bold color={labelColor}>
            {staged ? 'staged' : 'unstaged'}
          </Text>
        )
      }
    >
      <ScrollView height={measuredHeight - 2} ref={scrollRef}>
        {chunks.flatMap((chunk, ci) => {
          const chunkOffset = chunks
            .slice(0, ci)
            .reduce((sum, c) => sum + c.changes.length, 0)
          const items: ReactNode[] = []

          if (ci > 0) {
            items.push(<Separator key={`sep-${ci}`}>···</Separator>)
          }

          chunk.changes.forEach((change, i) => {
            items.push(
              <CodeLine
                key={`${ci}-${i}`}
                displayWidth={measuredWidth - 2}
                horizontalOffset={horizontalOffset}
                text={highlightedLines?.[chunkOffset + i] ?? change.content}
                type={change.type}
              />,
            )
          })

          return items
        })}
      </ScrollView>
    </LabelBox>
  )
}
