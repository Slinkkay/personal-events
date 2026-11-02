import React from "react";
import { useOmniStore, Role, Responsibility, RequestItem } from "../useOmniStore";
import { StatusBadge, MarkdownViewer } from "./common";
import { ResponsibilityCard } from "./ResponsibilityCard";
import { ChevronRight, ChevronDown, Archive, RotateCcw, Trash2, FileText, Plus } from "lucide-react";

interface RoleViewProps {
    role: Role;
    responsibilities: Responsibility[];
    requests: RequestItem[];
    isExpanded: boolean;
    expandedResp: Set<string>;
    onToggleExpand: (id: string) => void;
    onToggleRespExpand: (id: string) => void;
    onAddResponsibility?: (roleId: string) => void;
    onAddRequest?: (responsibilityId: string) => void;
}

export const RoleView: React.FC<RoleViewProps> = ({
    role,
    responsibilities,
    requests,
    isExpanded,
    expandedResp,
    onToggleExpand,
    onToggleRespExpand,
    onAddResponsibility,
    onAddRequest,
}) => {
    // Directly consume actions from the store instead of receiving them via props
    const { deleteResponsibility, deleteRole } = useOmniStore();

    const handleRoleDelete = () => {
        deleteRole(role.id);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all">
            {/* Role Header */}
            <div
                className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer select-none"
                onClick={() => onToggleExpand(role.id)}
            >
                <div className="flex items-center gap-3 flex-1">
                    <button className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-all">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm sm:text-base font-bold tracking-tight">{role.title}</h2>
                            <StatusBadge type="role" status={role.status} />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Created: {role.createdAt} • {responsibilities.length} Responsibilities
                        </p>
                    </div>
                </div>

                {/* Role Actions (stopPropagation prevents collapsing when clicking buttons) */}
                <div className="flex items-center gap-1.5 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    {onAddResponsibility && (
                        <button
                            onClick={() => onAddResponsibility(role.id)}
                            title="Add Responsibility"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl text-xs font-medium flex items-center gap-1 transition-all shadow-sm"
                        >
                            <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Add Resp</span>
                        </button>
                    )}
                    <button
                        title={role.status === "OPEN" ? "Close Role" : "Reopen Role"}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-xl transition-all border border-slate-700"
                    >
                        {role.status === "OPEN" ? (
                            <Archive className="w-3.5 h-3.5" />
                        ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                        )}
                    </button>
                    <button
                        onClick={handleRoleDelete}
                        title="Delete Role"
                        className="bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 p-2 rounded-xl transition-all border border-slate-700"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Role Expanded Body */}
            {isExpanded && (
                <div className="p-4 sm:p-6 space-y-6 bg-slate-50/50">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-700">
                        <div className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider mb-2 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Role Description & Resources
                        </div>
                        <MarkdownViewer content={role.description} />
                    </div>

                    {/* Responsibilities Subsection */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Responsibilities ({responsibilities.length})
                        </h4>
                        {responsibilities.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No responsibilities added yet.</p>
                        ) : (
                            responsibilities.map((resp) => {
                                const isRespExpanded = expandedResp.has(resp.id);
                                const respRequests = requests.filter((req) => req.responsibilityId === resp.id);

                                return (
                                    <ResponsibilityCard
                                        key={resp.id}
                                        responsibility={resp}
                                        requests={respRequests}
                                        isExpanded={isRespExpanded}
                                        onToggleExpand={onToggleRespExpand}
                                        onAddRequest={onAddRequest}
                                        onDelete={deleteResponsibility}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
