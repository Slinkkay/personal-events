import React from "react";
import { useOmniStore } from "../useOmniStore";
import { MarkdownViewer, StatusBadge, StatusSelect } from "./common";
import { Edit3 } from "lucide-react";
import { useDialogStore } from "@/app/webapp/pwa/dialog";
import { DueDateBadge } from "@/app/webapp/pwa/components/DueDateBadge";

interface RequestCardProps {
    requestId: string;
    roleTag?: boolean;
    onEdit?: (id: string) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ requestId, roleTag, onEdit }) => {
    const { updateRequestStatus, ecsData } = useOmniStore();
    const { showRequest } = useDialogStore();

    const request = ecsData?.Request[requestId];
    if (request === undefined) {
        return <div>No Request</div>;
    }

    const lines = request.description.split("\n");
    const reqTitle = lines[0] || "Untitled Request";
    const reqBody = lines.slice(1).join("\n");
    const responsibilityId = ecsData.PartOf[requestId];

    // Static placeholder value while avoiding assumptions about request.dueDate's type
    const staticDueDate = request.dueDate;

    let roleTitle: string | null = null;
    let respTitle: string | null = null;

    if (roleTag) {
        const roleId = ecsData.PartOf[responsibilityId];
        roleTitle = ecsData.Role[roleId].title;
        respTitle = ecsData.Responsibility[responsibilityId].title;
    }

    return (
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-slate-900">{reqTitle}</span>
                    <StatusBadge type="request" status={request.status} />
                </div>

                <MarkdownViewer content={reqBody} />

                {roleTag && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                        <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {roleTitle}
                        </span>
                        <span>›</span>
                        <span className="text-slate-600">{respTitle}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-end gap-1.5 self-end md:self-center">
                <div className="flex items-center gap-2">
                    <StatusSelect
                        value={request.status}
                        onChange={(newStatus) => updateRequestStatus(request.id, newStatus)}
                    />

                    <button
                        onClick={() =>
                            showRequest({
                                type: "edit",
                                id: request.id,
                                responsibilityId,
                            })
                        }
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Edit Request"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                    </button>
                </div>

                <DueDateBadge label={staticDueDate} />
            </div>
        </div>
    );
};
