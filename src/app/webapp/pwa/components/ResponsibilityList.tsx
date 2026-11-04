import React from "react";
import { Responsibility, RequestItem } from "../useOmniStore";
import { ResponsibilityCard } from "./ResponsibilityCard";

interface ResponsibilityListProps {
    responsibilities: Responsibility[];
    requests: RequestItem[];
    expandedResp: Set<string>;
    onToggleRespExpand: (id: string) => void;
    onAddRequest?: (responsibilityId: string) => void;
}

export const ResponsibilityList: React.FC<ResponsibilityListProps> = ({
    responsibilities,
    requests,
    expandedResp,
    onToggleRespExpand,
    onAddRequest,
}) => {
    return (
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
                        />
                    );
                })
            )}
        </div>
    );
};
