import { Result } from "@/result";

export type UpdateRequestStatus = {
    update(command: { id: string; status: string }): Promise<Result>;
};
