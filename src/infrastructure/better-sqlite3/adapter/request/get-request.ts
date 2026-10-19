import { GetRequest } from "@/domain/request";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";
import { failure, success } from "@/result";

const createGetRequest = (table: string) => `
    select  id, description, due_date, status from ${table} where id = ?
`;

export function makeGetRequest(db: Database, sqliteConfig: SqliteConfig, appLogger: AppLogger): GetRequest {
    return {
        get: async ({ id }) => {
            try {
                const getStatement = db.prepare<
                    [string],
                    { id: string; description: string; due_date: string; status: string }
                >(createGetRequest(sqliteConfig.tables.request));

                const getResult = getStatement.get(id);

                if (getResult === undefined) {
                    return failure();
                }

                return success({
                    id: getResult.id,
                    description: getResult.description,
                    dueDate: getResult.due_date,
                    status: getResult.status,
                });
            } catch (err) {
                appLogger.error({
                    type: "getRequest:failed",
                });
                return failure();
            }
        },
    };
}
