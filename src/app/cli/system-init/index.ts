import { isSuccess, Result } from "@/result";
import { SystemInit } from "@/domain/init";
import { Command } from "commander";
import { CliCompositionRoot } from "@/app/cli/composition-root";

export type CliSystemInit = {
    execute: () => Promise<Result>;
};

export function makeCliSystemInit(systemInit: SystemInit): CliSystemInit {
    return {
        execute: async () => {
            return await systemInit.init();
        },
    };
}

export function registerSystem(program: Command) {
    const systemRoot = program.command("system");
    systemRoot.command("init").action(async (command) => {
        const root: CliCompositionRoot = command.root;
        const systemInit = root.getSystemInit();
        const initResult = await systemInit.execute();

        if (!isSuccess(initResult)) {
            process.exit(1);
        }
        process.exit(0);
    });
}
