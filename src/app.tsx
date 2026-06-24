import { render, Box, useApp, useInput, useStdout } from "ink";
import { useState } from "react";

import { Diff } from "./components/Diff.js";
import { Files } from "./components/Files.js";
import { Footer } from "./components/Footer.js";
import { type ChangedFile } from "./lib/git/status.js";
import { type Pane } from "./types.js";

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
    <Box flexDirection="column" width={stdout.columns} height={stdout.rows}>
      <Box flexDirection="row" flexGrow={1}>
        <Files width="30%" focused={focusedPane === "files"} onSelectedFile={setSelectedFile} />
        <Diff file={selectedFile} focused={focusedPane === "diff"} width="70%" />
      </Box>
      <Footer focusedPane={focusedPane} />
    </Box>
  );
}

render(<App />, { alternateScreen: true });
