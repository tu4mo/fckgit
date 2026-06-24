import { git } from "./git.js";

export function show(ref: string): string {
  return git("show", ref);
}
