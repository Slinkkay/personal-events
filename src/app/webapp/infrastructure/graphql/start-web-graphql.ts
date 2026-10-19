import { isSuccess, Result, success } from "@/result";
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
                    request(id: String): Request
                }
                
                type Request {
                    id: String
                    description: String
                    dueDate: String
                    status: String
                }
            `,
                    resolvers: {
                        Query: {
                            request: async (_: unknown, { id }: { id: string }) => {
                                const getRequest = root.domain.request.getGetRequest();

                                const getResult = await getRequest.get({ id });

                                if (!isSuccess(getResult)) {
                                    throw new Error("Request failed with id " + id);
                                }

                                return getResult.value;
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
