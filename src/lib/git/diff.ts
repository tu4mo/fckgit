import { gitAllowFailure } from "./git.js";

export function getDiff(path: string, staged: boolean, untracked: boolean): string {
  if (untracked) return gitAllowFailure("diff", "--no-index", "/dev/null", path);
  // git diff exits 1 when differences are found (not an error), so use gitAllowFailure
  return staged
    ? gitAllowFailure("diff", "--cached", path)
    : gitAllowFailure("diff", path);
}
