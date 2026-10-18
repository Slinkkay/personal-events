import { GenerateUUID, makeGenerateUUID } from "@/infrastructure/uuid";
import { memoize } from "@/composition-root";

export type UUIDRoot = {
    getGenerateUUID(): GenerateUUID;
};

export function makeUUIDRoot(): UUIDRoot {
    return {
        getGenerateUUID: memoize(() => makeGenerateUUID()),
    };
}
