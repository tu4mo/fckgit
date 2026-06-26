import path from 'node:path'

import { git, repoRoot } from './git.js'

export type GitFileStatus =
  | 'MODIFIED'
  | 'ADDED'
  | 'DELETED'
  | 'RENAMED'
  | 'UNTRACKED'
  | '-'

export type StagedStatus = 'NONE' | 'PARTIAL' | 'FULL'

export type ChangedFile = {
  path: string
  displayPath: string
  status: GitFileStatus
  workingTreeStatus: GitFileStatus
  stagedStatus: StagedStatus
}

const STATUS_MAP: Record<string, GitFileStatus> = {
  'M': 'MODIFIED',
  'A': 'ADDED',
  'D': 'DELETED',
  'R': 'RENAMED',
  '?': 'UNTRACKED',
}

export function getStatus(): ChangedFile[] {
  try {
    const output = git('status', '--porcelain', '--untracked-files=all')

    if (!output) {
      return []
    }

    return output.split('\n').map((line) => {
      const [indexStatusChar, workingTreeStatusChar] = line

      const isIndexChanged = indexStatusChar !== ' ' && indexStatusChar !== '?'
      const isWorkingTreeChanged =
        workingTreeStatusChar !== ' ' && workingTreeStatusChar !== '?'

      const stagedStatus: StagedStatus = !isIndexChanged
        ? 'NONE'
        : isWorkingTreeChanged
          ? 'PARTIAL'
          : 'FULL'

      const statusCode =
        workingTreeStatusChar === '?'
          ? '?'
          : isIndexChanged
            ? indexStatusChar
            : workingTreeStatusChar

      // git quotes paths containing special characters (e.g. spaces) in porcelain output
      const rawPath = line.slice(3)
      const filePath =
        rawPath.startsWith('"') && rawPath.endsWith('"')
          ? rawPath.slice(1, -1)
          : rawPath

      const workingTreeStatus: GitFileStatus =
        workingTreeStatusChar === '?'
          ? 'UNTRACKED'
          : (STATUS_MAP[workingTreeStatusChar ?? ''] ?? '-')

      return {
        path: filePath,
        displayPath: path.relative(
          process.cwd(),
          path.join(repoRoot, filePath),
        ),
        status: STATUS_MAP[statusCode ?? ''] ?? '-',
        workingTreeStatus,
        stagedStatus,
      }
    })
  } catch {
    return []
  }
}
