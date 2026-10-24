import { isSuccess } from "@/result";
import { CreateRequest, GetRequest } from "@/domain/request";
import { CreateRole, GetAllRoles, GetRole } from "@/domain/role";
import { createSchema, createYoga } from "graphql-yoga";
import { createServer } from "node:http";
import { CreateResponsibility, GetResponsibility, GetResponsibilityFromRole } from "@/domain/responsibility";

export type StartServer = {
    start(): Promise<void>;
};

export function makeStartServer(
    createRequest: CreateRequest,
    getRequest: GetRequest,
    createResponsibility: CreateResponsibility,
    getResponsibility: GetResponsibility,
    getResponsibilityFromRole: GetResponsibilityFromRole,
    createRole: CreateRole,
    getRole: GetRole,
    getAllRoles: GetAllRoles,
): StartServer {
    return {
        start: () => {
            const typeDefs = `
                type Query {
                    request(id: String): Request
                    responsibility(id: String): Responsibility
                    role(id: String): Role
                    roles: [Role]
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
                }
                
                type IdResult {
                    id: ID!
                }
                
                type Mutation {
                    createRequest(dueDate: String, description: String): IdResult!
                    createResponsibility(name: String, description: String): IdResult! 
                    createRole(name: String, description: String): IdResult!
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
