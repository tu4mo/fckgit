import parseDiff from "parse-diff";

import { readFile } from "./fs.js";
import { getDiff } from "./git/diff.js";
import { show } from "./git/show.js";
import type { ChangedFile } from "./git/status.js";

export type Change = { type: "add" | "del" | "normal"; content: string };
export type Chunk = { changes: Change[] };

function readFileContent(file: ChangedFile): string {
  try {
    return file.status === "DELETED"
      ? show(file.stagedStatus !== "NONE" ? `HEAD:${file.path}` : `:${file.path}`)
      : readFile(file.path);
  } catch {
    return "";
  }
}

export function buildChunks(
  file: ChangedFile | undefined,
  contextLines: number,
  staged: boolean,
): Chunk[] {
  if (!file) {
    return [];
  }

  if (file.status === "DELETED" || file.status === "UNTRACKED") {
    if (staged) {
      return [];
    }

    const text = readFileContent(file);
    const lines = text.split("\n");
    const changeType = file.status === "DELETED" ? ("del" as const) : ("add" as const);

    return [{ changes: lines.map((line) => ({ type: changeType, content: line })) }];
  }

  const diff = getDiff({ path: file.path, staged, contextLines });
  const parsed = parseDiff(diff)[0];
  if (!parsed) {
    return [];
  }
  return parsed.chunks.map((chunk) => ({
    changes: chunk.changes.map((ch) => ({ type: ch.type, content: ch.content.slice(1) })),
  }));
}

export function getPanelVisibility(file: ChangedFile | undefined) {
  const isContentMode = file?.status === "DELETED" || file?.status === "UNTRACKED";
  const hasStagedPanel =
    !isContentMode && (file?.stagedStatus === "FULL" || file?.stagedStatus === "PARTIAL");
  const hasUnstagedPanel = isContentMode || file?.stagedStatus !== "FULL";
  return { isContentMode, hasStagedPanel, hasUnstagedPanel };
}

export function getMaxLineLength(chunks: Chunk[]): number {
  return Math.max(0, ...chunks.flatMap((c) => c.changes.map((ch) => ch.content.length)));
}
