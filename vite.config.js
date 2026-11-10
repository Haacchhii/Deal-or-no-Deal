import { defineConfig } from "vite";
import { copyFileSync, mkdirSync } from "node:fs";

export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "copy-classic-game-script",
      closeBundle() {
        mkdirSync("dist/src", { recursive: true });
        for (const file of ["main.js", "feud-game.js", "feud.js"]) {
          copyFileSync(`src/${file}`, `dist/src/${file}`);
        }
      },
    },
  ],
});
