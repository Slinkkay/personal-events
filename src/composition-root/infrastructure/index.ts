import { RootInit } from "@/composition-root";
import { success } from "@/result";
import {
    BetterSqlite3AdapterRoot,
    BetterSqlite3Root,
    makeBetterSqlite3AdapterRoot,
    makeBetterSqlite3Root,
} from "@/composition-root/infrastructure/better-sqlite3";
import { ContextRoot } from "@/composition-root/context";

export type InfrastructureRoot = {
    betterSqlite3: BetterSqlite3Root;
    betterSqlite3Adapter: BetterSqlite3AdapterRoot;
} & RootInit;

export function makeInfrastructureRoot(context: ContextRoot): InfrastructureRoot {
    const betterSqlite3 = makeBetterSqlite3Root();

    const betterSqlite3Adapter = makeBetterSqlite3AdapterRoot(context, betterSqlite3);

    const initList: RootInit[] = [betterSqlite3, betterSqlite3Adapter];

    const init = async (config: any) => {
        for await (const item of initList) {
            await item.init(config);
        }

        return success();
    };

    return {
        init,
        betterSqlite3,
        betterSqlite3Adapter,
    };
}
