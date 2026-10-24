import { GetAllRoles } from "@/domain/role";
import { Database } from "better-sqlite3";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";
import { failure, success } from "@/result";

const createGetAllRoles = (table: string) => `
    select id, name, description, status from ${table}
`;

export function makeGetAllRoles(db: Database, sqliteConfig: SqliteConfig, appLogger: AppLogger): GetAllRoles {
    return {
        getAll: async () => {
            try {
                const statement = db.prepare<[], { id: string; name: string; description: string; status: string }>(
                    createGetAllRoles(sqliteConfig.tables.role),
                );

                const results = statement.all();

                return success(
                    results.map((item) => ({
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        status: item.status,
                    })),
                );
            } catch (err) {
                appLogger.error({
                    type: "getAllRoles:failed",
                });
                return failure();
            }
        },
    };
}
