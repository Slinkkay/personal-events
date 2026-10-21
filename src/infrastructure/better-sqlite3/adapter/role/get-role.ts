import { GetRole } from "@/domain/role";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";
import { failure, success } from "@/result";

const createGetRole = (table: string) => `
    select  id, name, description, status from ${table} where id = ?
`;

export function makeGetRole(db: Database, sqliteConfig: SqliteConfig, appLogger: AppLogger): GetRole {
    return {
        get: async ({ id }) => {
            try {
                const getStatement = db.prepare<
                    [string],
                    { id: string; name: string; description: string; status: string }
                >(createGetRole(sqliteConfig.tables.role));

                const getResult = getStatement.get(id);

                if (getResult === undefined) {
                    return failure();
                }

                return success({
                    id: getResult.id,
                    name: getResult.name,
                    description: getResult.description,
                    status: getResult.status,
                });
            } catch (err) {
                appLogger.error({
                    type: "getRole:failed",
                });
                return failure();
            }
        },
    };
}
