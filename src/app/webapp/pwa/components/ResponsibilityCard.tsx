import React from "react";
import { Responsibility, RequestItem, useOmniStore } from "../useOmniStore";
import { StatusBadge, MarkdownViewer } from "./common";
import { RequestCard } from "./RequestCard";
import { ChevronRight, ChevronDown, Plus, Edit3, FileText, Archive } from "lucide-react";

interface ResponsibilityCardProps {
    responsibility: Responsibility;
    requests: RequestItem[];
    isExpanded: boolean;
    onToggleExpand: (id: string) => void;
    onAddRequest?: (responsibilityId: string) => void; // Pass ID back up
    onEdit?: (id: string) => void;
}

export const ResponsibilityCard: React.FC<ResponsibilityCardProps> = ({
    responsibility,
    requests,
    isExpanded,
    onToggleExpand,
    onEdit,
    onAddRequest,
}) => {
    const { closeResponsibility } = useOmniStore();

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ml-0 sm:ml-4 transition-all">
            {/* Responsibility Header Bar */}
            <div
                className="p-3.5 bg-slate-100/70 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer select-none"
                onClick={() => onToggleExpand(responsibility.id)}
            >
                <div className="flex items-center gap-2.5 flex-1">
                    <button className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 flex items-center justify-center text-slate-600 border border-slate-300 shadow-sm">
                        {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                        )}
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h5 className="text-xs sm:text-sm font-semibold text-slate-800">{responsibility.title}</h5>
                            <StatusBadge type="resp" status={responsibility.status} />
                        </div>
                        <span className="text-[11px] text-slate-500">{requests.length} Requests</span>
                    </div>
                </div>

                {/* Responsibility Action Buttons (prevent triggering accordion toggle) */}
                <div className="flex items-center gap-1 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    {onEdit && (
                        <button
                            onClick={() => onEdit(responsibility.id)}
                            title="Edit Responsibility"
                            className="bg-white hover:bg-slate-50 text-slate-600 p-1.5 rounded-lg border border-slate-200"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={() => closeResponsibility(responsibility.id)}
                        title="Close Responsibility"
                        className="bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 p-1.5 rounded-lg border border-slate-200"
                    >
                        <Archive className="w-3.5 h-3.5" />
                    </button>
                    {onAddRequest && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddRequest(responsibility.id); // Triggers request modal pre-linked to this responsibility
                            }}
                            title="Add Request"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm"
                        >
                            <Plus className="w-3 h-3" /> Add Request
                        </button>
                    )}
                </div>
            </div>

            {/* Responsibility Expanded Body */}
            {isExpanded && (
                <div className="p-4 space-y-4 bg-white">
                    {/* Description */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="font-semibold text-slate-400 uppercase text-[10px] mb-1.5 flex items-center gap-1.5">
                            <FileText className="w-3 h-3" /> Description
                        </div>
                        <MarkdownViewer content={responsibility.description} />
                    </div>

                    {/* Nested Requests List */}
                    <div className="space-y-2">
                        <h6 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Requests</h6>
                        {requests.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-1">No requests created yet.</p>
                        ) : (
                            requests.map((req) => <RequestCard key={req.id} request={req} />)
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
