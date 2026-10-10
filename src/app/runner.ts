import { makeCompositionRoot } from "@/composition-root";

const compositionRoot = makeCompositionRoot();

const systemInit = compositionRoot.domain.init.getSystemInit();

const appLogger = compositionRoot.context.getAppLogger();

systemInit
    .init()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        appLogger.error({
            type: "failed-init",
            err,
        });
        process.exit(1);
    });
