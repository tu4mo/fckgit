import { render, Box, useApp, useInput, useStdout } from 'ink'
import { useState } from 'react'

import { Footer } from './components/Footer.js'
import { type ChangedFile } from './lib/git/status.js'
import { Diff } from './panes/Diff/Diff.js'
import { Files } from './panes/Files/Files.js'

function App() {
  const { exit } = useApp()
  const { stdout } = useStdout()
  const [selectedFile, setSelectedFile] = useState<ChangedFile | undefined>(
    undefined,
  )

  useInput((input) => {
    if (input === 'q') {
      exit()
    }
  })

  return (
    <Box flexDirection="column" width={stdout.columns} height={stdout.rows}>
      <Box flexDirection="row" flexGrow={1}>
        <Files width="30%" onSelectedFile={setSelectedFile} />
        <Diff file={selectedFile} width="70%" />
      </Box>
      <Footer />
    </Box>
  )
}

render(<App />, { alternateScreen: true })
