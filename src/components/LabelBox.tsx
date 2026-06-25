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
      <Box left={2} right={2} position="absolute">
        <Box backgroundColor="black">{label}</Box>
      </Box>
    </Box>
  );
}
