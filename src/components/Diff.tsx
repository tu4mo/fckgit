import { Box, Text, useInput } from "ink";
import { useEffect, useMemo, useState, type ComponentProps } from "react";

import { useNotification } from "../hooks/useNotification.js";
import { getPanelVisibility } from "../lib/diff.js";
import { type ChangedFile } from "../lib/git/status.js";
import { getLanguage } from "../lib/highlight.js";
import { DiffPanel } from "./DiffPanel.js";

type Props = {
  file: ChangedFile | undefined;
  focusedPanel: "unstaged" | "staged" | null;
  width: ComponentProps<typeof Box>["width"];
};

const DEFAULT_CONTEXT_LINES = 3;

export function Diff({ file, focusedPanel, width }: Props) {
  const language = useMemo(() => (file ? getLanguage(file.path) : null), [file]);
  const [contextLines, setContextLines] = useState(DEFAULT_CONTEXT_LINES);
  const { addNotification } = useNotification();

  const { isContentMode, hasStagedPanel, hasUnstagedPanel } = getPanelVisibility(file);

  useEffect(() => {
    setContextLines(DEFAULT_CONTEXT_LINES);
  }, [file?.path]);

  useInput(
    (input) => {
      if (isContentMode) {
        return;
      }
      if (input === "+") {
        setContextLines((s) => {
          const next = s + 1;
          addNotification(`${next} context lines`);
          return next;
        });
      }
      if (input === "-") {
        setContextLines((s) => {
          const next = Math.max(0, s - 1);
          addNotification(`${next} context lines`);
          return next;
        });
      }
    },
    { isActive: focusedPanel !== null },
  );

  return (
    <Box flexDirection="column" flexGrow={1} width={width}>
      {hasUnstagedPanel && (
        <DiffPanel
          contextLines={contextLines}
          file={file}
          focused={focusedPanel === "unstaged"}
          label={
            <Text
              bold
              color={focusedPanel === "unstaged" ? "whiteBright" : "gray"}
              wrap="truncate-middle"
            >
              {file?.displayPath}: unstaged
            </Text>
          }
          language={language}
          staged={false}
        />
      )}
      {hasStagedPanel && (
        <DiffPanel
          contextLines={contextLines}
          file={file}
          focused={focusedPanel === "staged"}
          label={
            <Text
              bold
              color={focusedPanel === "staged" ? "whiteBright" : "gray"}
              wrap="truncate-middle"
            >
              {file?.displayPath}: staged
            </Text>
          }
          language={language}
          staged={true}
        />
      )}
    </Box>
  );
}
