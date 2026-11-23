import React from "react";
import { Role, Responsibility, RequestItem, useOmniStore } from "../useOmniStore";
import { StatusBadge, MarkdownViewer } from "./common";
import { ResponsibilityList } from "./ResponsibilityList";
import { ChevronRight, ChevronDown, FileText, Plus, Edit3 } from "lucide-react";
import { useDialogStore } from "../dialog";

interface RoleViewProps {
    role: Role;
    responsibilities: Responsibility[];
    requests: RequestItem[];
    isExpanded: boolean;
    expandedResp: Set<string>;
    onToggleExpand: (id: string) => void;
    onToggleRespExpand: (id: string) => void;
}

export const RoleView: React.FC<RoleViewProps> = ({
    role,
    responsibilities,
    requests,
    isExpanded,
    expandedResp,
    onToggleExpand,
    onToggleRespExpand,
}) => {
    // Directly consume actions from the store instead of receiving them via props
    const { showResponsibility, showRole } = useDialogStore();
    const selectedView = useOmniStore((state) => state.selectedView);
    const selectedResponsibilityId = selectedView.tab === "hierarchy" ? selectedView.responsibilityId : undefined;

    const visibleResponsibilities = responsibilities.filter(
        (res) => res.status == "OPEN" || res.id === selectedResponsibilityId,
    );

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
                            Created: {role.createdAt} •{" "}
                            {visibleResponsibilities.filter((res) => res.status !== "CLOSED").length} Responsibilities
                        </p>
                    </div>
                </div>

                {/* Role Actions (stopPropagation prevents collapsing when clicking buttons) */}
                <div className="flex items-center gap-1.5 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() =>
                            showResponsibility({
                                type: "create",
                                roleId: role.id,
                            })
                        }
                        title="Add Responsibility"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl text-xs font-medium flex items-center gap-1 transition-all shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Add Resp</span>
                    </button>
                    <button
                        onClick={() =>
                            showRole({
                                type: "edit",
                                id: role.id,
                            })
                        }
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-xl transition-all border border-slate-700"
                        title="Edit Request"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
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
                    <ResponsibilityList
                        responsibilities={visibleResponsibilities}
                        requests={requests}
                        expandedResp={expandedResp}
                        onToggleRespExpand={onToggleRespExpand}
                    />
                </div>
            )}
        </div>
    );
};
