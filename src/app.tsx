import { render, Box, useApp, useInput, useStdout } from "ink";
import { useState } from "react";

import { Diff } from "./components/Diff.js";
import { Files } from "./components/Files.js";
import { Header } from "./components/Header.js";
import { type ChangedFile } from "./lib/git/index.js";

type Pane = "files" | "diff";

function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [focusedPane, setFocusedPane] = useState<Pane>("files");
  const [selectedFile, setSelectedFile] = useState<ChangedFile | undefined>(undefined);

  useInput((input, key) => {
    if (input === "q" || (key.ctrl && input === "c")) {
      exit();
    }
    if (key.tab) {
      setFocusedPane((p) => (p === "files" ? "diff" : "files"));
    }
  });

  return (
    <Box flexDirection="column" gap={1} width={stdout.columns} height={stdout.rows}>
      <Header />
      <Box flexDirection="row" flexGrow={1}>
        <Files width="30%" focused={focusedPane === "files"} onSelectedFile={setSelectedFile} />
        <Diff file={selectedFile} focused={focusedPane === "diff"} width="70%" />
      </Box>
    </Box>
  );
}

render(<App />, { alternateScreen: true });
