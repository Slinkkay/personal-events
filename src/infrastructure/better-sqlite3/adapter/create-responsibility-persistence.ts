import { CreateResponsibilityPersistence } from "@/domain/responsibility/create";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";
import { failure, success } from "@/result";

const createResponsibilityInsert = (table: string) => `
    INSERT INTO ${table} (id, name, description, status)
    VALUES (?, ?, ?, ?);
`;

const findLatestId = (table: string) => `
    SELECT idx FROM ${table} 
    ORDER BY idx DESC 
    LIMIT 1;
`;

export function makeCreateResponsibilityPersistence(
    db: Database,
    sqliteConfig: SqliteConfig,
    appLogger: AppLogger,
): CreateResponsibilityPersistence {
    return {
        persist: async ({ name, description, id, status }) => {
            try {
                const roleInsertStatement = db.prepare<[string, string, string, string]>(
                    createResponsibilityInsert(sqliteConfig.tables.responsibility),
                );

                roleInsertStatement.run(id, name, description, status);
            } catch (err: any) {
                appLogger.error({
                    type: "sqlite-responsibility-insert",
                    err,
                });
                return failure();
            }
            return success();
        },
        getNextResponsibilityId: async () => {
            try {
                const prefix = sqliteConfig.prefix.responsibility;
                const responsibilityFetchStatement = db.prepare<[], { idx: number }>(
                    findLatestId(sqliteConfig.tables.responsibility),
                );

                const result = responsibilityFetchStatement.get();

                if (result === undefined) {
                    return success(`${prefix}-1`);
                }

                const nextId = result.idx + 1;

                return success(`${prefix}-${nextId}`);
            } catch (err: any) {
                appLogger.error({
                    type: "sqlite-responsibility-insert",
                    err,
                });
                return failure();
            }
        },
    };
}
