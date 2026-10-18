import { Result } from "@/result";

export type UpdateResponsibilityStatus = {
    update(command: { id: string; status: string }): Promise<Result>;
};
