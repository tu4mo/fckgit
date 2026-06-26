import { extname } from "node:path";

import type { BundledLanguage } from "shiki";

const EXT_TO_LANG: Record<string, BundledLanguage> = {
  bash: "bash",
  c: "c",
  cpp: "cpp",
  cs: "csharp",
  css: "css",
  go: "go",
  html: "html",
  java: "java",
  js: "javascript",
  json: "json",
  jsx: "jsx",
  kt: "kotlin",
  lua: "lua",
  md: "markdown",
  php: "php",
  py: "python",
  rb: "ruby",
  rs: "rust",
  scss: "scss",
  sh: "bash",
  swift: "swift",
  toml: "toml",
  ts: "typescript",
  tsx: "tsx",
  vue: "vue",
  yaml: "yaml",
  yml: "yaml",
  zsh: "bash",
};

export function getLanguage(path: string): BundledLanguage | null {
  const ext = extname(path).slice(1).toLowerCase();
  return EXT_TO_LANG[ext] ?? null;
}
