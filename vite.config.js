import { defineConfig } from "vite";
import { copyFile, cp, mkdir } from "node:fs/promises";

function copyStaticFiles() {
  return {
    name: "copy-static-files",
    apply: "build",
    async closeBundle() {
      await mkdir("dist/scene", { recursive: true });
      await Promise.all([
        cp("games", "dist/games", { recursive: true }),
        copyFile("scene/scene.js", "dist/scene/scene.js"),
      ]);
    },
  };
}

export default defineConfig({
  base: "./",
  publicDir: false,
  plugins: [copyStaticFiles()],
});
