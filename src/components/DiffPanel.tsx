import { Box, useBoxMetrics, useInput } from "ink";
import { ScrollView, type ScrollViewRef } from "ink-scroll-view";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { BundledLanguage } from "shiki";

import { useHighlightedLines } from "../hooks/useHighlightedLines.js";
import { useRepository } from "../hooks/useRepository.js";
import { buildChunks, getMaxLineLength } from "../lib/diff.js";
import { type ChangedFile } from "../lib/git/status.js";
import { CodeLine } from "./CodeLine.js";
import { LabelBox } from "./LabelBox.js";
import { Separator } from "./Separator.js";

type Props = {
  file: ChangedFile | undefined;
  staged: boolean;
  focused: boolean;
  contextLines: number;
  label: ReactNode;
  language: BundledLanguage | null;
};

export function DiffPanel({ file, staged, focused, contextLines, label, language }: Props) {
  const { stage, unstage } = useRepository();
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const scrollRef = useRef<ScrollViewRef>(null);
  const ref = useRef(null);
  const { width: measuredWidth, height: measuredHeight } = useBoxMetrics(ref);

  const chunks = useMemo(
    () => buildChunks(file, contextLines, staged),
    [file, contextLines, staged],
  );
  const maxLineLength = useMemo(() => getMaxLineLength(chunks), [chunks]);
  const maxHorizontal = Math.max(0, maxLineLength - measuredWidth);

  const allContents = useMemo(
    () => chunks.flatMap((c) => c.changes.map((ch) => ch.content)),
    [chunks],
  );
  const highlightedLines = useHighlightedLines(allContents, language);

  useEffect(() => {
    scrollRef.current?.scrollToTop();
    setHorizontalOffset(0);
  }, [file?.path]);

  useInput(
    (input, key) => {
      if (key.upArrow) {
        scrollRef.current?.scrollBy(-1);
      }
      if (key.downArrow) {
        scrollRef.current?.scrollBy(1);
      }
      if (key.leftArrow) {
        setHorizontalOffset((s) => Math.max(0, s - 1));
      }
      if (key.rightArrow) {
        setHorizontalOffset((s) => Math.min(maxHorizontal, s + 1));
      }
      if (input === " " && file) {
        if (staged) {
          unstage(file.path);
        } else {
          stage(file.path);
        }
      }
    },
    { isActive: focused },
  );

  let lineIndex = 0;

  const lines = chunks.flatMap((chunk, ci) => {
    const items: ReactNode[] = [];

    if (ci > 0) {
      items.push(<Separator key={`sep-${ci}`}>···</Separator>);
    }

    chunk.changes.forEach((change, i) => {
      const bg = change.type === "add" ? "#052e16" : change.type === "del" ? "#450a0a" : undefined;
      const text = highlightedLines?.[lineIndex++] ?? change.content;

      items.push(
        <Box key={`${ci}-${i}`} width={measuredWidth} backgroundColor={bg}>
          <CodeLine
            displayWidth={measuredWidth - 2}
            horizontalOffset={horizontalOffset}
            text={text}
          />
        </Box>,
      );
    });

    return items;
  });

  return (
    <LabelBox flexBasis={0} flexGrow={1} focused={focused} label={label} ref={ref}>
      <ScrollView height={measuredHeight - 2} ref={scrollRef}>
        {lines}
      </ScrollView>
    </LabelBox>
  );
}
