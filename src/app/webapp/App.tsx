import React, { useState } from "react";
import { OmniStoreProvider } from "./useOmniStore";
import { HierarchyView } from "./HierarchyView";
import { RequestsView } from "./RequestsView";
import { RoleModal } from "./components/RoleModal";
import { ResponsibilityModal } from "./components/ResponsibilityModal";
import { Layers, FolderTree, CheckSquare, Plus } from "lucide-react";

type ActiveTab = "hierarchy" | "requests";

interface HeaderProps {
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
    onOpenAddRole: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenAddRole }) => {
    return (
        <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Brand Header */}
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg flex items-center justify-center">
                        <Layers className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            OmniTrack
                            <span className="text-xs font-semibold uppercase bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                                3-Tier System
                            </span>
                        </h1>
                        <p className="text-xs text-slate-400">Roles → Responsibilities → Requests</p>
                    </div>
                </div>

                {/* Global Action Buttons & Tab Switcher */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
                        <button
                            onClick={() => setActiveTab("hierarchy")}
                            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
                                activeTab === "hierarchy"
                                    ? "bg-indigo-600 text-white shadow"
                                    : "text-slate-300 hover:text-white"
                            }`}
                        >
                            <FolderTree className="w-4 h-4" /> Roles Hierarchy
                        </button>
                        <button
                            onClick={() => setActiveTab("requests")}
                            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
                                activeTab === "requests"
                                    ? "bg-indigo-600 text-white shadow"
                                    : "text-slate-300 hover:text-white"
                            }`}
                        >
                            <CheckSquare className="w-4 h-4" /> Master Requests
                        </button>
                    </div>

                    {/* Global Quick Add Role Button */}
                    <button
                        onClick={onOpenAddRole}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> New Role
                    </button>
                </div>
            </div>
        </header>
    );
};

export default function App() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("hierarchy");

    // Role Modal States
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

    // Responsibility Modal States
    const [isRespModalOpen, setIsRespModalOpen] = useState(false);
    const [editingRespId, setEditingRespId] = useState<string | null>(null);
    const [defaultRoleId, setDefaultRoleId] = useState<string | null>(null);

    const handleOpenAddRole = () => {
        setEditingRoleId(null);
        setIsRoleModalOpen(true);
    };

    const handleOpenAddResp = (roleId?: string) => {
        setEditingRespId(null);
        setDefaultRoleId(roleId || null);
        setIsRespModalOpen(true);
    };

    return (
        <OmniStoreProvider>
            <div className="h-full min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
                <Header activeTab={activeTab} setActiveTab={setActiveTab} onOpenAddRole={handleOpenAddRole} />

                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {activeTab === "hierarchy" ? (
                        <HierarchyView onOpenAddRoleModal={handleOpenAddRole} onOpenAddRespModal={handleOpenAddResp} />
                    ) : (
                        <RequestsView />
                    )}
                </main>

                {/* Global Modals */}
                <RoleModal isOpen={isRoleModalOpen} roleId={editingRoleId} onClose={() => setIsRoleModalOpen(false)} />

                <ResponsibilityModal
                    isOpen={isRespModalOpen}
                    responsibilityId={editingRespId}
                    defaultRoleId={defaultRoleId}
                    onClose={() => setIsRespModalOpen(false)}
                />
            </div>
        </OmniStoreProvider>
    );
}
