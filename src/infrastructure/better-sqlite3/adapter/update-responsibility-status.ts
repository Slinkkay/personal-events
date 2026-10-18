import { UpdateResponsibilityStatus } from "@/domain/responsibility";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";
import { failure, success } from "@/result";

const createStatusUpdate = (table: string) => `
    UPDATE ${table}
    SET status = ?
    WHERE id = ?
`;

export function makeUpdateResponsibilityStatus(
    db: Database,
    sqliteConfig: SqliteConfig,
    appLogger: AppLogger,
): UpdateResponsibilityStatus {
    return {
        update: async ({ status, id }) => {
            try {
                const statusUpdateStatement = db.prepare<[string, string]>(
                    createStatusUpdate(sqliteConfig.tables.responsibility),
                );

                statusUpdateStatement.run(status, id);

                return success();
            } catch (err) {
                appLogger.error({
                    type: "sqlite-responsibility-update-status",
                });
                return failure();
            }
        },
    };
}
