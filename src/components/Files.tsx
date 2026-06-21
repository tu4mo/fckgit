import { Box, Text, useInput } from "ink";
import { ScrollList } from "ink-scroll-list";
import { useEffect, useMemo, useState } from "react";

import { useRepository } from "../hooks/useRepository.js";
import { type ChangedFile, getBranch } from "../lib/git/index.js";

type Props = {
  width: number;
  height: number;
  focused: boolean;
  onSelectedFile: (file: ChangedFile | undefined) => void;
};

export function Files({ width, height, focused, onSelectedFile }: Props) {
  const { files, stage, unstage } = useRepository();
  const folder = useMemo(() => process.cwd().split("/").pop(), []);
  const branch = useMemo(() => getBranch(), []);
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
        if (file.staged) {
          unstage(file.path);
        } else {
          stage(file.path);
        }
      }
    },
    { isActive: focused },
  );

  return (
    <Box flexDirection="column" width={width} height={height}>
      <Text>
        <Text bold color={focused ? "whiteBright" : "gray"}>/{folder}</Text>
        <Text color="gray">{" → "}</Text>
        <Text bold color={focused ? "whiteBright" : "gray"}>{branch}</Text>
      </Text>
      <Box height={1} />
      <ScrollList height={height - 2} selectedIndex={selectedIndex} scrollAlignment="center">
        {files.map((file, i) => {
          const parts = file.path.split("/");
          const name = parts.at(-1) ?? file.path;
          const dir = parts.slice(0, -1).join("/");

          return (
            <Box
              key={file.path}
              width={width}
              backgroundColor={i === selectedIndex ? "#222" : undefined}
            >
              <Text dimColor color={file.staged ? "green" : "gray"}>
                {file.staged ? "●" : "○"}{" "}
              </Text>
              <Box flexGrow={1} overflow="hidden">
                <Text>{name}</Text>
                {dir ? <Text color="gray"> {dir}</Text> : null}
              </Box>
              <Text color="gray"> {file.status[0]!.toLowerCase()}</Text>
            </Box>
          );
        })}
      </ScrollList>
    </Box>
  );
}
