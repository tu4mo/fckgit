import { Box, Text } from "ink";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function Separator({ children }: Props) {
  return (
    <Box backgroundColor="gray" justifyContent="center">
      <Text color="white">{children}</Text>
    </Box>
  );
}
