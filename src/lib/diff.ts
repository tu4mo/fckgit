import parseDiff from "parse-diff";

import type { ChangedFile } from "./git/status.js";
import { getDiff } from "./git/diff.js";

export type DiffFile = ReturnType<typeof parseDiff>[number];
export type DiffChange = DiffFile["chunks"][number]["changes"][number];

export function getFileDiff(
  file: ChangedFile,
  contextLines = 3,
): { staged: DiffFile[]; unstaged: DiffFile[] } {
  if (file.stagedStatus === "PARTIAL") {
    const stagedDiff = getDiff({ path: file.path, staged: true, contextLines });
    const unstagedDiff = getDiff({ path: file.path, staged: false, contextLines });

    return {
      staged: parseDiff(stagedDiff),
      unstaged: parseDiff(unstagedDiff),
    };
  }

  const staged = file.stagedStatus !== "NONE";
  const stagedDiff = getDiff({ path: file.path, staged, contextLines });

  return {
    staged: parseDiff(stagedDiff),
    unstaged: [],
  };
}
