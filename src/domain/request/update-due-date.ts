import { Result } from "@/result";

export type UpdateRequestDueDate = {
    update(command: { id: string; dueDate: string }): Promise<Result>;
};
