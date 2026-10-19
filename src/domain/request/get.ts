import { ValueResult } from "@/result";
import { Request } from "@/domain/request";

export type GetRequest = {
    get(command: { id: string }): Promise<ValueResult<Request>>;
};
