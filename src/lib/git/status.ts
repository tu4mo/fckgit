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
  oldPath: string | null
  oldDisplayPath: string | null
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

const RENAME_ARROW = ' -> '

function mapStatus(statusChar: string): GitFileStatus {
  return STATUS_MAP[statusChar] ?? '-'
}

function getStagedStatus(
  indexStatusChar: string,
  workingTreeStatusChar: string,
): StagedStatus {
  const isIndexChanged = indexStatusChar !== ' ' && indexStatusChar !== '?'
  const isWorkingTreeChanged =
    workingTreeStatusChar !== ' ' && workingTreeStatusChar !== '?'

  if (!isIndexChanged) {
    return 'NONE'
  }
  return isWorkingTreeChanged ? 'PARTIAL' : 'FULL'
}

// the status code is the index status, unless it's unchanged there (or the
// entry is untracked), in which case the working tree status applies
function getStatusChar(
  indexStatusChar: string,
  workingTreeStatusChar: string,
): string {
  if (workingTreeStatusChar === '?') {
    return '?'
  }
  const isIndexChanged = indexStatusChar !== ' ' && indexStatusChar !== '?'
  return isIndexChanged ? indexStatusChar : workingTreeStatusChar
}

// git quotes paths containing special characters (e.g. spaces) in porcelain output
function unquote(rawPath: string): string {
  return rawPath.startsWith('"') && rawPath.endsWith('"')
    ? rawPath.slice(1, -1)
    : rawPath
}

// renamed entries are formatted as "old -> new"
function parsePaths(rawPaths: string): {
  path: string
  oldPath: string | null
} {
  const arrowIndex = rawPaths.indexOf(RENAME_ARROW)

  if (arrowIndex === -1) {
    return { path: unquote(rawPaths), oldPath: null }
  }

  return {
    path: unquote(rawPaths.slice(arrowIndex + RENAME_ARROW.length)),
    oldPath: unquote(rawPaths.slice(0, arrowIndex)),
  }
}

function toDisplayPath(filePath: string): string {
  return path.relative(process.cwd(), path.join(repoRoot, filePath))
}

function parseStatusLine(line: string): ChangedFile {
  const indexStatusChar = line[0] ?? ' '
  const workingTreeStatusChar = line[1] ?? ' '
  const { path, oldPath } = parsePaths(line.slice(3))

  return {
    path,
    displayPath: toDisplayPath(path),
    oldPath,
    oldDisplayPath: oldPath === null ? null : toDisplayPath(oldPath),
    status: mapStatus(getStatusChar(indexStatusChar, workingTreeStatusChar)),
    workingTreeStatus: mapStatus(workingTreeStatusChar),
    stagedStatus: getStagedStatus(indexStatusChar, workingTreeStatusChar),
  }
}

export function getStatus(): ChangedFile[] {
  try {
    const output = git('status', '--porcelain', '--untracked-files=all')

    if (!output) {
      return []
    }

    return output.split('\n').map(parseStatusLine)
  } catch {
    return []
  }
}
