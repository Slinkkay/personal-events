import { Database } from "better-sqlite3";
import Sqlite from "better-sqlite3";

export type SqliteConfig = {
    type: "sqlite";
    fileName: string;
    tables: {
        role: string;
        responsibility: string;
    };
};

export function isSqliteConfig(config: any): config is SqliteConfig {
    if (!config) {
        return true;
    }

    return config.type === "sqlite";
}

export function makeDBClient(sqliteConfig: SqliteConfig): Database {
    return new Sqlite(sqliteConfig.fileName);
}
