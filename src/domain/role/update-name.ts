import { Result } from "@/result";

export type UpdateRoleName = {
    update(command: { id: string; name: string }): Promise<Result>;
};
