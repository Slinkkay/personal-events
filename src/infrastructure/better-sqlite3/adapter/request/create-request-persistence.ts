import { CreateRequestPersistence } from "@/domain/request";
import { failure, success } from "@/result";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";

const createRequestInsert = (table: string) => `
    INSERT INTO ${table} (id, description, due_date, status)
    VALUES (?, ?, ?, ?);
`;

const findLatestId = (table: string) => `
    SELECT idx FROM ${table} 
    ORDER BY idx DESC 
    LIMIT 1;
`;

export function makeCreateRequestPersistence(
    db: Database,
    sqliteConfig: SqliteConfig,
    appLogger: AppLogger,
): CreateRequestPersistence {
    return {
        getNextId: async () => {
            try {
                const prefix = sqliteConfig.prefix.request;
                const requestFetchStatement = db.prepare<[], { idx: number }>(
                    findLatestId(sqliteConfig.tables.request),
                );

                const result = requestFetchStatement.get();

                if (result === undefined) {
                    return success(`${prefix}-1`);
                }

                const nextId = result.idx + 1;

                return success(`${prefix}-${nextId}`);
            } catch (err: any) {
                appLogger.error({
                    type: "sqlite-request-insert",
                    err,
                });
                return failure();
            }
        },
        create: async ({ description, dueDate, id, status }) => {
            try {
                const requestInsertStatement = db.prepare<[string, string, string, string]>(
                    createRequestInsert(sqliteConfig.tables.request),
                );

                requestInsertStatement.run(id, description, dueDate, status);
            } catch (err: any) {
                appLogger.error({
                    type: "sqlite-request-insert",
                    err,
                });
                return failure();
            }
            return success();
        },
    };
}
