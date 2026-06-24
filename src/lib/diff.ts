import { getDiff, show, type ChangedFile } from "./git/index.js";

export type DiffLine = {
  kind: "add" | "remove" | "context" | "separator";
  text: string;
  staged: boolean;
};

export function parseDiff({ raw, staged }: { raw: string; staged: boolean }): DiffLine[] {
  if (!raw) {
    return [];
  }

  const lines = raw.split("\n");
  const hunkStart = lines.findIndex((l) => l.startsWith("@@"));
  if (hunkStart === -1) {
    return [];
  }

  let firstHunk = true;
  return lines.slice(hunkStart).flatMap((line): DiffLine[] => {
    if (line.startsWith("@@")) {
      if (firstHunk) {
        firstHunk = false;
        return [];
      }
      return [{ kind: "separator", text: "···", staged }];
    }

    if (line.startsWith("+")) {
      return [{ kind: "add", text: line.slice(1), staged }];
    }

    if (line.startsWith("-")) {
      return [{ kind: "remove", text: line.slice(1), staged }];
    }

    return [{ kind: "context", text: line.slice(1), staged }];
  });
}

function deletedFileLines(path: string, staged: boolean): DiffLine[] {
  const content = show(staged ? `HEAD:${path}` : `:${path}`);
  if (!content) {
    return [];
  }
  return content.split("\n").map((text) => ({ kind: "remove", text, staged }));
}

export function getFileDiffLines(file: ChangedFile, contextLines = 3): DiffLine[] {
  if (file.stagedStatus === "PARTIAL") {
    const parse = (staged: boolean) =>
      parseDiff({
        raw: getDiff({ path: file.path, mode: staged ? "staged" : "unstaged", contextLines }),
        staged,
      });

    const stagedLines = parse(true);
    const unstagedLines = parse(false);
    const divider: DiffLine = { kind: "separator", text: "unstaged", staged: false };

    return [
      ...stagedLines,
      ...(stagedLines.length && unstagedLines.length ? [divider] : []),
      ...unstagedLines,
    ];
  }

  const staged = file.stagedStatus !== "NONE";

  if (file.status === "DELETED") {
    return deletedFileLines(file.path, staged);
  }

  const mode = file.status === "UNTRACKED" ? "untracked" : staged ? "staged" : "unstaged";

  return parseDiff({ raw: getDiff({ path: file.path, mode, contextLines }), staged });
}
