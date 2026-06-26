import { Text } from "ink";
import { useMemo } from "react";
import sliceAnsi from "slice-ansi";

type Props = {
  displayWidth: number;
  horizontalOffset: number;
  text: string;
};

export function CodeLine({ displayWidth, horizontalOffset, text }: Props) {
  const sliced = useMemo(
    () => sliceAnsi(text, horizontalOffset, horizontalOffset + displayWidth),
    [text, horizontalOffset, displayWidth],
  );

  return <Text>{sliced || " "}</Text>;
}
