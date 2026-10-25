import { isSuccess } from "@/result";
import {
    AssociateToResponsibility,
    CreateRequest,
    GetAllRequests,
    GetFromResponsibility,
    GetRequest,
} from "@/domain/request";
import { CreateRole, GetAllRoles, GetRole } from "@/domain/role";
import { createSchema, createYoga } from "graphql-yoga";
import { createServer } from "node:http";
import {
    AssociateToRole,
    CreateResponsibility,
    GetResponsibility,
    GetResponsibilityFromRole,
} from "@/domain/responsibility";

export type StartServer = {
    start(): Promise<void>;
};

export function makeStartServer(
    createRequest: CreateRequest,
    getRequest: GetRequest,
    getAllRequests: GetAllRequests,
    getFromResponsibility: GetFromResponsibility,
    createResponsibility: CreateResponsibility,
    getResponsibility: GetResponsibility,
    getResponsibilityFromRole: GetResponsibilityFromRole,
    createRole: CreateRole,
    getRole: GetRole,
    getAllRoles: GetAllRoles,
    associateToRole: AssociateToRole,
    associateToResponsibility: AssociateToResponsibility,
): StartServer {
    return {
        start: () => {
            const typeDefs = `
                type Query {
                    request(id: String): Request
                    responsibility(id: String): Responsibility
                    role(id: String): Role
                    roles: [Role]
                    requests: [Request]
                }
                
                type Request {
                    id: String
                    description: String
                    dueDate: String
                    status: String
                }

                type Role {
                    id: String
                    name: String
                    description: String
                    status: String
                    responsibilities: [Responsibility]
                }
                
                type Responsibility {
                    id: String
                    name: String
                    description: String
                    status: String
                    requests: [Request]
                }
                
                type IdResult {
                    id: ID!
                }
                
                type Mutation {
                    createRequest(dueDate: String, description: String): IdResult!
                    createResponsibility(name: String, description: String): IdResult! 
                    createRole(name: String, description: String): IdResult!
                    associateRoleToResponsibility(roleId: String, responsibilityId: String): Boolean!
                    associateResponsibilityToRequest(responsibilityId: String, requestId: String): Boolean!
                }
            `;

            const resolvers = {
                Query: {
                    request: async (_: unknown, { id }: { id: string }) => {
                        const result = await getRequest.get({ id });
                        if (!isSuccess(result)) {
                            throw new Error("Failed to get request");
                        }
                        return result.value;
                    },
                    responsibility: async (_: unknown, { id }: { id: string }) => {
                        const result = await getResponsibility.get({ id });
                        if (!isSuccess(result)) {
                            throw new Error("Failed to get responsibility");
                        }

                        return result.value;
                    },
                    role: async (_: unknown, command: any) => {
                        const result = await getRole.get(command);
                        if (!isSuccess(result)) {
                            throw new Error("Failed to get role");
                        }
                        return result.value;
                    },
                    roles: async () => {
                        const result = await getAllRoles.getAll();
                        if (!isSuccess(result)) {
                            throw new Error("Failed to get all roles");
                        }
                        return result.value;
                    },
                    requests: async () => {
                        const result = await getAllRequests.getAll();
                        if (!isSuccess(result)) {
                            throw new Error("Failed to get all requests");
                        }
                        return result.value;
                    },
                },
                Role: {
                    responsibilities: async (parent: { id: string }) => {
                        const result = await getResponsibilityFromRole.get({
                            roleId: parent.id,
                        });

                        if (!isSuccess(result)) {
                            throw new Error("Failed to get responsibility from role");
                        }
                        return result.value;
                    },
                },
                Responsibility: {
                    requests: async (parent: { id: string }) => {
                        const result = await getFromResponsibility.get({
                            responsibilityId: parent.id,
                        });

                        if (!isSuccess(result)) {
                            throw new Error("Failed to get request from responsibility");
                        }
                        return result.value;
                    },
                },
                Mutation: {
                    createRequest: async (_: unknown, command: any) => {
                        const result = await createRequest.create(command);

                        if (!isSuccess(result)) {
                            throw new Error("Failed to create request");
                        }

                        return { id: result.value };
                    },
                    createRole: async (_: unknown, { description, name }: { description: string; name: string }) => {
                        const result = await createRole.create({
                            description,
                            name,
                        });

                        if (!isSuccess(result)) {
                            throw new Error("Failed to create role");
                        }
                        return { id: result.value };
                    },
                    createResponsibility: async (
                        _: unknown,
                        { description, name }: { description: string; name: string },
                    ) => {
                        const result = await createResponsibility.create({
                            name,
                            description,
                        });

                        if (!isSuccess(result)) {
                            throw new Error("Failed to create responsibility");
                        }

                        return { id: result.value };
                    },
                    associateRoleToResponsibility: async (
                        _: unknown,
                        { responsibilityId, roleId }: { roleId: string; responsibilityId: string },
                    ) => {
                        const result = await associateToRole.associate({
                            responsibilityId,
                            roleId,
                        });

                        if (!isSuccess(result)) {
                            throw new Error("Failed to associate to role");
                        }
                        return true;
                    },
                    associateResponsibilityToRequest: async (_: unknown, command: any) => {
                        const result = await associateToResponsibility.associate({
                            responsibilityId: command.responsibilityId,
                            requestId: command.requestId,
                        });

                        if (!isSuccess(result)) {
                            throw new Error("Failed to associate to responsibility");
                        }

                        return true;
                    },
                },
            };

            let schema = createSchema({
                typeDefs,
                resolvers,
            });
            const yoga = createYoga({
                cors: {
                    origin: "*",
                },
                schema,
            });

            const server = createServer(yoga);

            return new Promise((resolve, reject) => {
                server.listen(3000, () => {
                    console.log("Server started on port 3000.");
                });

                server.on("error", (err) => {
                    reject(err);
                });
                server.on("close", () => {
                    resolve();
                });
            });
        },
    };
}
