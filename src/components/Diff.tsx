import { Box, Text, useInput } from "ink";
import { useEffect, useRef, useState } from "react";

import { type ChangedFile, getDiff } from "../lib/git/index.js";

type Props = {
  file: ChangedFile | undefined;
  focused: boolean;
  height: number;
  width: number;
};

function parseDiff(diff: string): string[] {
  const raw = diff ? diff.split("\n") : ["(no diff)"];
  const hunkStart = raw.findIndex((l) => l.startsWith("@@"));
  return (hunkStart === -1 ? raw : raw.slice(hunkStart)).filter((l) => !l.startsWith("@@"));
}

function lineBg(line: string): string | undefined {
  if (line.startsWith("+") && !line.startsWith("+++")) return "#0d2a0d";
  if (line.startsWith("-") && !line.startsWith("---")) return "#2a0d0d";
  return undefined;
}

export function Diff({ file, focused, height, width }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const prevFileRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!file) {
      setLines([]);
      setScrollOffset(0);
      return;
    }
    const diff = getDiff(file.path, file.staged, file.status === "UNTRACKED");
    const parsed = parseDiff(diff);
    setLines(parsed);
    if (prevFileRef.current !== file.path) {
      setScrollOffset(0);
      setHorizontalOffset(0);
    }
    prevFileRef.current = file.path;
  }, [file]);

  useInput((_, key) => {
    const visibleCount = height - 2;
    const maxScroll = Math.max(0, lines.length - visibleCount);
    const maxLineLength = Math.max(0, ...lines.map((l) => l.length));
    const maxHorizontal = Math.max(0, maxLineLength - width);
    if (key.upArrow) setScrollOffset((s) => Math.max(0, s - 1));
    if (key.downArrow) setScrollOffset((s) => Math.min(maxScroll, s + 1));
    if (key.leftArrow) setHorizontalOffset((s) => Math.max(0, s - 1));
    if (key.rightArrow) setHorizontalOffset((s) => Math.min(maxHorizontal, s + 1));
  }, { isActive: focused });

  const visibleCount = height - 2;
  const visible = lines.slice(scrollOffset, scrollOffset + visibleCount);

  return (
    <Box flexDirection="column" width={width} height={height} overflow="hidden">
      <Text bold color={focused ? "whiteBright" : "gray"}>diff</Text>
      <Box height={1} />
      {visible.map((line, i) => {
        const content = line.slice(horizontalOffset, horizontalOffset + width) || " ";
        const displayLine = line.startsWith("+") || line.startsWith("-") ? content.slice(1) || " " : content;
        return (
          <Box key={i} width="100%" backgroundColor={lineBg(line)}>
            <Text color="white">{displayLine}</Text>
          </Box>
        );
      })}
    </Box>
  );
}
