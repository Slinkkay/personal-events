import React from "react";
import { RequestItem, RequestStatus } from "../useOmniStore";
import { StatusBadge, StatusSelect } from "./common";
import { Edit3, Trash2 } from "lucide-react";

interface RequestCardProps {
    request: RequestItem;
    roleTitle?: string;
    respTitle?: string;
    onStatusChange: (id: string, newStatus: RequestStatus) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
    request,
    roleTitle,
    respTitle,
    onStatusChange,
    onEdit,
    onDelete,
}) => {
    const lines = request.description.split("\n");
    const reqTitle = lines[0] || "Untitled Request";
    const reqBody = lines.slice(1).join("\n");

    return (
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-slate-900">{reqTitle}</span>
                    <StatusBadge type="request" status={request.status} dueDate={request.dueDate} />
                </div>

                {reqBody && <p className="text-[11px] text-slate-600 line-clamp-2">{reqBody}</p>}

                {roleTitle && respTitle && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                        <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {roleTitle}
                        </span>
                        <span>›</span>
                        <span className="text-slate-600">{respTitle}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
                <StatusSelect value={request.status} onChange={(newStatus) => onStatusChange(request.id, newStatus)} />
                {onEdit && (
                    <button
                        onClick={() => onEdit(request.id)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Edit Request"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={() => onDelete(request.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Request"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
};
