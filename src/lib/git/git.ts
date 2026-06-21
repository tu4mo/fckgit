import { execFileSync, spawnSync } from "child_process";

export function git(...args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8", stdio: "pipe" }).trimEnd();
}

// For commands that exit non-zero on success (e.g. `diff --no-index` exits 1 when files differ)
export function gitAllowFailure(...args: string[]): string {
  const result = spawnSync("git", args, { encoding: "utf8" });
  return result.stdout?.trim() ?? "";
}
