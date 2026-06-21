export type DiffLine = {
  kind: "add" | "remove" | "context" | "hunk";
  text: string;
};

export function parseDiff(raw: string): DiffLine[] {
  if (!raw) return [{ kind: "context", text: "(no diff)" }];

  const lines = raw.split("\n");
  const hunkStart = lines.findIndex((l) => l.startsWith("@@"));
  if (hunkStart === -1) return [{ kind: "context", text: "(no diff)" }];

  return lines.slice(hunkStart).map((line): DiffLine => {
    if (line.startsWith("@@")) return { kind: "hunk", text: line };
    if (line.startsWith("+")) return { kind: "add", text: line.slice(1) };
    if (line.startsWith("-")) return { kind: "remove", text: line.slice(1) };
    return { kind: "context", text: line.slice(1) };
  });
}
