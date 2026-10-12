import { CompositionRoot, makeCompositionRoot, memoize } from "@/composition-root";
import { CliSystemInit, makeCliSystemInit } from "../system-init";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { Result, success } from "@/result";
import { join } from "node:path";

export type CliCompositionRoot = {
    root: CompositionRoot;
    getSystemInit(): CliSystemInit;
};

export function makeCliCompositionRoot(): CliCompositionRoot {
    const root = makeCompositionRoot();

    return {
        root,
        getSystemInit: memoize(() => makeCliSystemInit(root.domain.init.getSystemInit())),
    };
}

export async function initCLiRoot(root: CliCompositionRoot): Promise<Result> {
    const sqlite: SqliteConfig = {
        type: "sqlite",
        tables: {
            role: "role",
        },
        fileName: join("data", "app.sqlite"),
    };
    await root.root.init(sqlite);

    return success();
}
