import { ValueResult } from "@/result";
import { Responsibility } from "@/domain/responsibility";

export type GetResponsibility = {
    get(command: { id: string }): Promise<ValueResult<Responsibility>>;
};
