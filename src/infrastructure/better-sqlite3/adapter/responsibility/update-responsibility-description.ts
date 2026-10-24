import { UpdateResponsibilityDescription } from "@/domain/responsibility";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";
import { failure, success } from "@/result";

const createDescriptionUpdate = (table: string) => `
    UPDATE ${table}
    SET description = ?
    WHERE id = ?
`;

export function makeUpdateResponsibilityDescription(
    db: Database,
    sqliteConfig: SqliteConfig,
    appLogger: AppLogger,
): UpdateResponsibilityDescription {
    return {
        update: async ({ description, id }) => {
            try {
                const descriptionUpdateStatement = db.prepare<[string, string]>(
                    createDescriptionUpdate(sqliteConfig.tables.responsibility),
                );

                descriptionUpdateStatement.run(description, id);

                return success();
            } catch (err) {
                appLogger.error({
                    type: "sqlite-responsibility-update-description",
                });
                return failure();
            }
        },
    };
}
