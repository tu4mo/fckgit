import type { BundledLanguage } from "shiki";

import { useHighlightedLines } from "../hooks/useHighlightedLines.js";

import { CodeLine } from "./CodeLine.js";

type Props = {
  horizontalOffset: number;
  language: BundledLanguage | null;
  lines: string[];
  width: number;
};

export function FileContentView({ horizontalOffset, language, lines, width }: Props) {
  const highlightedLines = useHighlightedLines(lines, language);

  return lines.map((line, i) => (
    <CodeLine
      key={i}
      displayWidth={width - 2}
      horizontalOffset={horizontalOffset}
      text={highlightedLines?.[i] ?? line}
    />
  ));
}
