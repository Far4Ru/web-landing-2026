import { defineConfig } from "vite";

export default defineConfig({
  publicDir: false,
  build: {
    outDir: "scene",
    emptyOutDir: false,
    lib: {
      entry: "scene/index.js",
      name: "AnimalistScene",
      formats: ["iife"],
      fileName: () => "scene.js",
    },
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
});
