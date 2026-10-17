import { CreateRolePersistence } from "@/domain/role";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { failure, success } from "@/result";
import { Database } from "better-sqlite3";
import { AppLogger } from "@/log";

export const createRoleInsert = (table: string) => `
    INSERT INTO ${table} (id, name, description)
    VALUES (?, ?, ?);
`;

export const findLatestId = (table: string) => `
    SELECT idx FROM ${table} 
    ORDER BY idx DESC 
    LIMIT 1;
`;

export function makeCreateRolePersistence(
    db: Database,
    sqliteConfig: SqliteConfig,
    appLogger: AppLogger,
): CreateRolePersistence {
    return {
        createRole: async ({ roleId, name, description }) => {
            try {
                const roleInsertStatement = db.prepare<[string, string, string]>(
                    createRoleInsert(sqliteConfig.tables.role),
                );

                roleInsertStatement.run(roleId, name, description);
            } catch (err: any) {
                appLogger.error({
                    type: "sqlite-role-insert",
                    err,
                });
                return failure();
            }

            return success();
        },
        getNextRoleId: async () => {
            try {
                const roleFetchStatement = db.prepare<[], { idx: number }>(findLatestId(sqliteConfig.tables.role));

                const result = roleFetchStatement.get();

                if (result === undefined) {
                    return success(`${sqliteConfig.prefix.role}-1`);
                }

                const nextId = result.idx + 1;

                return success(`${sqliteConfig.prefix.role}-${nextId}`);
            } catch (err: any) {
                appLogger.error({
                    type: "sqlite-role-insert",
                    err,
                });
                return failure();
            }
        },
    };
}
