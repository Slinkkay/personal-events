import React from "react";
import { Layers, FolderTree, CheckSquare, Plus, FolderPlus } from "lucide-react";
import { useDialogStore } from "../dialog";
import { useOmniStore } from "@/app/webapp/pwa/useOmniStore";
import { Omnibar } from "./Omnibar";

export const Header: React.FC = () => {
    const { showRole, showRequest } = useDialogStore();
    const { data, selectedView, setSelectedView } = useOmniStore();

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

                {/* Action Controls & Tab Switcher */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* View Tab Switcher */}
                    <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
                        <button
                            onClick={() => setSelectedView({ tab: "hierarchy" })}
                            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
                                selectedView.tab === "hierarchy"
                                    ? "bg-indigo-600 text-white shadow"
                                    : "text-slate-300 hover:text-white"
                            }`}
                        >
                            <FolderTree className="w-4 h-4" /> Roles Hierarchy
                        </button>
                        <button
                            onClick={() => setSelectedView({ tab: "requests" })}
                            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
                                selectedView.tab === "requests"
                                    ? "bg-indigo-600 text-white shadow"
                                    : "text-slate-300 hover:text-white"
                            }`}
                        >
                            <CheckSquare className="w-4 h-4" /> Master Requests
                        </button>
                    </div>

                    {/* Flattened Quick Add Buttons */}
                    <button
                        onClick={() => {
                            showRole({
                                type: "create",
                            });
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                    >
                        <FolderPlus className="w-4 h-4" /> New Role
                    </button>
                    <button
                        onClick={() => {
                            const responsibilityId = data.responsibilities[0].id;
                            showRequest({
                                type: "create",
                                responsibilityId,
                            });
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm border border-slate-700 transition-all flex items-center gap-1.5 active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> New Request
                    </button>
                    <Omnibar />
                </div>
            </div>
        </header>
    );
};
