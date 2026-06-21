import { execFileSync, spawnSync } from "child_process";

export function git(...args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8", stdio: "pipe" }).trim();
}

export function getDiff(path: string, staged: boolean, untracked: boolean): string {
  if (untracked) {
    try {
      const result = spawnSync("git", ["diff", "--no-index", "/dev/null", path], { encoding: "utf8" });
      return result.stdout?.trim() ?? "";
    } catch {
      return "";
    }
  }
  try {
    return staged
      ? git("diff", "--cached", path)
      : git("diff", path);
  } catch {
    return "";
  }
}

export function stageFile(path: string): void {
  git("add", path);
}

export function unstageFile(path: string): void {
  try {
    git("restore", "--staged", path);
  } catch {
    // No HEAD yet (initial commit) — fall back to removing from index
    git("rm", "--cached", "--force", path);
  }
}
