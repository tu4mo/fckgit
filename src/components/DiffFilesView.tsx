import { Box } from "ink";
import type { ReactNode } from "react";
import type { BundledLanguage } from "shiki";

import type { DiffFile } from "../lib/diff.js";
import { CodeLine } from "./CodeLine.js";
import { Separator } from "./Separator.js";

type Props = {
  files: DiffFile[];
  horizontalOffset: number;
  language: BundledLanguage | null;
  width: number;
};

export function DiffFilesView({ files, horizontalOffset, language, width }: Props) {
  return files.flatMap((file, fi) =>
    file.chunks.flatMap((chunk, ci) => {
      const items: ReactNode[] = [];

      if (ci > 0 || fi > 0) {
        items.push(<Separator key={`sep-${fi}-${ci}`}>···</Separator>);
      }

      chunk.changes.forEach((change, i) => {
        const bg =
          change.type === "add" ? "#052e16" : change.type === "del" ? "#450a0a" : undefined;

        items.push(
          <Box key={`${fi}-${ci}-${i}`} width={width} backgroundColor={bg}>
            <CodeLine
              content={change.content.slice(1)}
              displayWidth={width - 2}
              horizontalOffset={horizontalOffset}
              language={language}
            />
          </Box>,
        );
      });

      return items;
    }),
  );
}
