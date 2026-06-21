import { Text } from "ink";

import { getBranch } from "../lib/git/index.js";

export function Header() {
  const folder = process.cwd().split("/").pop();
  const branch = getBranch();

  return (
    <Text>
      <Text bold color="greenBright">
        f*ckgit
      </Text>
      <Text color="grey">{" • "}</Text>
      <Text bold color="whiteBright">
        /{folder}
      </Text>
      <Text color="gray">{" → "}</Text>
      <Text bold color="whiteBright">
        {branch}
      </Text>
    </Text>
  );
}
