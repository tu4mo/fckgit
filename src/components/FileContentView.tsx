import type { BundledLanguage } from "shiki";

import { CodeLine } from "./CodeLine.js";

type Props = {
  horizontalOffset: number;
  language: BundledLanguage | null;
  lines: string[];
  width: number;
};

export function FileContentView({ horizontalOffset, language, lines, width }: Props) {
  return lines.map((line, i) => (
    <CodeLine
      key={i}
      content={line}
      displayWidth={width - 2}
      horizontalOffset={horizontalOffset}
      language={language}
    />
  ));
}
