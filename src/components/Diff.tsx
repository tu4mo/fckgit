import { Box, Text, useBoxMetrics, useInput } from "ink";
import { ScrollView, type ScrollViewRef } from "ink-scroll-view";
import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";

import { type DiffLine, getFileDiffLines } from "../lib/diff.js";
import { type ChangedFile } from "../lib/git/index.js";
import { TimedHint } from "./TimedHint.js";

type Props = {
  file: ChangedFile | undefined;
  focused: boolean;
  width: ComponentProps<typeof Box>["width"];
};

function lineBg(line: DiffLine): string | undefined {
  if (line.kind === "add") {
    return "#052e16";
  }
  if (line.kind === "remove") {
    return "#450a0a";
  }
  return undefined;
}

const DEFAULT_CONTEXT_LINES = 3;

export function Diff({ file, focused, width }: Props) {
  const [lines, setLines] = useState<DiffLine[]>([]);
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [contextLines, setContextLines] = useState(DEFAULT_CONTEXT_LINES);
  const scrollRef = useRef<ScrollViewRef>(null);
  const prevFileRef = useRef<string | undefined>(undefined);
  const ref = useRef(null);
  const { width: measuredWidth, height: measuredHeight } = useBoxMetrics(ref);

  useEffect(() => {
    if (!file) {
      setLines([]);
      scrollRef.current?.scrollToTop();
      return;
    }

    setLines(getFileDiffLines(file, contextLines));

    if (prevFileRef.current !== file.path) {
      scrollRef.current?.scrollToTop();
      setHorizontalOffset(0);
      setContextLines(DEFAULT_CONTEXT_LINES);
    }

    prevFileRef.current = file.path;
  }, [file, contextLines]);

  const maxLineLength = useMemo(() => Math.max(0, ...lines.map((l) => l.text.length)), [lines]);

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
      if (input === "+") {
        setContextLines((s) => s + 1);
      }
      if (input === "-") {
        setContextLines((s) => Math.max(0, s - 1));
      }
    },
    { isActive: focused },
  );

  return (
    <Box flexDirection="column" width={width} ref={ref}>
      <Box marginLeft={1} gap={1} justifyContent="space-between">
        <Text bold color={focused ? "whiteBright" : "gray"} wrap="truncate-middle">
          {file ? file.displayPath : "no file selected"}
        </Text>
        <TimedHint watchValue={contextLines}>
          <Text color="gray">Context: {contextLines} lines</Text>
        </TimedHint>
      </Box>
      <ScrollView
        borderColor={focused ? "white" : "gray"}
        borderStyle="round"
        flexGrow={1}
        height={measuredHeight}
        ref={scrollRef}
      >
        {lines.map((line, i) => {
          if (line.kind === "separator") {
            return (
              <Box key={i} width="100%" backgroundColor="#222" justifyContent="center">
                <Text color="#555">{line.text}</Text>
              </Box>
            );
          }

          const content =
            line.text.slice(horizontalOffset, horizontalOffset + measuredWidth - 2) || " ";

          return (
            <Box key={i} width="100%" backgroundColor={lineBg(line)}>
              <Text wrap="hard" color="white">
                {content}
              </Text>
            </Box>
          );
        })}
      </ScrollView>
    </Box>
  );
}
