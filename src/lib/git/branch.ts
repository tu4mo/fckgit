import { git } from "./git.js";

export function getBranch(): string | null {
  try {
    return git("branch", "--show-current");
  } catch {
    return null;
  }
}
