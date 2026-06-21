import { render, Box, useApp, useInput, useStdout } from "ink";
import { useState } from "react";

import { Changes } from "./components/Changes.js";
import { Diff } from "./components/Diff.js";
import { Header } from "./components/Header.js";
import { type ChangedFile } from "./lib/git/index.js";
import { ENTER_ALT_SCREEN, EXIT_ALT_SCREEN, HIDE_CURSOR, SHOW_CURSOR } from "./lib/terminal.js";

type Pane = "changes" | "diff";

function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [focusedPane, setFocusedPane] = useState<Pane>("changes");
  const [selectedFile, setSelectedFile] = useState<ChangedFile | undefined>(undefined);

  useInput((input, key) => {
    if (input === "q" || (key.ctrl && input === "c")) exit();
    if (key.tab) setFocusedPane((p) => (p === "changes" ? "diff" : "changes"));
  });

  const changesWidth = Math.floor(stdout.columns * 0.3);
  const diffWidth = stdout.columns - changesWidth - 2;
  const paneHeight = stdout.rows - 2;

  return (
    <Box flexDirection="column" width={stdout.columns} height={stdout.rows} padding={0}>
      <Header />
      <Box height={1} />
      <Box flexDirection="row">
        <Changes
          width={changesWidth}
          height={paneHeight}
          focused={focusedPane === "changes"}
          onSelectedFile={setSelectedFile}
        />
        <Box width={2} />
        <Diff
          file={selectedFile}
          focused={focusedPane === "diff"}
          height={paneHeight}
          width={diffWidth}
        />
      </Box>
    </Box>
  );
}

process.stdout.write(ENTER_ALT_SCREEN + HIDE_CURSOR);

const { waitUntilExit, unmount } = render(<App />, { exitOnCtrlC: false });

process.on("SIGINT", unmount);
process.on("SIGTERM", unmount);

await waitUntilExit();

process.stdout.write(SHOW_CURSOR + EXIT_ALT_SCREEN);
