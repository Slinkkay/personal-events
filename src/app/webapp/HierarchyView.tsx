import React, { useState } from "react";
import { useOmniStore, RequestStatus } from "./useOmniStore";
import { StatusBadge, MarkdownViewer, SearchBar } from "./components/common";
import { ChevronRight, ChevronDown, Archive, RotateCcw, Trash2, FileText } from "lucide-react";
import { ResponsibilityCard } from "./components/ResponsibilityCard";

export const HierarchyView: React.FC = () => {
    const { data, updateRole, deleteRole, updateRequestStatus } = useOmniStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [showClosed, setShowClosed] = useState(false);
    const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
    const [expandedResp, setExpandedResp] = useState<Set<string>>(new Set());

    const toggleRoleExpand = (id: string) => {
        const next = new Set(expandedRoles);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedRoles(next);
    };

    const toggleRespExpand = (id: string) => {
        const next = new Set(expandedResp);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedResp(next);
    };

    let rolesToDisplay = data.roles;
    if (!showClosed) rolesToDisplay = rolesToDisplay.filter((r) => r.status === "OPEN");

    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        rolesToDisplay = rolesToDisplay.filter((role) => {
            const roleMatches = role.title.toLowerCase().includes(q) || role.description.toLowerCase().includes(q);
            const respMatches = data.responsibilities
                .filter((resp) => resp.roleId === role.id)
                .some((resp) => resp.title.toLowerCase().includes(q) || resp.description.toLowerCase().includes(q));
            return roleMatches || respMatches;
        });
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search hierarchy..."
                    className="w-full sm:w-80"
                />
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 select-none bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <input
                        type="checkbox"
                        checked={showClosed}
                        onChange={(e) => setShowClosed(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    Show Closed Roles
                </label>
            </div>

            <div className="space-y-4">
                {rolesToDisplay.map((role) => {
                    const isExpanded = expandedRoles.has(role.id);
                    const roleResps = data.responsibilities.filter((resp) => resp.roleId === role.id);

                    return (
                        <div
                            key={role.id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                        >
                            <div className="p-4 sm:p-5 bg-slate-900 text-white flex justify-between items-center">
                                <div
                                    className="flex items-center gap-3 cursor-pointer"
                                    onClick={() => toggleRoleExpand(role.id)}
                                >
                                    <button className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4" />
                                        )}
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-sm font-bold">{role.title}</h2>
                                            <StatusBadge type="role" status={role.status} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() =>
                                            updateRole(role.id, { status: role.status === "OPEN" ? "CLOSED" : "OPEN" })
                                        }
                                        className="p-2 bg-slate-800 rounded-xl border border-slate-700"
                                    >
                                        {role.status === "OPEN" ? (
                                            <Archive className="w-3.5 h-3.5" />
                                        ) : (
                                            <RotateCcw className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => deleteRole(role.id)}
                                        className="p-2 bg-slate-800 rounded-xl border border-slate-700"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-4 space-y-4 bg-slate-50/50">
                                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                                        <div className="font-semibold text-slate-400 uppercase text-[10px] mb-2 flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5" /> Role Description
                                        </div>
                                        <MarkdownViewer content={role.description} />
                                    </div>
                                    {roleResps.map((resp) => {
                                        const isRespExpanded = expandedResp.has(resp.id);
                                        const respRequests = data.requests.filter(
                                            (req) => req.responsibilityId === resp.id,
                                        );

                                        return (
                                            <ResponsibilityCard
                                                key={resp.id}
                                                responsibility={resp}
                                                requests={respRequests}
                                                isExpanded={isRespExpanded}
                                                onToggleExpand={toggleRespExpand}
                                                onStatusChange={updateRequestStatus}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
