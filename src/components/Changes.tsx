import { Box, Text, useInput } from "ink";
import { ScrollList } from "ink-scroll-list";
import { useEffect, useState } from "react";

import { type ChangedFile, getStatus, stageFile, unstageFile } from "../lib/git/index.js";

type Props = {
  width: number;
  height: number;
  focused: boolean;
  onSelectedFile: (file: ChangedFile | undefined) => void;
};

function sortFiles<T extends { path: string }>(files: T[]): T[] {
  return files.slice().sort((a, b) => {
    const aDir = a.path.includes("/") ? a.path.slice(0, a.path.lastIndexOf("/")) : "";
    const bDir = b.path.includes("/") ? b.path.slice(0, b.path.lastIndexOf("/")) : "";
    if (aDir !== bDir) return aDir.localeCompare(bDir);
    return a.path.localeCompare(b.path);
  });
}

export function Changes({ width, height, focused, onSelectedFile }: Props) {
  const [files, setFiles] = useState(() => sortFiles(getStatus()));
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    onSelectedFile(files[selectedIndex]);
  }, [selectedIndex, files]);

  useInput((input, key) => {
    if (key.upArrow) setSelectedIndex((i) => Math.max(0, i - 1));
    if (key.downArrow) setSelectedIndex((i) => Math.min(files.length - 1, i + 1));
    if (input === " ") {
      const file = files[selectedIndex];
      if (!file) return;
      if (file.staged) {
        unstageFile(file.path);
      } else {
        stageFile(file.path);
      }
      setFiles(sortFiles(getStatus()));
    }
  }, { isActive: focused });

  return (
    <Box flexDirection="column" width={width} height={height}>
      <Text bold color={focused ? "whiteBright" : "gray"}>changes</Text>
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
