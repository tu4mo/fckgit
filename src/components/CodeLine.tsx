import { Box, Text } from "ink";
import { useMemo } from "react";
import sliceAnsi from "slice-ansi";

const BACKGROUND_COLOR: Record<"add" | "del", string> = {
  add: "#052e1666",
  del: "#450a0a",
};

type Props = {
  displayWidth: number;
  horizontalOffset: number;
  text: string;
  type: "add" | "del" | "normal";
};

export function CodeLine({ displayWidth, horizontalOffset, text, type }: Props) {
  const sliced = useMemo(
    () => sliceAnsi(text, horizontalOffset, horizontalOffset + displayWidth),
    [text, horizontalOffset, displayWidth],
  );

  return (
    <Box backgroundColor={type === "normal" ? undefined : BACKGROUND_COLOR[type]}>
      <Text>{sliced || " "}</Text>
    </Box>
  );
}
