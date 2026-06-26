import { Box } from "ink";
import { useMemo } from "react";
import type { ReactNode } from "react";
import type { BundledLanguage } from "shiki";

import type { DiffFile } from "../lib/diff.js";
import { useHighlightedLines } from "../hooks/useHighlightedLines.js";

import { CodeLine } from "./CodeLine.js";
import { Separator } from "./Separator.js";

type Props = {
  files: DiffFile[];
  horizontalOffset: number;
  language: BundledLanguage | null;
  width: number;
};

export function DiffFilesView({ files, horizontalOffset, language, width }: Props) {
  const allContents = useMemo(
    () => files.flatMap((f) => f.chunks.flatMap((c) => c.changes.map((ch) => ch.content.slice(1)))),
    [files],
  );
  const highlightedLines = useHighlightedLines(allContents, language);

  let lineIndex = 0;

  return files.flatMap((file, fi) =>
    file.chunks.flatMap((chunk, ci) => {
      const items: ReactNode[] = [];

      if (ci > 0 || fi > 0) {
        items.push(<Separator key={`sep-${fi}-${ci}`}>···</Separator>);
      }

      chunk.changes.forEach((change, i) => {
        const bg =
          change.type === "add" ? "#052e16" : change.type === "del" ? "#450a0a" : undefined;

        const content = change.content.slice(1);
        const text = highlightedLines?.[lineIndex++] ?? content;

        items.push(
          <Box key={`${fi}-${ci}-${i}`} width={width} backgroundColor={bg}>
            <CodeLine
              displayWidth={width - 2}
              horizontalOffset={horizontalOffset}
              text={text}
            />
          </Box>,
        );
      });

      return items;
    }),
  );
}
