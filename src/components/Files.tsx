import path from "node:path";

import { Box, Text, useBoxMetrics, useInput } from "ink";
import { ScrollList } from "ink-scroll-list";
import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";

import { useRepository } from "../hooks/useRepository.js";
import { type ChangedFile, type GitFileStatus, type StagedStatus } from "../lib/git/status.js";
import { truncateMiddle } from "../lib/truncateMiddle.js";
import { LabelBox } from "./LabelBox.js";

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
  const labelBoxRef = useRef(null);
  const { width: labelBoxWidth, hasMeasured } = useBoxMetrics(labelBoxRef);

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

  const availableWidth =
    labelBoxWidth -
    2 - // padding
    2 - // border
    2 - // margin
    3; // repo symbol and space;

  const truncatedRepo = truncateMiddle(repo, Math.floor(availableWidth / 2));
  const truncatedBranch = truncateMiddle(branch, Math.floor(availableWidth / 2));

  return (
    <Box flexDirection="column" width={width}>
      <LabelBox
        flexGrow={1}
        focused={focused}
        label={
          hasMeasured && (
            <Box gap={1} height={1}>
              <Text bold color={focused ? "whiteBright" : "gray"}>
                {truncatedRepo}
              </Text>
              <Text color="gray">⌥</Text>
              <Text color={focused ? "whiteBright" : "gray"}>{truncatedBranch}</Text>
            </Box>
          )
        }
        ref={labelBoxRef}
      >
        <ScrollList height="100%" selectedIndex={selectedIndex} width="100%">
          {files.map((file, i) => {
            const selected = i === selectedIndex;
            const name = path.basename(file.displayPath);
            const dir =
              path.dirname(file.displayPath) === "." ? "" : path.dirname(file.displayPath);
            const displayStatus =
              file.workingTreeStatus !== "-" ? file.workingTreeStatus : file.status;

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
                  <Text color={STATUS[displayStatus].color}>{STATUS[displayStatus].symbol}</Text>
                </Box>
              </Box>
            );
          })}
        </ScrollList>
      </LabelBox>
    </Box>
  );
}
