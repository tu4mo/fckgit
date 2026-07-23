import path from 'node:path'

import { Box, Text, useBoxMetrics, useFocus, useInput } from 'ink'
import { ScrollList } from 'ink-scroll-list'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from 'react'

import { LabelBox } from '../../components/LabelBox.js'
import { useRepository } from '../../hooks/useRepository.js'
import { type ChangedFile, type StagedStatus } from '../../lib/git/status.js'
import { truncateMiddle } from '../../lib/truncateMiddle.js'
import { FilesStatus } from './FilesStatus.js'

type Props = {
  onSelectedFile: (file: ChangedFile | undefined) => void
  width: ComponentProps<typeof Box>['width']
}

const CIRCLE_COLOR: Record<StagedStatus, string> = {
  NONE: 'white',
  PARTIAL: 'yellow',
  FULL: 'green',
}

export function Files({ width, onSelectedFile }: Props) {
  const { isFocused } = useFocus({ id: 'files', autoFocus: true })
  const { files, branch, stage, unstage } = useRepository()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const repo = useMemo(() => process.cwd().split('/').pop(), [])
  const labelBoxRef = useRef(null)
  const { width: labelBoxWidth, hasMeasured } = useBoxMetrics(labelBoxRef)

  useEffect(() => {
    onSelectedFile(files[selectedIndex])
  }, [selectedIndex, files, onSelectedFile])

  useInput(
    (input, key) => {
      if (key.upArrow) {
        setSelectedIndex((i) => Math.max(0, i - 1))
      }
      if (key.downArrow) {
        setSelectedIndex((i) => Math.min(files.length - 1, i + 1))
      }
      if (input === ' ') {
        const file = files[selectedIndex]
        if (!file) {
          return
        }
        if (file.stagedStatus === 'FULL') {
          unstage(file.path)
        } else {
          stage(file.path)
        }
      }
    },
    { isActive: isFocused },
  )

  const availableWidth =
    labelBoxWidth -
    2 - // padding
    2 - // border
    2 - // margin
    3 // repo symbol and space;

  const truncatedRepo = truncateMiddle(repo, Math.floor(availableWidth / 2))
  const truncatedBranch = truncateMiddle(branch, Math.floor(availableWidth / 2))

  return (
    <Box flexDirection="column" width={width}>
      <LabelBox
        flexGrow={1}
        isFocused={isFocused}
        label={
          hasMeasured && (
            <Box gap={1} height={1}>
              <Text bold color={isFocused ? 'whiteBright' : 'gray'}>
                {truncatedRepo}
              </Text>
              <Text color="gray">⌥</Text>
              <Text color={isFocused ? 'whiteBright' : 'gray'}>
                {truncatedBranch}
              </Text>
            </Box>
          )
        }
        ref={labelBoxRef}
      >
        <ScrollList height="100%" selectedIndex={selectedIndex} width="100%">
          {files.map((file, i) => {
            const selected = i === selectedIndex
            const name = path.basename(file.displayPath)
            const dir =
              path.dirname(file.displayPath) === '.'
                ? ''
                : path.dirname(file.displayPath)

            return (
              <Box
                backgroundColor={selected ? 'gray' : undefined}
                gap={1}
                height={1}
                key={file.path}
                paddingX={1}
              >
                <Text color={CIRCLE_COLOR[file.stagedStatus]}>●</Text>
                <Box flexGrow={1} overflow="hidden">
                  <Text wrap="hard">
                    <Text color="whiteBright">{name}</Text>
                    {dir ? (
                      <Text color={selected ? 'white' : 'gray'}> {dir}</Text>
                    ) : null}
                  </Text>
                </Box>
                <FilesStatus file={file} />
              </Box>
            )
          })}
        </ScrollList>
      </LabelBox>
    </Box>
  )
}
