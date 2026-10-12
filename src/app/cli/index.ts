import { Command } from "commander";
import { CliCompositionRoot, initCLiRoot, makeCliCompositionRoot } from "@/app/cli/composition-root";
import { registerSystem } from "./system-init";

const rootCommand = new Command("personal-events");

const cliCompositionRoot: CliCompositionRoot = makeCliCompositionRoot();

initCLiRoot(cliCompositionRoot)
    .then(() => {
        rootCommand.hook("preAction", (_, actionCommand) => {
            actionCommand.setOptionValue("root", cliCompositionRoot);
        });

        registerSystem(rootCommand);

        rootCommand.parse();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
