import { Box, Text, useInput } from "ink";
import { ScrollList } from "ink-scroll-list";
import { useEffect, useState, type ComponentProps } from "react";

import { useRepository } from "../hooks/useRepository.js";
import { type ChangedFile, type GitFileStatus, type StagedStatus } from "../lib/git/index.js";

type Props = {
  focused: boolean;
  onSelectedFile: (file: ChangedFile | undefined) => void;
  width: ComponentProps<typeof Box>["width"];
};

const CIRCLE_COLOR: Record<StagedStatus, string> = {
  NONE: "gray",
  PARTIAL: "yellow",
  FULL: "green",
};

const STATUS_SYMBOLS: Record<GitFileStatus, string> = {
  "MODIFIED": "ᵐ",
  "ADDED": "ᵃ",
  "DELETED": "ᵈ",
  "RENAMED": "ʳ",
  "UNTRACKED": "ᵘ",
  "-": "⁻",
};

export function Files({ width, focused, onSelectedFile }: Props) {
  const { files, branch, stage, unstage } = useRepository();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    onSelectedFile(files[selectedIndex]);
  }, [selectedIndex, files, onSelectedFile]);

  useInput(
    (input, key) => {
      if (key.upArrow) setSelectedIndex((i) => Math.max(0, i - 1));
      if (key.downArrow) setSelectedIndex((i) => Math.min(files.length - 1, i + 1));
      if (input === " ") {
        const file = files[selectedIndex];
        if (!file) return;
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
      <Box marginLeft={1}>
        <Text bold color={focused ? "whiteBright" : "gray"}>
          {branch}
        </Text>
      </Box>
      <Box borderColor={focused ? "white" : "gray"} borderStyle="round" flexGrow={1}>
        <ScrollList height="100%" selectedIndex={selectedIndex} width="100%">
          {files.map((file, i) => {
            const parts = file.displayPath.split("/");
            const name = parts.at(-1) ?? file.displayPath;
            const dir = parts.slice(0, -1).join("/");

            return (
              <Box
                key={file.path}
                backgroundColor={i === selectedIndex ? "#222" : undefined}
                paddingX={1}
                height={1}
              >
                <Text color={CIRCLE_COLOR[file.stagedStatus]}>
                  {file.stagedStatus === "NONE" ? "○" : "●"}{" "}
                </Text>
                <Box flexGrow={1} overflow="hidden">
                  <Text wrap="hard">
                    <Text>{name}</Text>
                    {dir ? <Text color="gray"> {dir}</Text> : null}
                  </Text>
                </Box>
                <Box flexShrink={0} marginLeft={1}>
                  <Text color="gray">{STATUS_SYMBOLS[file.status]}</Text>
                </Box>
              </Box>
            );
          })}
        </ScrollList>
      </Box>
    </Box>
  );
}
