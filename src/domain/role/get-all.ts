import { ValueResult } from "@/result";
import { Role } from "@/domain/role";

export type GetAllRoles = {
    getAll(): Promise<ValueResult<Role[]>>;
};
