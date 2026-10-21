import { ValueResult } from "@/result";
import { Role } from "@/domain/role";

export type GetRole = {
    get(command: { id: string }): Promise<ValueResult<Role>>;
};
