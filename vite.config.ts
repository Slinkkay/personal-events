// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";
import * as fs from "fs";
import checker from "vite-plugin-checker";

export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                codeSplitting: {
                    minSize: 20000,
                    groups: [
                        {
                            name: "react-vendor",
                            test: /node_modules[\\/]react/,
                            priority: 20,
                        },
                        {
                            name: "ui-vendor",
                            test: /node_modules[\\/]lucide-react/,
                            priority: 15,
                        },
                        {
                            name: "vendor",
                            test: /node_modules/,
                            priority: 10,
                        },
                        {
                            name: "common",
                            minShareCount: 2,
                            minSize: 10000,
                            priority: 5,
                        },
                    ],
                },
            },
            input: {
                // Replace 'custom.html' with your actual file name
                main: resolve("./src/app/webapp/pwa/index.html"),
            },
        },
    },
    resolve: {
        alias: {
            "@": resolve("./src"),
        },
    },
    plugins: [
        checker({
            typescript: true,
        }),
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
