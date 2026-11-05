import { Result } from "@/result";

export type UpdateRoleStatus = {
    update(command: { id: string; status: string }): Promise<Result>;
};
