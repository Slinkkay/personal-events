import { UpdateRoleName } from "@/domain/role";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";
import { failure, success } from "@/result";

const createNameUpdate = (table: string) => `
    UPDATE ${table}
    SET name = ?
    WHERE id = ?
`;

export function makeUpdateRoleName(db: Database, sqliteConfig: SqliteConfig, appLogger: AppLogger): UpdateRoleName {
    return {
        update: async ({ name, id }) => {
            try {
                const nameUpdateStatement = db.prepare<[string, string]>(createNameUpdate(sqliteConfig.tables.role));

                nameUpdateStatement.run(name, id);

                return success();
            } catch (err) {
                appLogger.error({
                    type: "sqlite-role-update-name",
                });
                return failure();
            }
        },
    };
}
