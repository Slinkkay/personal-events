import { ResponsibilityFromRolePersistence } from "@/domain/responsibility";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";
import { failure, success } from "@/result";

const createGetResponsibilityFromRole = (roleToResponsibilityTable: string) => `
    SELECT destination
    FROM ${roleToResponsibilityTable}
    WHERE source = ?
`;

export function makeGetResponsibilityFromRolePersistence(
    db: Database,
    sqliteConfig: SqliteConfig,
    appLogger: AppLogger,
): ResponsibilityFromRolePersistence {
    return {
        findAll: async ({ roleId }) => {
            try {
                const statement = db.prepare<[string], { destination: string }>(
                    createGetResponsibilityFromRole(sqliteConfig.tables.roleToResponsibility),
                );

                const result = statement.all(roleId);

                return success(result.map((item) => item.destination));
            } catch (err) {
                appLogger.error({
                    type: "getResponsibilityFromRole:failed",
                });
                return failure();
            }
        },
    };
}
