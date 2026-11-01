import React, { useState } from "react";
import { OmniStoreProvider } from "./useOmniStore";
import { HierarchyView } from "./HierarchyView";
import { RequestsView } from "./RequestsView";
import { RoleModal } from "./components/RoleModal";
import { ResponsibilityModal } from "./components/ResponsibilityModal";
import { RequestModal } from "./components/RequestModal";
import { Layers, FolderTree, CheckSquare, Plus, ChevronDown, FolderPlus, GitCommit } from "lucide-react";

export default function App() {
    const [activeTab, setActiveTab] = useState<"hierarchy" | "requests">("hierarchy");

    // Modal States
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isRespModalOpen, setIsRespModalOpen] = useState(false);
    const [isReqModalOpen, setIsReqModalOpen] = useState(false);

    // Pre-selection target IDs
    const [defaultRoleId, setDefaultRoleId] = useState<string | null>(null);
    const [defaultRespId, setDefaultRespId] = useState<string | null>(null);

    // Dropdown menu state
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleOpenAddRole = () => {
        setIsRoleModalOpen(true);
        setIsMenuOpen(false);
    };

    const handleOpenAddResp = (roleId?: string) => {
        setDefaultRoleId(roleId || null);
        setIsRespModalOpen(true);
        setIsMenuOpen(false);
    };

    const handleOpenAddReq = (respId?: string) => {
        setDefaultRespId(respId || null);
        setIsReqModalOpen(true);
        setIsMenuOpen(false);
    };

    return (
        <OmniStoreProvider>
            <div className="h-full min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
                {/* Header with Global New Item Dropdown */}
                <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 shrink-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg flex items-center justify-center">
                                <Layers className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">OmniTrack</h1>
                                <p className="text-xs text-slate-400">Roles → Responsibilities → Requests</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Tab Switcher */}
                            <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
                                <button
                                    onClick={() => setActiveTab("hierarchy")}
                                    className={`px-4 py-1.5 text-xs font-medium rounded-lg flex items-center gap-2 ${
                                        activeTab === "hierarchy" ? "bg-indigo-600 text-white shadow" : "text-slate-300"
                                    }`}
                                >
                                    <FolderTree className="w-4 h-4" /> Hierarchy
                                </button>
                                <button
                                    onClick={() => setActiveTab("requests")}
                                    className={`px-4 py-1.5 text-xs font-medium rounded-lg flex items-center gap-2 ${
                                        activeTab === "requests" ? "bg-indigo-600 text-white shadow" : "text-slate-300"
                                    }`}
                                >
                                    <CheckSquare className="w-4 h-4" /> Master Requests
                                </button>
                            </div>

                            {/* Global "New Item" Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5"
                                >
                                    <Plus className="w-4 h-4" /> New Item{" "}
                                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-slate-700 text-xs">
                                        <button
                                            onClick={handleOpenAddRole}
                                            className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                                        >
                                            <FolderPlus className="w-3.5 h-3.5" /> New Role
                                        </button>
                                        <button
                                            onClick={() => handleOpenAddResp()}
                                            className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                                        >
                                            <GitCommit className="w-3.5 h-3.5" /> New Responsibility
                                        </button>
                                        <button
                                            onClick={() => handleOpenAddReq()}
                                            className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                                        >
                                            <CheckSquare className="w-3.5 h-3.5" /> New Request
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Views */}
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {activeTab === "hierarchy" ? (
                        <HierarchyView
                            onOpenAddRoleModal={handleOpenAddRole}
                            onOpenAddRespModal={handleOpenAddResp}
                            onOpenAddReqModal={handleOpenAddReq}
                        />
                    ) : (
                        <RequestsView />
                    )}
                </main>

                {/* All Modals */}
                <RoleModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} />
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
        </OmniStoreProvider>
    );
}
