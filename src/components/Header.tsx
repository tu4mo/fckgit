import { Box, Text } from "ink";
import { useMemo } from "react";

export function Header() {
  const folder = useMemo(() => process.cwd().split("/").pop(), []);

  return (
    <Box backgroundColor="green" paddingX={1} marginBottom={1} justifyContent="space-between">
      <Text bold color="black">
        f*ckgit
      </Text>
      <Text color="black">{folder}</Text>
    </Box>
  );
}
