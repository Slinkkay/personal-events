import * as crypto from "node:crypto";
import { success, ValueResult } from "@/result";

export type GenerateUUID = {
    generate(): ValueResult<string>;
};

export function makeGenerateUUID(): GenerateUUID {
    return {
        generate: () => {
            return success(crypto.randomUUID());
        },
    };
}
