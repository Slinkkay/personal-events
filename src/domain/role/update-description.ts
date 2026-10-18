import { Result } from "@/result";

export type UpdateRoleDescription = {
    update(command: { id: string; description: string }): Promise<Result>;
};
