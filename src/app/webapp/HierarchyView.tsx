import React, { useState } from "react";
import { useOmniStore } from "./useOmniStore";
import { SearchBar } from "./components/common";
import { RoleView } from "./components/RoleView";
import { Plus } from "lucide-react";

interface HierarchyViewProps {
    onOpenAddRoleModal?: () => void;
    onOpenAddRespModal?: () => void;
    onOpenAddReqModal?: () => void;
}

export const HierarchyView: React.FC<HierarchyViewProps> = ({
    onOpenAddRoleModal,
    onOpenAddRespModal,
    onOpenAddReqModal,
}) => {
    const { data } = useOmniStore();
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
    if (!showClosed) {
        rolesToDisplay = rolesToDisplay.filter((r) => r.status === "OPEN");
    }

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
            {/* Filter & Search Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search roles, responsibilities..."
                    className="w-full sm:w-80"
                />
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                        <input
                            type="checkbox"
                            checked={showClosed}
                            onChange={(e) => setShowClosed(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        Show Closed Roles
                    </label>

                    <button
                        onClick={onOpenAddRoleModal}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Add Role
                    </button>
                </div>
            </div>

            {/* Roles List */}
            <div className="space-y-4">
                {rolesToDisplay.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                        <p className="text-xs text-slate-400">No roles found matching your criteria.</p>
                    </div>
                ) : (
                    rolesToDisplay.map((role) => {
                        const roleResps = data.responsibilities.filter((resp) => resp.roleId === role.id);
                        return (
                            <RoleView
                                key={role.id}
                                role={role}
                                responsibilities={roleResps}
                                requests={data.requests}
                                isExpanded={expandedRoles.has(role.id)}
                                expandedResp={expandedResp}
                                onToggleExpand={toggleRoleExpand}
                                onToggleRespExpand={toggleRespExpand}
                                onAddResponsibility={onOpenAddRespModal}
                                onAddRequest={onOpenAddReqModal}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};
