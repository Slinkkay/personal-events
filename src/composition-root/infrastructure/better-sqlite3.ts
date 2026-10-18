import { Database } from "better-sqlite3";
import { memoize, RootInit } from "@/composition-root";
import { failure, success } from "@/result";
import { isSqliteConfig, makeDBClient, SqliteConfig } from "@/infrastructure/better-sqlite3";
import { PersistenceInit } from "@/domain/init";
import {
    makeCreateRolePersistence,
    makePersistenceInit,
    makeCreateResponsibilityPersistence,
    makeCreateRequestPersistence,
    makeAssociateToRolePersistence,
    makeAssociateToResponsibilityPersistence,
    makeUpdateRequestDescription,
    makeUpdateRequestDueDate,
    makeUpdateRequestStatus,
    makeUpdateResponsibilityName,
    makeUpdateResponsibilityDescription,
} from "@/infrastructure/better-sqlite3/adapter";
import { ContextRoot } from "@/composition-root/context";
import { CreateRolePersistence } from "@/domain/role";
import { CreateResponsibilityPersistence } from "@/domain/responsibility/create";
import {
    AssociateToResponsibilityPersistence,
    CreateRequestPersistence,
    UpdateRequestDescription,
    UpdateRequestDueDate,
    UpdateRequestStatus,
} from "@/domain/request";
import {
    AssociateToRolePersistence,
    UpdateResponsibilityDescription,
    UpdateResponsibilityName,
} from "@/domain/responsibility";

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
    getCreateResponsibilityPersistence(): CreateResponsibilityPersistence;
    getCreateRequestPersistence(): CreateRequestPersistence;
    getAssociateToRolePersistence(): AssociateToRolePersistence;
    getAssociateToResponsibilityPersistence(): AssociateToResponsibilityPersistence;
    getUpdateRequestDescription(): UpdateRequestDescription;
    getUpdateRequestDueDate(): UpdateRequestDueDate;
    getUpdateRequestStatus(): UpdateRequestStatus;
    getUpdateResponsibilityName(): UpdateResponsibilityName;
    getUpdateResponsibilityDescription(): UpdateResponsibilityDescription;
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
        getCreateResponsibilityPersistence: memoize(() =>
            makeCreateResponsibilityPersistence(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        getCreateRequestPersistence: memoize(() =>
            makeCreateRequestPersistence(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        getAssociateToRolePersistence: memoize(() =>
            makeAssociateToRolePersistence(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        getAssociateToResponsibilityPersistence: memoize(() =>
            makeAssociateToResponsibilityPersistence(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        getUpdateRequestDescription: memoize(() =>
            makeUpdateRequestDescription(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        getUpdateRequestDueDate: memoize(() =>
            makeUpdateRequestDueDate(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        getUpdateRequestStatus: memoize(() =>
            makeUpdateRequestStatus(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        getUpdateResponsibilityName: memoize(() =>
            makeUpdateResponsibilityName(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        getUpdateResponsibilityDescription: memoize(() =>
            makeUpdateResponsibilityDescription(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        init,
    };
}
