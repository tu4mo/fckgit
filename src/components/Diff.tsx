import { Box, Text, useBoxMetrics, useInput } from "ink";
import { ScrollView, type ScrollViewRef } from "ink-scroll-view";
import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";

import { useNotification } from "../hooks/useNotification.js";
import { useRepository } from "../hooks/useRepository.js";
import { buildViewState, getMaxLineLength } from "../lib/diff.js";
import { type ChangedFile } from "../lib/git/status.js";
import { getLanguage } from "./CodeLine.js";
import { DiffFilesView } from "./DiffFilesView.js";
import { FileContentView } from "./FileContentView.js";
import { LabelBox } from "./LabelBox.js";
import { Separator } from "./Separator.js";

type Props = {
  file: ChangedFile | undefined;
  focused: boolean;
  width: ComponentProps<typeof Box>["width"];
};

const DEFAULT_CONTEXT_LINES = 3;

export function Diff({ file, focused, width }: Props) {
  const { stage, unstage } = useRepository();
  const language = useMemo(() => (file ? getLanguage(file.path) : null), [file]);
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [contextLines, setContextLines] = useState(DEFAULT_CONTEXT_LINES);
  const { addNotification } = useNotification();
  const scrollRef = useRef<ScrollViewRef>(null);
  const ref = useRef(null);
  const { width: measuredWidth, height: measuredHeight } = useBoxMetrics(ref);

  const view = useMemo(() => buildViewState(file, contextLines), [file, contextLines]);
  const maxLineLength = useMemo(() => getMaxLineLength(view), [view]);

  useEffect(() => {
    scrollRef.current?.scrollToTop();
    setHorizontalOffset(0);
    setContextLines(DEFAULT_CONTEXT_LINES);
  }, [file?.path]);

  useInput(
    (input, key) => {
      const maxHorizontal = Math.max(0, maxLineLength - measuredWidth);
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
        if (file.stagedStatus === "FULL") {
          unstage(file.path);
        } else {
          stage(file.path);
        }
      }
      if (input === "+" && view.mode === "diff") {
        setContextLines((s) => {
          const next = s + 1;
          addNotification(`${next} context lines`);
          return next;
        });
      }
      if (input === "-" && view.mode === "diff") {
        setContextLines((s) => {
          const next = Math.max(0, s - 1);
          addNotification(`${next} context lines`);
          return next;
        });
      }
    },
    { isActive: focused },
  );

  return (
    <LabelBox
      flexGrow={1}
      focused={focused}
      label={
        <Text bold color={focused ? "whiteBright" : "gray"} wrap="truncate-middle">
          {file && file.displayPath}
        </Text>
      }
      ref={ref}
      width={width}
    >
      <ScrollView height={measuredHeight - 2} ref={scrollRef}>
        {view.mode === "content" ? (
          <FileContentView
            horizontalOffset={horizontalOffset}
            language={language}
            lines={view.lines}
            width={measuredWidth}
          />
        ) : (
          <>
            <DiffFilesView
              files={view.staged}
              horizontalOffset={horizontalOffset}
              language={language}
              width={measuredWidth}
            />
            {view.staged.length > 0 && view.unstaged.length > 0 && <Separator>unstaged</Separator>}
            <DiffFilesView
              files={view.unstaged}
              horizontalOffset={horizontalOffset}
              language={language}
              width={measuredWidth}
            />
          </>
        )}
      </ScrollView>
    </LabelBox>
  );
}
