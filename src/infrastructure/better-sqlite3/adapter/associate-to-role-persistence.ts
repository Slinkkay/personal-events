import { AssociateToRolePersistence } from "@/domain/responsibility/associate-to-role";
import { failure, success } from "@/result";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";

const createAssociateToRoleInsert = (table: string) => `
    INSERT INTO ${table} (id, source, destination)
    VALUES (?, ?, ?);
`;

export function makeAssociateToRolePersistence(
    db: Database,
    sqliteConfig: SqliteConfig,
    appLogger: AppLogger,
): AssociateToRolePersistence {
    return {
        persist: async ({ roleId, responsibilityId, id }) => {
            try {
                const associateInsertStatement = db.prepare<[string, string, string]>(
                    createAssociateToRoleInsert(sqliteConfig.tables.roleToResponsibility),
                );

                associateInsertStatement.run(id, roleId, responsibilityId);
            } catch (err: any) {
                appLogger.error({
                    type: "sqlite-assocaite-to-role-insert",
                    err,
                });
                return failure();
            }
            return success();
        },
    };
}
