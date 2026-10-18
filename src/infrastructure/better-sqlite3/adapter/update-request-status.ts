import { UpdateRequestStatus } from "@/domain/request/update-status";
import { failure, success } from "@/result";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";

const createStatusUpdate = (table: string) => `
    UPDATE ${table}
    SET status = ?
    WHERE id = ?
`;

export function makeUpdateRequestStatus(
    db: Database,
    sqliteConfig: SqliteConfig,
    appLogger: AppLogger,
): UpdateRequestStatus {
    return {
        update: async ({ id, status }) => {
            try {
                const dueDateUpdateStatement = db.prepare<[string, string]>(
                    createStatusUpdate(sqliteConfig.tables.request),
                );

                dueDateUpdateStatement.run(status, id);

                return success();
            } catch (err) {
                appLogger.error({
                    type: "sqlite-request-update-status",
                });
                return failure();
            }
        },
    };
}
