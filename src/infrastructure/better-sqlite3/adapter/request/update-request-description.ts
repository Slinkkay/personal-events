import { UpdateRequestDescription } from "@/domain/request/update-description";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";
import { failure, success } from "@/result";

const createDescriptionUpdate = (table: string) => `
    UPDATE ${table}
    SET description = ?
    WHERE id = ?
`;

export function makeUpdateRequestDescription(
    db: Database,
    sqliteConfig: SqliteConfig,
    appLogger: AppLogger,
): UpdateRequestDescription {
    return {
        update: async ({ id, description }) => {
            try {
                const descriptionUpdateStatement = db.prepare<[string, string]>(
                    createDescriptionUpdate(sqliteConfig.tables.request),
                );

                descriptionUpdateStatement.run(description, id);
            } catch (err) {
                appLogger.error({
                    type: "sqlite-request-update-description",
                });
                return failure();
            }

            return success();
        },
    };
}
