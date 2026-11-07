import React, { useState } from "react";
import { Header } from "./components/Header";
import { HierarchyView } from "./HierarchyView";
import { RequestsView } from "./RequestsView";
import { RoleModal } from "./components/RoleModal";
import { ResponsibilityModal } from "./components/ResponsibilityModal";
import { RequestModal } from "./components/RequestModal";
import { AppInitializer } from "@/app/webapp/pwa/AppInit";
import { useDialogStore } from "@/app/webapp/pwa/dialog";

export default function App() {
    const [activeTab, setActiveTab] = useState<"hierarchy" | "requests">("hierarchy");

    // Modal Visibility States
    const { data, closeRole } = useDialogStore();
    const [isRespModalOpen, setIsRespModalOpen] = useState(false);
    const [isReqModalOpen, setIsReqModalOpen] = useState(false);

    // Pre-selection target IDs
    const [defaultRoleId, setDefaultRoleId] = useState<string | null>(null);
    const [defaultRespId, setDefaultRespId] = useState<string | null>(null);

    const handleOpenAddResp = (roleId?: string) => {
        setDefaultRoleId(roleId || null);
        setIsRespModalOpen(true);
    };

    const handleOpenAddReq = (respId?: string) => {
        setDefaultRespId(respId || null);
        setIsReqModalOpen(true);
    };

    return (
        <div className="h-full min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
            <AppInitializer></AppInitializer>
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {activeTab === "hierarchy" ? (
                    <HierarchyView onOpenAddRespModal={handleOpenAddResp} onOpenAddReqModal={handleOpenAddReq} />
                ) : (
                    <RequestsView />
                )}
            </main>

            {/* Global Modals */}
            <RoleModal isOpen={data.role} onClose={() => closeRole()} />
            <ResponsibilityModal
                isOpen={isRespModalOpen}
                defaultRoleId={defaultRoleId}
                onClose={() => setIsRespModalOpen(false)}
            />
            <RequestModal
                isOpen={isReqModalOpen}
                defaultResponsibilityId={defaultRespId}
                onClose={() => setIsReqModalOpen(false)}
            />
        </div>
    );
}
