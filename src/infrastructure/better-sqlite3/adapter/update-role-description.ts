import { UpdateRoleDescription } from "@/domain/role";
import { failure, success } from "@/result";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";

const createDescriptionUpdate = (table: string) => `
    UPDATE ${table}
    SET description = ?
    WHERE id = ?
`;

export function makeUpdateRoleDescription(
    db: Database,
    sqliteConfig: SqliteConfig,
    appLogger: AppLogger,
): UpdateRoleDescription {
    return {
        update: async ({ description, id }) => {
            try {
                const descriptionUpdateStatement = db.prepare<[string, string]>(
                    createDescriptionUpdate(sqliteConfig.tables.role),
                );

                descriptionUpdateStatement.run(description, id);

                return success();
            } catch (err) {
                appLogger.error({
                    type: "sqlite-role-update-description",
                });
                return failure();
            }
        },
    };
}
