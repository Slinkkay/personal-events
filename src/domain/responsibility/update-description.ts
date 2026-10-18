import { Result } from "@/result";

export type UpdateResponsibilityDescription = {
    update(command: { id: string; description: string }): Promise<Result>;
};
