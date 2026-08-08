import { Box, Text, useBoxMetrics } from 'ink'
import { useRef, type ComponentProps, type ReactNode } from 'react'

type Props = ComponentProps<typeof Box> & {
  isFocused?: boolean
  label: ReactNode
  subLabel?: ReactNode
}

// Ink only paints over the border underneath a label when told to fill a
// background color, and a hardcoded color clashes with the terminal's own
// theme. So instead we measure the label's rendered width and blank that
// exact area with plain, unstyled spaces, erasing the border without
// imposing any color of our own.
function Chip({ children }: { children: ReactNode }) {
  const ref = useRef(null)
  const { width, hasMeasured } = useBoxMetrics(ref)

  return (
    <Box position="relative">
      <Text>{hasMeasured ? ' '.repeat(width) : ''}</Text>
      <Box paddingX={1} position="absolute" ref={ref}>
        {children}
      </Box>
    </Box>
  )
}

export function LabelBox({
  children,
  isFocused,
  label,
  subLabel,
  ...props
}: Props) {
  return (
    <Box position="relative" {...props}>
      <Box borderStyle="round" borderColor={isFocused ? 'white' : 'gray'}>
        {children}
      </Box>
      <Box gap={1} left={2} right={2} position="absolute">
        {label && <Chip>{label}</Chip>}
        {subLabel && (
          <Box flexGrow={1} flexShrink={0} justifyContent="flex-end">
            <Chip>{subLabel}</Chip>
          </Box>
        )}
      </Box>
    </Box>
  )
}
