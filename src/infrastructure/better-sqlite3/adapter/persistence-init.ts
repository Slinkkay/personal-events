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

const createResponsibilityStatement = (table: string) => `
    CREATE TABLE ${table} (
        idx INTEGER PRIMARY KEY AUTOINCREMENT,
        id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'OPEN'
    );
`;

const createRequestStatement = (table: string) => `
    CREATE TABLE ${table} (
        idx INTEGER PRIMARY KEY AUTOINCREMENT,
        id TEXT NOT NULL,
        description TEXT NOT NULL,
        due_date TEXT,
        status TEXT NOT NULL DEFAULT 'pending'
    );
`;

export function makePersistenceInit(client: Database, config: SqliteConfig, appLogger: AppLogger): PersistenceInit {
    return {
        createRolePersistence: () => {
            try {
                const createRoleTable = client.prepare(createRoleTableStatement(config.tables.role));
                createRoleTable.run([]);
            } catch (err: any) {
                appLogger.error({
                    type: "sqlite-init-error",
                    err,
                });
                return failure();
            }

            return success();
        },
        createResponsibilityPersistence: () => {
            try {
                const createResponsibilityTable = client.prepare(
                    createResponsibilityStatement(config.tables.responsibility),
                );
                createResponsibilityTable.run([]);
            } catch (err: any) {
                appLogger.error({
                    type: "sqlite-init-error",
                    err,
                });
                return failure();
            }
            return success();
        },
        createRequestPersistence: () => {
            try {
                const createResponsibilityTable = client.prepare(createRequestStatement(config.tables.request));
                createResponsibilityTable.run([]);
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
