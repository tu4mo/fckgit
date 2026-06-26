import { Box } from 'ink'
import type { ComponentProps, ReactNode } from 'react'

type Props = ComponentProps<typeof Box> & {
  focused?: boolean
  label: ReactNode
  subLabel?: ReactNode
}

export function LabelBox({
  children,
  focused,
  label,
  subLabel,
  ...props
}: Props) {
  return (
    <Box position="relative" {...props}>
      <Box borderStyle="round" borderColor={focused ? 'white' : 'gray'}>
        {children}
      </Box>
      <Box gap={1} left={2} right={2} position="absolute">
        {label && (
          <Box backgroundColor="black" paddingX={1}>
            {label}
          </Box>
        )}
        {subLabel && (
          <Box flexGrow={1} flexShrink={0} justifyContent="flex-end">
            <Box backgroundColor="black" paddingX={1}>
              {subLabel}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
