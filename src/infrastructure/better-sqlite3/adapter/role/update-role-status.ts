import { UpdateRoleStatus } from "@/domain/role";
import { failure, success } from "@/result";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";

const createStatusUpdate = (table: string) => `
    UPDATE ${table}
    SET status = ?
    WHERE id = ?
`;

export function makeUpdateRoleStatus(db: Database, sqliteConfig: SqliteConfig, appLogger: AppLogger): UpdateRoleStatus {
    return {
        update: async ({ status, id }) => {
            try {
                const statusUpdateStatement = db.prepare<[string, string]>(
                    createStatusUpdate(sqliteConfig.tables.role),
                );

                statusUpdateStatement.run(status, id);

                return success();
            } catch (err) {
                appLogger.error({
                    type: "sqlite-role-update-status",
                });
                return failure();
            }
        },
    };
}
