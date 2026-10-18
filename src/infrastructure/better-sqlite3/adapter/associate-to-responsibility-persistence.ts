import { AssociateToResponsibilityPersistence } from "@/domain/request/associate-to-responsibility";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";
import { failure, success } from "@/result";

const createAssociateToResponsibilityInsert = (table: string) => `
    INSERT INTO ${table} (id, source, destination)
    VALUES (?, ?, ?);
`;

export function makeAssociateToResponsibilityPersistence(
    db: Database,
    sqliteConfig: SqliteConfig,
    appLogger: AppLogger,
): AssociateToResponsibilityPersistence {
    return {
        persist: async ({ responsibilityId, requestId, id }) => {
            try {
                const associateInsertStatement = db.prepare<[string, string, string]>(
                    createAssociateToResponsibilityInsert(sqliteConfig.tables.responsibilityToRequest),
                );

                associateInsertStatement.run(id, responsibilityId, requestId);
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
