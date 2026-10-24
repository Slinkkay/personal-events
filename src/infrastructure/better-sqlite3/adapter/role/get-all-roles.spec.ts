import { expect, describe, it, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { makeGetAllRoles } from "./get-all-roles";
import { SqliteConfig } from "@/infrastructure/better-sqlite3";
import { AppLogger } from "@/log";
import { isFailure, isSuccess } from "@/result";

describe("Infrastructure, BetterSqlite3, GetAllRoles Adapter", () => {
    let db: Database.Database;
    let config: SqliteConfig;
    let logger: AppLogger;

    beforeEach(() => {
        db = new Database(":memory:");
        config = {
            fileName: ":memory:",
            type: "sqlite",
            tables: {
                role: "role",
                responsibility: "responsibility",
                request: "request",
                roleToResponsibility: "roleToResponsibility",
                responsibilityToRequest: "responsibilityToRequest",
            },
            prefix: {
                role: "ROLE",
                responsibility: "RES",
                request: "REQ",
            },
        };
        logger = {
            info: () => {},
            error: () => {},
        };

        db.exec(`
            CREATE TABLE role (
                idx INTEGER PRIMARY KEY AUTOINCREMENT,
                id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'OPEN'
            )
        `);
    });

    it("returns an empty array when no roles exist", async () => {
        const adapter = makeGetAllRoles(db, config, logger);
        const result = await adapter.getAll();

        expect(isSuccess(result)).toBeTruthy();
        if (isSuccess(result)) {
            expect(result.value).toEqual([]);
        }
    });

    it("returns all roles successfully when roles exist", async () => {
        db.exec(`
            INSERT INTO role (id, name, description, status) VALUES
            ('ROLE-1', 'Admin', 'Administrator role', 'ACTIVE'),
            ('ROLE-2', 'User', 'Standard user role', 'OPEN')
        `);

        const adapter = makeGetAllRoles(db, config, logger);
        const result = await adapter.getAll();

        expect(isSuccess(result)).toBeTruthy();
        if (isSuccess(result)) {
            expect(result.value).toEqual([
                {
                    id: "ROLE-1",
                    name: "Admin",
                    description: "Administrator role",
                    status: "ACTIVE",
                },
                {
                    id: "ROLE-2",
                    name: "User",
                    description: "Standard user role",
                    status: "OPEN",
                },
            ]);
        }
    });

    it("returns failure when database query fails", async () => {
        db.exec("DROP TABLE role");

        const adapter = makeGetAllRoles(db, config, logger);
        const result = await adapter.getAll();

        expect(isFailure(result)).toBeTruthy();
    });
});
