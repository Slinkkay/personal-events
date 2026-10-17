import { Database } from "better-sqlite3";
import { memoize, RootInit } from "@/composition-root";
import { failure, success } from "@/result";
import { isSqliteConfig, makeDBClient, SqliteConfig } from "@/infrastructure/better-sqlite3";
import { PersistenceInit } from "@/domain/init";
import { makeCreateRolePersistence, makePersistenceInit } from "@/infrastructure/better-sqlite3/adapter";
import { ContextRoot } from "@/composition-root/context";
import { CreateRolePersistence } from "@/domain/role";

export type BetterSqlite3Root = {
    getClient(): Database;
} & RootInit;

export function makeBetterSqlite3Root(): BetterSqlite3Root {
    let currentClient: Database;

    const getClient = memoize(() => currentClient);

    const init = async (config: any) => {
        if (!isSqliteConfig(config)) {
            return failure();
        }

        currentClient = makeDBClient(config);
        return success();
    };

    return {
        getClient,
        init,
    };
}

export type BetterSqlite3AdapterRoot = {
    getPersistenceInit(): PersistenceInit;
    getCreateRolePersistence(): CreateRolePersistence;
} & RootInit;

export function makeBetterSqlite3AdapterRoot(
    contextRoot: ContextRoot,
    root: BetterSqlite3Root,
): BetterSqlite3AdapterRoot {
    let sqliteConfig: SqliteConfig;

    const init = async (config: any) => {
        if (!isSqliteConfig(config)) {
            return success();
        }
        sqliteConfig = config;
        return success();
    };

    return {
        getPersistenceInit: memoize(() =>
            makePersistenceInit(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        getCreateRolePersistence: memoize(() =>
            makeCreateRolePersistence(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        init,
    };
}
