import { Result, ValueResult } from "@/result";
import { CreateRequest, GetRequest, Request } from "@/domain/request";

export type StartServer = {
    start(): Promise<void>;
};

export type RegisterAndListen = {
    register(
        typeDefs: string,
        resolver: {
            request: {
                getRequest: {
                    get: (command: { id: string }) => Promise<ValueResult<Request>>;
                };
                createRequest: {
                    create: (command: { dueDate: string; description: string }) => Promise<ValueResult<string>>;
                };
            };
        },
    ): void;
    listen(): Promise<Result>;
};

export function makeStartServer(
    register: RegisterAndListen,
    createRequest: CreateRequest,
    getRequest: GetRequest,
): StartServer {
    return {
        start: async () => {
            register.register(
                `
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
            `,
                {
                    request: {
                        createRequest,
                        getRequest,
                    },
                },
            );

            await register.listen();
        },
    };
}
