import { GetResponsibility } from "@/domain/responsibility";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";
import { failure, success } from "@/result";

const createGetResponsibility = (table: string) => `
    select  id, name, description, status from ${table} where id = ?
`;

export function makeGetResponsibility(
    db: Database,
    sqliteConfig: SqliteConfig,
    appLogger: AppLogger,
): GetResponsibility {
    return {
        get: async ({ id }) => {
            try {
                const getStatement = db.prepare<
                    [string],
                    { id: string; name: string; description: string; status: string }
                >(createGetResponsibility(sqliteConfig.tables.responsibility));

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
                    type: "getResponsibility:failed",
                });
                return failure();
            }
        },
    };
}
