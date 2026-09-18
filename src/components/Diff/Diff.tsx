import { Box, useFocusManager, useInput } from 'ink'
import { useMemo, useState, type ComponentProps } from 'react'

import { useNotification } from '../../hooks/useNotification.js'
import { getPanelVisibility } from '../../lib/diff.js'
import { type ChangedFile } from '../../lib/git/status.js'
import { getLanguage } from '../../lib/highlight.js'
import { DiffPanel } from './DiffPanel.js'

type Props = {
  file: ChangedFile | undefined
  width: ComponentProps<typeof Box>['width']
}

const DEFAULT_CONTEXT_LINES = 3

export function Diff({ file, width }: Props) {
  const { activeId } = useFocusManager()
  const language = useMemo(() => (file ? getLanguage(file.path) : null), [file])
  const [contextLines, setContextLines] = useState(DEFAULT_CONTEXT_LINES)
  const [trackedPath, setTrackedPath] = useState(file?.path)
  const { addNotification } = useNotification()

  const { isContentMode, hasStagedPanel, hasUnstagedPanel } =
    getPanelVisibility(file)

  if (file?.path !== trackedPath) {
    setTrackedPath(file?.path)
    setContextLines(DEFAULT_CONTEXT_LINES)
  }

  useInput(
    (input) => {
      if (isContentMode) {
        return
      }
      if (input === '+') {
        setContextLines((s) => {
          const next = s + 1
          addNotification(`${next} context lines`)
          return next
        })
      }
      if (input === '-') {
        setContextLines((s) => {
          const next = Math.max(0, s - 1)
          addNotification(`${next} context lines`)
          return next
        })
      }
    },
    { isActive: activeId === 'diff-unstaged' || activeId === 'diff-staged' },
  )

  return (
    <Box flexDirection="column" flexGrow={1} width={width}>
      <DiffPanel
        key={`${file?.path}-unstaged`}
        contextLines={contextLines}
        file={file}
        language={language}
        staged={false}
        visible={hasUnstagedPanel}
      />
      <DiffPanel
        key={`${file?.path}-staged`}
        contextLines={contextLines}
        file={file}
        language={language}
        staged={true}
        visible={hasStagedPanel}
      />
    </Box>
  )
}
