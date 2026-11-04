import React, { useEffect } from "react";
import { useOmniStore } from "./useOmniStore";

export function AppInitializer() {
    const syncFromRemote = useOmniStore((state) => state.fetchCurrent);

    useEffect(() => {
        // Trigger initial fetch on mount
        syncFromRemote().catch((err) => {
            console.error("Failed initial sync:", err);
        });
    }, [syncFromRemote]);

    return null; // Or render a global loading/error banner if desired
}
