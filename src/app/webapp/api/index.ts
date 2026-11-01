import { initWebServerCompositionRoot, makeWebServerCompositionRoot } from "./composition-root";
import { isSuccess } from "@/result";

const root = makeWebServerCompositionRoot();

initWebServerCompositionRoot(root).then(async (result) => {
    const appLogger = root.root.context.getAppLogger();
    if (!isSuccess(result)) {
        throw new Error("Failed to init Web Server Composition Root");
    }

    const webServerStart = root.getStartServer();

    try {
        await webServerStart.start();
        appLogger.info({
            type: "web-app:closed-successfully",
        });
    } catch (err: any) {
        appLogger.error({
            type: "web-app:error",
            err,
        });
    }
});
