import { UpdateResponsibilityName } from "@/domain/responsibility";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";
import { failure, success } from "@/result";

const createNameUpdate = (table: string) => `
    UPDATE ${table}
    SET name = ?
    WHERE id = ?
`;

export function makeUpdateResponsibilityName(
    db: Database,
    sqliteConfig: SqliteConfig,
    appLogger: AppLogger,
): UpdateResponsibilityName {
    return {
        update: async ({ id, name }) => {
            try {
                const nameUpdateStatement = db.prepare<[string, string]>(
                    createNameUpdate(sqliteConfig.tables.responsibility),
                );

                nameUpdateStatement.run(name, id);

                return success();
            } catch (err) {
                appLogger.error({
                    type: "sqlite-responsibility-update-name",
                });
                return failure();
            }
        },
    };
}
