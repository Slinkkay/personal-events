import { CompositionRoot } from "@/composition-root";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { join } from "node:path";

export async function initSqliteConfig(root: CompositionRoot) {
    const sqlite: SqliteConfig = {
        type: "sqlite",
        tables: {
            role: "role",
            responsibility: "responsibility",
            request: "request",
            roleToResponsibility: "roleToResponsibility",
            responsibilityToRequest: "responsibilityToRequest",
        },
        prefix: {
            role: "ROLE",
            request: "REQ",
            responsibility: "RES",
        },
        fileName: join("data", "app.sqlite"),
    };
    await root.init(sqlite);
}
