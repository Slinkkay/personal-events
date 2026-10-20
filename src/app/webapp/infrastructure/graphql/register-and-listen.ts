import { RegisterAndListen } from "@/app/webapp/domain/start-server";
import { createSchema, createYoga, YogaSchemaDefinition } from "graphql-yoga";
import { createServer } from "node:http";
import { isSuccess, Result, success } from "@/result";

export function makeRegisterAndListen(): RegisterAndListen {
    let schema: YogaSchemaDefinition<any, any>;

    return {
        register: (typeDefs, resolver) => {
            schema = createSchema({
                typeDefs,
                resolvers: {
                    Query: {
                        request: async (_: unknown, command) => {
                            const result = await resolver.request.getRequest.get(command);

                            if (!isSuccess(result)) {
                                throw new Error("Failed to get request");
                            }

                            return result.value;
                        },
                    },
                    Mutation: {
                        createRequest: async (
                            _: unknown,
                            { dueDate, description }: { dueDate: string; description: string },
                        ) => {
                            const result = await resolver.request.createRequest.create({ description, dueDate });

                            if (!isSuccess(result)) {
                                throw new Error("Failed to create request");
                            }

                            return {
                                id: result.value,
                            };
                        },
                    },
                },
            });
        },
        listen: () => {
            return new Promise<Result>((resolve, reject) => {
                const yoga = createYoga({
                    schema,
                });

                const server = createServer(yoga);

                server.listen(3000, () => {
                    console.log("Server started on port 3000.");
                });

                server.on("error", (err) => {
                    reject(err);
                });
                server.on("close", () => {
                    resolve(success());
                });
            });
        },
    };
}
