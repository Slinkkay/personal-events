import { PersistenceInit } from "@/domain/init";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { failure, success } from "@/result";
import { AppLogger } from "@/log";

const createRoleTableStatement = (table: string) => `
    CREATE TABLE ${table} (
        idx INTEGER PRIMARY KEY AUTOINCREMENT,
        id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL
    )`;

export function makePersistenceInit(client: Database, config: SqliteConfig, appLogger: AppLogger): PersistenceInit {
    return {
        createRolePersistence: () => {
            try {
                const createRoleStatement = client.prepare(createRoleTableStatement(config.tables.role));
                createRoleStatement.run([]);
            } catch (err: any) {
                appLogger.error({
                    type: "sqlite-init-error",
                    err,
                });
                return failure();
            }

            return success();
        },
    };
}
