import { Box, Text } from 'ink'
import { useMemo } from 'react'
import sliceAnsi from 'slice-ansi'

type Type = 'add' | 'del' | 'normal'

const BACKGROUND_COLOR: Record<Type, string | undefined> = {
  add: '#052e1666',
  del: '#450a0a',
  normal: undefined,
}

type Props = {
  displayWidth: number
  horizontalOffset: number
  text: string
  type: Type
}

export function CodeLine({
  displayWidth,
  horizontalOffset,
  text,
  type,
}: Props) {
  const sliced = useMemo(
    () => sliceAnsi(text, horizontalOffset, horizontalOffset + displayWidth),
    [text, horizontalOffset, displayWidth],
  )

  return (
    <Box backgroundColor={BACKGROUND_COLOR[type]}>
      <Text>{sliced || ' '}</Text>
    </Box>
  )
}
