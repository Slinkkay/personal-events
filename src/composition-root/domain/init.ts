import { makeSystemInit, SystemInit } from "@/domain/init";
import { memoize } from "@/composition-root";
import { ContextRoot } from "@/composition-root/context";

export type InitRoot = {
    getSystemInit(): SystemInit;
};

export function makeInitRoot(context: ContextRoot): InitRoot {
    return {
        getSystemInit: memoize(() => makeSystemInit(context.getAppLogger())),
    };
}
