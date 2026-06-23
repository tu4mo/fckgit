import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/app.tsx",
  platform: "node",
  output: {
    file: "dist/app.js",
    format: "esm",
    codeSplitting: false,
    minify: true,
    banner: "#!/usr/bin/env node",
  },
  plugins: [
    {
      name: "stub-react-devtools-core",
      resolveId(id) {
        if (id === "react-devtools-core") {
          return { id, external: false, moduleSideEffects: false };
        }
      },
      load(id) {
        if (id === "react-devtools-core") {
          return "export default { initialize() {}, connectToDevTools() {} }";
        }
      },
    },
  ],
});
