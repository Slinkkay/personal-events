import { Result, success } from "@/result";
import { CompositionRoot } from "@/composition-root";
import { createSchema, createYoga } from "graphql-yoga";
import { createServer } from "node:http";

export type StartWebGraphQL = {
    start(): Promise<Result>;
};

export function makeStartWebGraphQL(root: CompositionRoot): StartWebGraphQL {
    return {
        start: () => {
            return new Promise<Result>((resolve, reject) => {
                const schema = createSchema({
                    typeDefs: `
                type Query {
                    hello: String
                }
            `,
                    resolvers: {
                        Query: {
                            hello: () => {
                                console.log("Hello World");
                                return "World";
                            },
                        },
                    },
                });

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
