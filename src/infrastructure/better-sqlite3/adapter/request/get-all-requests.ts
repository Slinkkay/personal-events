import { GetAllRequests } from "@/domain/request";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";
import { failure, success } from "@/result";

const createGetAllRequests = (table: string) => `
    select id, description, due_date, status from ${table}
`;

export function makeGetAllRequests(db: Database, sqliteConfig: SqliteConfig, appLogger: AppLogger): GetAllRequests {
    return {
        getAll: async () => {
            try {
                const statement = db.prepare<[], { id: string; description: string; due_date: string; status: string }>(
                    createGetAllRequests(sqliteConfig.tables.request),
                );

                const results = statement.all();

                return success(
                    results.map((item) => ({
                        id: item.id,
                        description: item.description,
                        dueDate: item.due_date,
                        status: item.status,
                    })),
                );
            } catch (err) {
                appLogger.error({
                    type: "getAllRequests:failed",
                });
                return failure();
            }
        },
    };
}
