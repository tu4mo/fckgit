import { Box, Text } from "ink";

import { type Pane } from "../types.js";
import { Notification } from "./Notification.js";

type Command = {
  key: string;
  label: string;
};

const COMMANDS: Record<Pane, Command[]> = {
  "files": [
    { key: "space", label: "stage/unstage" },
    { key: "tab", label: "switch pane" },
    { key: "q", label: "quit" },
  ],
  "diff-unstaged": [
    { key: "space", label: "stage" },
    { key: "+/-", label: "context" },
    { key: "tab", label: "switch pane" },
    { key: "q", label: "quit" },
  ],
  "diff-staged": [
    { key: "space", label: "unstage" },
    { key: "+/-", label: "context" },
    { key: "tab", label: "switch pane" },
    { key: "q", label: "quit" },
  ],
};

type Props = {
  focusedPane: Pane;
};

export function Footer({ focusedPane }: Props) {
  return (
    <Box gap={2} paddingX={1} height={1} overflow="hidden" position="relative">
      {COMMANDS[focusedPane].map(({ key, label }) => (
        <Box key={key} gap={1} flexShrink={0}>
          <Text bold color="white">
            {key}
          </Text>
          <Text color="gray">{label}</Text>
        </Box>
      ))}
      <Notification />
    </Box>
  );
}
