import path from "node:path";

import { Box, Text, useInput } from "ink";
import { ScrollList } from "ink-scroll-list";
import { useEffect, useMemo, useState, type ComponentProps } from "react";

import { useRepository } from "../hooks/useRepository.js";
import { type ChangedFile, type GitFileStatus, type StagedStatus } from "../lib/git/status.js";

type Props = {
  focused: boolean;
  onSelectedFile: (file: ChangedFile | undefined) => void;
  width: ComponentProps<typeof Box>["width"];
};

const CIRCLE_COLOR: Record<StagedStatus, string> = {
  NONE: "white",
  PARTIAL: "yellow",
  FULL: "green",
};

const STATUS: Record<GitFileStatus, { symbol: string; color: string }> = {
  "MODIFIED": { symbol: "ᵐ", color: "yellow" },
  "ADDED": { symbol: "ᵃ", color: "green" },
  "DELETED": { symbol: "ᵈ", color: "red" },
  "RENAMED": { symbol: "ʳ", color: "cyan" },
  "UNTRACKED": { symbol: "ᵘ", color: "gray" },
  "-": { symbol: "⁻", color: "gray" },
};

export function Files({ width, focused, onSelectedFile }: Props) {
  const { files, branch, stage, unstage } = useRepository();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const repo = useMemo(() => process.cwd().split("/").pop(), []);

  useEffect(() => {
    onSelectedFile(files[selectedIndex]);
  }, [selectedIndex, files, onSelectedFile]);

  useInput(
    (input, key) => {
      if (key.upArrow) {
        setSelectedIndex((i) => Math.max(0, i - 1));
      }
      if (key.downArrow) {
        setSelectedIndex((i) => Math.min(files.length - 1, i + 1));
      }
      if (input === " ") {
        const file = files[selectedIndex];
        if (!file) {
          return;
        }
        if (file.stagedStatus === "FULL") {
          unstage(file.path);
        } else {
          stage(file.path);
        }
      }
    },
    { isActive: focused },
  );

  return (
    <Box flexDirection="column" width={width}>
      <Box marginX={1} overflow="hidden" gap={1}>
        <Box overflow="hidden" minWidth={3}>
          <Text bold color={focused ? "whiteBright" : "gray"} wrap="truncate-middle">
            {repo}
          </Text>
        </Box>
        <Box flexShrink={0}>
          <Text color="gray">⌥</Text>
        </Box>
        <Box overflow="hidden" minWidth={3}>
          <Text color={focused ? "whiteBright" : "gray"} wrap="truncate-middle">
            {branch}
          </Text>
        </Box>
      </Box>
      <Box borderColor={focused ? "white" : "gray"} borderStyle="round" flexGrow={1}>
        <ScrollList height="100%" selectedIndex={selectedIndex} width="100%">
          {files.map((file, i) => {
            const selected = i === selectedIndex;
            const name = path.basename(file.displayPath);
            const dir =
              path.dirname(file.displayPath) === "." ? "" : path.dirname(file.displayPath);

            return (
              <Box
                key={file.path}
                backgroundColor={selected ? "gray" : undefined}
                paddingX={1}
                height={1}
              >
                <Text color={CIRCLE_COLOR[file.stagedStatus]}>
                  {file.stagedStatus === "NONE" ? "○" : "●"}{" "}
                </Text>
                <Box flexGrow={1} overflow="hidden">
                  <Text wrap="hard">
                    <Text color="whiteBright">{name}</Text>
                    {dir ? <Text color={selected ? "white" : "gray"}> {dir}</Text> : null}
                  </Text>
                </Box>
                <Box flexShrink={0} marginLeft={1}>
                  <Text color={STATUS[file.status].color}>{STATUS[file.status].symbol}</Text>
                </Box>
              </Box>
            );
          })}
        </ScrollList>
      </Box>
    </Box>
  );
}
