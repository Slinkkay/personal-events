// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";
import * as fs from "fs";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                // Replace 'custom.html' with your actual file name
                main: resolve("./src/app/webapp/pwa/index.html"),
            },
        },
    },
    plugins: [
        {
            name: "move-html-to-root",
            closeBundle() {
                const srcPath = resolve("dist/src/app/webapp/pwa/index.html");
                const destPath = resolve("dist/index.html"); // or 'dist/custom.html'

                if (fs.existsSync(srcPath)) {
                    fs.renameSync(srcPath, destPath);
                    // Clean up empty nested folders if desired
                    fs.rmSync(resolve("dist/src"), {
                        recursive: true,
                        force: true,
                    });
                }
            },
        },
    ],
});
