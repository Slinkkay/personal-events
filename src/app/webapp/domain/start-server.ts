import { isSuccess } from "@/result";
import { CreateRole, GetAllRoles, GetRole } from "@/domain/role";
import { createSchema, createYoga } from "graphql-yoga";
import { createServer } from "node:http";
import {
    AssociateToRole,
    CreateResponsibility,
    GetResponsibility,
    GetResponsibilityFromRole,
} from "@/domain/responsibility";
import { RequestGraphQL } from "./request";

export type StartServer = {
    start(): Promise<void>;
};

export function makeStartServer(
    request: RequestGraphQL,
    createResponsibility: CreateResponsibility,
    getResponsibility: GetResponsibility,
    getResponsibilityFromRole: GetResponsibilityFromRole,
    createRole: CreateRole,
    getRole: GetRole,
    getAllRoles: GetAllRoles,
    associateToRole: AssociateToRole,
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
                    requestCreate(dueDate: String, description: String): IdResult!
                    requestUpdateDescription(requestId: String, description: String): Boolean!
                    requestAssociateToResponsibility(responsibilityId: String, requestId: String): Boolean!
                    responsibilityCreate(name: String, description: String): IdResult! 
                    responsibilityAssociateToRole(roleId: String, responsibilityId: String): Boolean!
                    roleCreate(name: String, description: String): IdResult!
                }
            `;

            const resolvers = {
                Query: {
                    ...request.Query,
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
                Responsibility: {
                    ...request.Responsibility,
                },
                Mutation: {
                    ...request.Mutation,
                    roleCreate: async (_: unknown, { description, name }: { description: string; name: string }) => {
                        const result = await createRole.create({
                            description,
                            name,
                        });

                        if (!isSuccess(result)) {
                            throw new Error("Failed to create role");
                        }
                        return { id: result.value };
                    },
                    responsibilityCreate: async (
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
                    responsibilityAssociateToRole: async (
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
                },
            };

            let schema = createSchema({
                typeDefs,
                resolvers,
            });
            const yoga = createYoga({
                cors: {
                    origin: "*",
                    methods: ["POST", "OPTIONS"],
                    allowedHeaders: ["Content-Type", "Authorization"],
                    credentials: true,
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
