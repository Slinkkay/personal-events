import { Result } from "@/result";

export type UpdateRequestDescriptionCommand = {
    id: string;
    description: string;
};

export type UpdateRequestDescription = {
    update(command: UpdateRequestDescriptionCommand): Promise<Result>;
};
