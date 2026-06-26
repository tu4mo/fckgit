import { render, Box, useApp, useInput, useStdout } from "ink";
import { useState } from "react";

import { Footer } from "./components/Footer.js";
import { getPanelVisibility } from "./lib/diff.js";
import { type ChangedFile } from "./lib/git/status.js";
import { Diff } from "./panes/Diff/Diff.js";
import { Files } from "./panes/Files/Files.js";
import { type Pane } from "./types.js";

function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [focusedPane, setFocusedPane] = useState<Pane>("files");
  const [selectedFile, setSelectedFile] = useState<ChangedFile | undefined>(undefined);

  const { hasStagedPanel, hasUnstagedPanel } = getPanelVisibility(selectedFile);

  const activePanes: Pane[] = ["files"];
  if (hasUnstagedPanel) {
    activePanes.push("diff-unstaged");
  }
  if (hasStagedPanel) {
    activePanes.push("diff-staged");
  }

  const effectiveFocusedPane: Pane = activePanes.includes(focusedPane)
    ? focusedPane
    : activePanes[activePanes.length - 1]!;

  useInput((input, key) => {
    if (input === "q" || (key.ctrl && input === "c")) {
      exit();
    }
    if (key.tab) {
      const idx = activePanes.indexOf(effectiveFocusedPane);
      setFocusedPane(activePanes[(idx + 1) % activePanes.length]!);
    }
  });

  const focusedPanel: "unstaged" | "staged" | null =
    effectiveFocusedPane === "diff-unstaged"
      ? "unstaged"
      : effectiveFocusedPane === "diff-staged"
        ? "staged"
        : null;

  return (
    <Box flexDirection="column" width={stdout.columns} height={stdout.rows}>
      <Box flexDirection="row" flexGrow={1}>
        <Files
          width="30%"
          focused={effectiveFocusedPane === "files"}
          onSelectedFile={setSelectedFile}
        />
        <Diff file={selectedFile} focusedPanel={focusedPanel} width="70%" />
      </Box>
      <Footer focusedPane={effectiveFocusedPane} />
    </Box>
  );
}

render(<App />, { alternateScreen: true });
