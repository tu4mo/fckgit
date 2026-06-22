import { gitAllowFailure } from "./git.js";

export type DiffMode = "staged" | "unstaged" | "untracked";

export function getDiff({ path, mode }: { path: string; mode: DiffMode }): string {
  if (mode === "untracked") {
    return gitAllowFailure("diff", "--no-index", "/dev/null", path);
  }

  return mode === "staged"
    ? gitAllowFailure("diff", "--cached", path)
    : gitAllowFailure("diff", path);
}
