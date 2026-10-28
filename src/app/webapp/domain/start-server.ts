import { createSchema, createYoga } from "graphql-yoga";
import express from "express";
import { RequestGraphQL } from "./request";
import { ResponsibilityGraphQL } from "./responsibility";
import { RoleGraphQL } from "./role";
import { join } from "node:path";

export type StartServer = {
    start(): Promise<void>;
};

export function makeStartServer(
    request: RequestGraphQL,
    responsibility: ResponsibilityGraphQL,
    role: RoleGraphQL,
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
                    requestUpdateDueDate(requestId: String, dueDate: String): Boolean!
                    requestUpdateStatus(requestId: String, status: String): Boolean!
                    requestAssociateToResponsibility(responsibilityId: String, requestId: String): Boolean!
                    responsibilityCreate(name: String, description: String): IdResult! 
                    responsibilityUpdateName(responsibilityId: String, name: String): Boolean!
                    responsibilityUpdateDescription(responsibilityId: String, description: String): Boolean!
                    responsibilityAssociateToRole(roleId: String, responsibilityId: String): Boolean!
                    roleCreate(name: String, description: String): IdResult!
                }
            `;

            const resolvers = {
                Query: {
                    ...request.Query,
                    ...responsibility.Query,
                    ...role.Query,
                },
                Role: {
                    ...responsibility.Role,
                },
                Responsibility: {
                    ...request.Responsibility,
                },
                Mutation: {
                    ...request.Mutation,
                    ...responsibility.Mutation,
                    ...role.Mutation,
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

            const app = express();

            app.use(express.static(join(".", "hosted")));

            app.use(yoga.graphqlEndpoint, yoga);

            return new Promise((resolve, reject) => {
                const server = app.listen(3000, () => {
                    console.log("Server started on port 3000.");
                });

                server.on("error", (err: any) => {
                    reject(err);
                });
                server.on("close", () => {
                    resolve();
                });
            });
        },
    };
}
