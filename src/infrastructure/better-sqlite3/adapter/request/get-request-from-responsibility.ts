import { GetFromResponsibilityPersistence } from "@/domain/request/get-from-responsibility";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";
import { failure, success } from "@/result";

const createGetRequestFromResponsibility = (requestToResponsibility: string) => `
    SELECT destination
    FROM ${requestToResponsibility}
    WHERE source = ?
`;

export function makeGetFromResponsibilityPersistence(
    db: Database,
    sqliteConfig: SqliteConfig,
    appLogger: AppLogger,
): GetFromResponsibilityPersistence {
    return {
        get: async ({ responsibilityId }) => {
            try {
                const statement = db.prepare<[string], { destination: string }>(
                    createGetRequestFromResponsibility(sqliteConfig.tables.responsibilityToRequest),
                );

                const result = statement.all(responsibilityId);

                return success(result.map((item) => item.destination));
            } catch (err) {
                appLogger.error({
                    type: "getRequestFromResponsibility:failed",
                });
                return failure();
            }
        },
    };
}
