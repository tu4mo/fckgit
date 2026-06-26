import parseDiff from "parse-diff";

import { readFile } from "./fs.js";
import { getDiff } from "./git/diff.js";
import { show } from "./git/show.js";
import type { ChangedFile } from "./git/status.js";

export type DiffFile = ReturnType<typeof parseDiff>[number];
export type DiffChange = DiffFile["chunks"][number]["changes"][number];

export type ViewState =
  | { mode: "diff"; staged: DiffFile[]; unstaged: DiffFile[] }
  | { mode: "content"; lines: string[] };

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

function readFileContent(file: ChangedFile): string {
  try {
    return file.status === "DELETED"
      ? show(file.stagedStatus !== "NONE" ? `HEAD:${file.path}` : `:${file.path}`)
      : readFile(file.path);
  } catch {
    return "";
  }
}

export function buildViewState(file: ChangedFile | undefined, contextLines: number): ViewState {
  if (!file) {
    return { mode: "diff", staged: [], unstaged: [] };
  }

  if (file.status === "DELETED" || file.status === "UNTRACKED") {
    const text = readFileContent(file);
    return { mode: "content", lines: text ? text.split("\n") : [] };
  }

  const { staged, unstaged } = getFileDiff(file, contextLines);
  return { mode: "diff", staged, unstaged };
}

export function getMaxLineLength(view: ViewState): number {
  if (view.mode === "content") {
    return Math.max(0, ...view.lines.map((l) => l.length));
  }

  const allChanges = [
    ...view.staged.flatMap((f) => f.chunks.flatMap((c) => c.changes)),
    ...view.unstaged.flatMap((f) => f.chunks.flatMap((c) => c.changes)),
  ];
  return Math.max(0, ...allChanges.map((c) => c.content.length - 1));
}
