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
    makeUpdateRoleDescription,
    makeUpdateRoleName,
} from "@/infrastructure/better-sqlite3/adapter";
import { ContextRoot } from "@/composition-root/context";
import { CreateRolePersistence, UpdateRoleDescription, UpdateRoleName } from "@/domain/role";
import { CreateResponsibilityPersistence } from "@/domain/responsibility/create";
import {
    AssociateToResponsibilityPersistence,
    CreateRequestPersistence,
    GetRequest,
    UpdateRequestDescription,
    UpdateRequestDueDate,
    UpdateRequestStatus,
} from "@/domain/request";
import {
    AssociateToRolePersistence,
    UpdateResponsibilityDescription,
    UpdateResponsibilityName,
    UpdateResponsibilityStatus,
} from "@/domain/responsibility";
import { makeUpdateResponsibilityStatus } from "@/infrastructure/better-sqlite3/adapter/update-responsibility-status";
import { makeGetRequest } from "@/infrastructure/better-sqlite3/adapter/request";

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

export type BetterSqlite3Responsibility = {
    getCreateResponsibilityPersistence(): CreateResponsibilityPersistence;
    getUpdateResponsibilityName(): UpdateResponsibilityName;
    getUpdateResponsibilityDescription(): UpdateResponsibilityDescription;
    getUpdateResponsibilityStatus(): UpdateResponsibilityStatus;
    getAssociateToRolePersistence(): AssociateToRolePersistence;
} & RootInit;

export type BetterSqlite3Request = {
    getRequest(): GetRequest;
    getCreateRequestPersistence(): CreateRequestPersistence;
    getUpdateRequestDescription(): UpdateRequestDescription;
    getUpdateRequestDueDate(): UpdateRequestDueDate;
    getUpdateRequestStatus(): UpdateRequestStatus;
    getAssociateToResponsibilityPersistence(): AssociateToResponsibilityPersistence;
} & RootInit;

export type BetterSqlite3Role = {
    getCreateRolePersistence(): CreateRolePersistence;
    getUpdateRoleDescription(): UpdateRoleDescription;
    getUpdateRoleName(): UpdateRoleName;
};

export type BetterSqlite3AdapterRoot = {
    getPersistenceInit(): PersistenceInit;
    responsibility: BetterSqlite3Responsibility;
    request: BetterSqlite3Request;
    role: BetterSqlite3Role;
} & RootInit;

export function makeBetterSqlite3AdapterRoot(
    contextRoot: ContextRoot,
    root: BetterSqlite3Root,
): BetterSqlite3AdapterRoot {
    let sqliteConfig: SqliteConfig;

    const responsibility = makeBetterSqliteResponsibility(contextRoot, root);

    const request = makeBetterSqliteRequest(contextRoot, root);

    const role = makeBetterSqliteRole(contextRoot, root);

    const init = async (config: any) => {
        if (!isSqliteConfig(config)) {
            return success();
        }
        sqliteConfig = config;
        await responsibility.init(config);
        await request.init(config);
        await role.init(config);
        return success();
    };

    return {
        getPersistenceInit: memoize(() =>
            makePersistenceInit(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        role,
        responsibility,
        request,
        init,
    };
}

export function makeBetterSqliteRequest(contextRoot: ContextRoot, root: BetterSqlite3Root): BetterSqlite3Request {
    let sqliteConfig: SqliteConfig;

    const init = async (config: any) => {
        if (!isSqliteConfig(config)) {
            return success();
        }
        sqliteConfig = config;
        return success();
    };

    return {
        getRequest: memoize(() => makeGetRequest(root.getClient(), sqliteConfig, contextRoot.getAppLogger())),
        getCreateRequestPersistence: memoize(() =>
            makeCreateRequestPersistence(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
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
        getAssociateToResponsibilityPersistence: memoize(() =>
            makeAssociateToResponsibilityPersistence(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        init,
    };
}

export function makeBetterSqliteResponsibility(
    contextRoot: ContextRoot,
    root: BetterSqlite3Root,
): BetterSqlite3Responsibility {
    let sqliteConfig: SqliteConfig;

    const init = async (config: any) => {
        if (!isSqliteConfig(config)) {
            return success();
        }
        sqliteConfig = config;
        return success();
    };

    return {
        getCreateResponsibilityPersistence: memoize(() =>
            makeCreateResponsibilityPersistence(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        getUpdateResponsibilityName: memoize(() =>
            makeUpdateResponsibilityName(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        getUpdateResponsibilityDescription: memoize(() =>
            makeUpdateResponsibilityDescription(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        getUpdateResponsibilityStatus: memoize(() =>
            makeUpdateResponsibilityStatus(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        getAssociateToRolePersistence: memoize(() =>
            makeAssociateToRolePersistence(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        init,
    };
}

export function makeBetterSqliteRole(contextRoot: ContextRoot, root: BetterSqlite3Root) {
    let sqliteConfig: SqliteConfig;

    const init = async (config: any) => {
        if (!isSqliteConfig(config)) {
            return success();
        }
        sqliteConfig = config;
        return success();
    };

    return {
        getCreateRolePersistence: memoize(() =>
            makeCreateRolePersistence(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        getUpdateRoleDescription: memoize(() =>
            makeUpdateRoleDescription(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        getUpdateRoleName: memoize(() =>
            makeUpdateRoleName(root.getClient(), sqliteConfig, contextRoot.getAppLogger()),
        ),
        init,
    };
}
