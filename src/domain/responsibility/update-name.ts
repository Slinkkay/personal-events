import { Result } from "@/result";

export type UpdateResponsibilityName = {
    update(command: { id: string; name: string }): Promise<Result>;
};
