import { Box, Text } from 'ink'

import { type ChangedFile, type GitFileStatus } from '../../lib/git/status.js'

type Props = {
  file: ChangedFile
}

const STATUS: Record<GitFileStatus, { symbol: string; color: string }> = {
  'MODIFIED': { symbol: 'ᵐ', color: 'yellow' },
  'ADDED': { symbol: 'ᵃ', color: 'green' },
  'DELETED': { symbol: 'ᵈ', color: 'red' },
  'RENAMED': { symbol: 'ʳ', color: 'cyan' },
  'UNTRACKED': { symbol: 'ᵘ', color: 'gray' },
  '-': { symbol: '⁻', color: 'gray' },
}

export function FilesStatus({ file }: Props) {
  const displayStatus =
    file.workingTreeStatus !== '-' ? file.workingTreeStatus : file.status

  return (
    <Box flexShrink={0}>
      <Text color={STATUS[displayStatus].color}>
        {STATUS[displayStatus].symbol}
      </Text>
    </Box>
  )
}
