import { defineConfig, configDefaults } from "vitest/config";
import { UserWorkspaceConfig } from "vitest/node";

const sharedConfig: UserWorkspaceConfig = {
    resolve: {
        alias: {
            "@": "./src",
        },
    },
    test: {
        pool: "forks",
        environment: "node",
        execArgv: ["--import=tsx"],
        exclude: [...configDefaults.exclude],
    },
};

export default defineConfig({
    test: {
        projects: [
            {
                ...sharedConfig,
                test: {
                    ...sharedConfig.test,
                    include: ["**/*.spec.ts"],
                    name: "Unit",
                },
            },
            {
                ...sharedConfig,
                test: {
                    ...sharedConfig.test,
                    name: "Component",
                    include: ["**/*.component.ts"],
                    testTimeout: 0,
                },
            },
        ],
    },
});
