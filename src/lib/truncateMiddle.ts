export function truncateMiddle(str: string | undefined | null, maxLength: number): string {
  if (!str) {
    return "";
  }

  if (str.length <= maxLength) {
    return str;
  }

  const ellipsis = "…";
  const charsToShow = maxLength - ellipsis.length;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);

  return str.slice(0, frontChars) + ellipsis + str.slice(str.length - backChars);
}
