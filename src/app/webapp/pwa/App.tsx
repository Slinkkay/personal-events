import React, { useState } from "react";
import { Header } from "./components/Header";
import { HierarchyView } from "./HierarchyView";
import { RequestsView } from "./RequestsView";
import { RoleModal } from "./components/RoleModal";
import { ResponsibilityModal } from "./components/ResponsibilityModal";
import { RequestModal } from "./components/RequestModal";
import { AppInitializer } from "@/app/webapp/pwa/AppInit";
import { useDialogStore } from "./dialog";

export default function App() {
    const [activeTab, setActiveTab] = useState<"hierarchy" | "requests">("hierarchy");

    // Modal Visibility States
    const { data, closeResponsibility, closeRequest } = useDialogStore();

    return (
        <div className="h-full min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
            <AppInitializer></AppInitializer>
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {activeTab === "hierarchy" ? <HierarchyView /> : <RequestsView />}
            </main>

            {/* Global Modals */}
            <RoleModal />
            <ResponsibilityModal
                isOpen={data.responsibility !== null}
                defaultRoleId={data.responsibility?.roleId}
                onClose={() => closeResponsibility()}
            />
            <RequestModal isOpen={data.request !== null} onClose={() => closeRequest()} />
        </div>
    );
}
