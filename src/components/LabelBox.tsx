import { Box } from "ink";
import type { ComponentProps, ReactNode } from "react";

type Props = ComponentProps<typeof Box> & {
  focused?: boolean;
  label: ReactNode;
};

export function LabelBox({ children, focused, label, ...props }: Props) {
  return (
    <Box position="relative" {...props}>
      <Box borderStyle="round" borderColor={focused ? "white" : "gray"}>
        {children}
      </Box>
      <Box backgroundColor="black" left={2} position="absolute">
        {label}
      </Box>
    </Box>
  );
}
