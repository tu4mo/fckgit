import { git } from "./git.js";

export type GitFileStatus = "MODIFIED" | "ADDED" | "DELETED" | "RENAMED" | "UNTRACKED" | "-";

export type ChangedFile = {
  path: string;
  status: GitFileStatus;
  staged: boolean;
};

const STATUS_MAP: Record<string, GitFileStatus> = {
  "M": "MODIFIED",
  "A": "ADDED",
  "D": "DELETED",
  "R": "RENAMED",
  "?": "UNTRACKED",
};

export function getStatus(): ChangedFile[] {
  try {
    const output = git("status", "--porcelain", "--untracked-files=all");

    if (!output) return [];

    return output.split("\n").map((line) => {
      const indexChar = line[0];
      const wtChar = line[1];
      const staged = indexChar !== " " && indexChar !== "?";
      const code = wtChar === "?" ? "?" : staged ? indexChar : wtChar;
      return {
        path: line.slice(3),
        status: STATUS_MAP[code ?? ""] ?? "-",
        staged,
      };
    });
  } catch {
    return [];
  }
}
