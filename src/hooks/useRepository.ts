import { useEffect, useState } from "react";

import { getBranch } from "../lib/git/branch.js";
import { type ChangedFile, getStatus, stageFile, unstageFile } from "../lib/git/index.js";

function sortFiles(files: ChangedFile[]): ChangedFile[] {
  return files.slice().sort((a, b) => {
    const aDir = a.path.split("/").slice(0, -1).join("/");
    const bDir = b.path.split("/").slice(0, -1).join("/");
    if (aDir !== bDir) {
      return aDir.localeCompare(bDir);
    }
    return a.path.localeCompare(b.path);
  });
}

export function useRepository() {
  const [files, setFiles] = useState(() => sortFiles(getStatus()));
  const [branch, setBranch] = useState(() => getBranch());

  function refresh() {
    setFiles(sortFiles(getStatus()));
    setBranch(getBranch());
  }

  useEffect(() => {
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, []);

  function stage(path: string) {
    stageFile(path);
    refresh();
  }

  function unstage(path: string) {
    unstageFile(path);
    refresh();
  }

  return { files, branch, stage, unstage };
}
