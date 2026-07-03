import { render, Box, useApp, useInput, useWindowSize } from 'ink'
import { useState } from 'react'

import { Diff } from './components/Diff/Diff.js'
import { Files } from './components/Files/Files.js'
import { Footer } from './components/Footer.js'
import { type ChangedFile } from './lib/git/status.js'

function App() {
  const { exit } = useApp()
  const { columns, rows } = useWindowSize()
  const [selectedFile, setSelectedFile] = useState<ChangedFile | undefined>(
    undefined,
  )

  useInput((input) => {
    if (input === 'q') {
      exit()
    }
  })

  return (
    <Box flexDirection="column" width={columns} height={rows}>
      <Box flexDirection="row" flexGrow={1}>
        <Files width="30%" onSelectedFile={setSelectedFile} />
        <Diff file={selectedFile} width="70%" />
      </Box>
      <Footer />
    </Box>
  )
}

render(<App />, { alternateScreen: true })
