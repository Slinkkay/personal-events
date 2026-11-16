import { AssociateToRolePersistence } from "@/domain/responsibility/associate-to-role";
import { failure, success } from "@/result";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";

const createAssociateToRoleInsert = (table: string) => `
    INSERT INTO ${table} (id, source, destination)
    VALUES (?, ?, ?);
`;

const createRemoveExistingAssociation = (table: string) => `
    DELETE FROM ${table}
    WHERE destination = ?;
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

        removeExistingAssociation: async ({ responsibilityId }) => {
            try {
                const removeAssociationStatement = db.prepare<[string]>(
                    createRemoveExistingAssociation(sqliteConfig.tables.roleToResponsibility),
                );

                removeAssociationStatement.run(responsibilityId);
            } catch (err: any) {
                appLogger.error({
                    type: "sqlite-remove-association",
                });
                return failure();
            }
            return success();
        },
    };
}
