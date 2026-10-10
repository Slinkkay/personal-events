import { Command } from "commander";
import { CliCompositionRoot, makeCliCompositionRoot } from "@/app/cli/composition-root";
import { registerSystem } from "./system-init";

const rootCommand = new Command("personal-events");

const cliCompositionRoot: CliCompositionRoot = makeCliCompositionRoot();

rootCommand.hook("preAction", (_, actionCommand) => {
    actionCommand.setOptionValue("root", cliCompositionRoot);
});

registerSystem(rootCommand);

rootCommand.parse();
