import { UpdateRequestDueDate } from "@/domain/request/update-due-date";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";
import { failure, success } from "@/result";

const createDueDateUpdate = (table: string) => `
    UPDATE ${table}
    SET due_date = ?
    WHERE id = ?
`;

export function makeUpdateRequestDueDate(
    db: Database,
    sqliteConfig: SqliteConfig,
    appLogger: AppLogger,
): UpdateRequestDueDate {
    return {
        update: async ({ dueDate, id }) => {
            try {
                const dueDateUpdateStatement = db.prepare<[string, string]>(
                    createDueDateUpdate(sqliteConfig.tables.request),
                );

                dueDateUpdateStatement.run(dueDate, id);

                return success();
            } catch (err) {
                appLogger.error({
                    type: "sqlite-request-update-due-date",
                });
                return failure();
            }
        },
    };
}
