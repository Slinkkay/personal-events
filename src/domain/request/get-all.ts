import { ValueResult } from "@/result";
import { Request } from "@/domain/request";

export type GetAllRequests = {
    getAll(): Promise<ValueResult<Request[]>>;
};
