import { Box, Text, useBoxMetrics, useInput } from "ink";
import { ScrollView, type ScrollViewRef } from "ink-scroll-view";
import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";

import { type DiffFile, getFileDiff } from "../lib/diff.js";
import { readFile } from "../lib/fs.js";
import { show } from "../lib/git/show.js";
import { type ChangedFile } from "../lib/git/status.js";
import { LabelBox } from "./LabelBox.js";
import { TimedHint } from "./TimedHint.js";

type Props = {
  file: ChangedFile | undefined;
  focused: boolean;
  width: ComponentProps<typeof Box>["width"];
};

type ViewState =
  | { mode: "diff"; staged: DiffFile[]; unstaged: DiffFile[] }
  | { mode: "content"; lines: string[] };

type DiffFilesViewProps = {
  files: DiffFile[];
  horizontalOffset: number;
  width: number;
};

function DiffFilesView({ files, horizontalOffset, width }: DiffFilesViewProps) {
  return files.flatMap((file, fi) =>
    file.chunks.flatMap((chunk, ci) => {
      const items: React.ReactNode[] = [];

      if (ci > 0 || fi > 0) {
        items.push(
          <Box key={`sep-${fi}-${ci}`} backgroundColor="gray" justifyContent="center">
            <Text color="white">···</Text>
          </Box>,
        );
      }

      chunk.changes.forEach((change, i) => {
        const bg =
          change.type === "add" ? "#052e16" : change.type === "del" ? "#450a0a" : undefined;
        const content =
          change.content.slice(1 + horizontalOffset, 1 + horizontalOffset + width - 2) || " ";

        items.push(
          <Box key={`${fi}-${ci}-${i}`} width={width} backgroundColor={bg}>
            <Text color="white">{content}</Text>
          </Box>,
        );
      });

      return items;
    }),
  );
}

const DEFAULT_CONTEXT_LINES = 3;

export function Diff({ file, focused, width }: Props) {
  const [view, setView] = useState<ViewState>({ mode: "diff", staged: [], unstaged: [] });
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [contextLines, setContextLines] = useState(DEFAULT_CONTEXT_LINES);
  const scrollRef = useRef<ScrollViewRef>(null);
  const prevFileRef = useRef<string | undefined>(undefined);
  const ref = useRef(null);
  const { width: measuredWidth, height: measuredHeight } = useBoxMetrics(ref);

  useEffect(() => {
    if (!file) {
      setView({ mode: "diff", staged: [], unstaged: [] });
      scrollRef.current?.scrollToTop();
      return;
    }

    if (file.status === "DELETED" || file.status === "UNTRACKED") {
      let text = "";
      try {
        text =
          file.status === "DELETED"
            ? show(file.stagedStatus !== "NONE" ? `HEAD:${file.path}` : `:${file.path}`)
            : readFile(file.path);
      } catch {
        text = "";
      }
      setView({ mode: "content", lines: text ? text.split("\n") : [] });
    } else {
      const { staged, unstaged } = getFileDiff(file, contextLines);
      setView({ mode: "diff", staged, unstaged });
    }

    if (prevFileRef.current !== file.path) {
      scrollRef.current?.scrollToTop();
      setHorizontalOffset(0);
      setContextLines(DEFAULT_CONTEXT_LINES);
    }

    prevFileRef.current = file.path;
  }, [file, contextLines]);

  const maxLineLength = useMemo(() => {
    if (view.mode === "content") {
      return Math.max(0, ...view.lines.map((l) => l.length));
    }
    const allChanges = [
      ...view.staged.flatMap((f) => f.chunks.flatMap((c) => c.changes)),
      ...view.unstaged.flatMap((f) => f.chunks.flatMap((c) => c.changes)),
    ];
    return Math.max(0, ...allChanges.map((c) => c.content.length - 1));
  }, [view]);

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
      if (input === "+" && view.mode === "diff") {
        setContextLines((s) => s + 1);
      }
      if (input === "-" && view.mode === "diff") {
        setContextLines((s) => Math.max(0, s - 1));
      }
    },
    { isActive: focused },
  );

  return (
    <LabelBox
      flexGrow={1}
      label={
        <Box gap={1}>
          <Text bold color={focused ? "whiteBright" : "gray"} wrap="truncate-middle">
            {file && file.displayPath}
          </Text>
          {view.mode === "diff" && (
            <TimedHint watchValue={contextLines}>
              <Text color="gray">{contextLines} lines</Text>
            </TimedHint>
          )}
        </Box>
      }
      ref={ref}
      width={width}
    >
      <ScrollView height={measuredHeight - 2} ref={scrollRef}>
        {view.mode === "content" ? (
          view.lines.map((line, i) => (
            <Text wrap="hard" color="whiteBright" key={i}>
              {line.slice(horizontalOffset, horizontalOffset + measuredWidth - 2) || " "}
            </Text>
          ))
        ) : (
          <>
            <DiffFilesView
              files={view.staged}
              horizontalOffset={horizontalOffset}
              width={measuredWidth}
            />
            {view.staged.length > 0 && view.unstaged.length > 0 && (
              <Box backgroundColor="gray" justifyContent="center">
                <Text color="white">unstaged</Text>
              </Box>
            )}
            <DiffFilesView
              files={view.unstaged}
              horizontalOffset={horizontalOffset}
              width={measuredWidth}
            />
          </>
        )}
      </ScrollView>
    </LabelBox>
  );
}
