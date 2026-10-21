import { isSuccess } from "@/result";
import { CreateRequest, GetRequest } from "@/domain/request";
import { createSchema, createYoga } from "graphql-yoga";
import { createServer } from "node:http";

export type StartServer = {
    start(): Promise<void>;
};

export function makeStartServer(createRequest: CreateRequest, getRequest: GetRequest): StartServer {
    return {
        start: () => {
            const typeDefs = `
                type Query {
                    request(id: String): Request
                }
                
                type Request {
                    id: String
                    description: String
                    dueDate: String
                    status: String
                }
                
                type IdResult {
                    id: ID!
                }
                
                type Mutation {
                    createRequest(dueDate: String, description: String): IdResult!
                }
            `;

            const resolvers = {
                Query: {
                    request: async (_: unknown, command: any) => {
                        const result = await getRequest.get(command);
                        if (!isSuccess(result)) {
                            throw new Error("Failed to get request");
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
                },
            };

            let schema = createSchema({
                typeDefs,
                resolvers,
            });
            const yoga = createYoga({
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
