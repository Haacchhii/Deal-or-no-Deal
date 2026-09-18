import { defineConfig } from "vite";
import { copyFileSync, mkdirSync } from "node:fs";

export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "copy-classic-game-script",
      closeBundle() {
        mkdirSync("dist/src", { recursive: true });
        copyFileSync("src/main.js", "dist/src/main.js");
      },
    },
  ],
});
