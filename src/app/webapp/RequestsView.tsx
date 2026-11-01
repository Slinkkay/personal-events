import React, { useState } from "react";
import { useOmniStore } from "./useOmniStore";
import { SearchBar, getDueDateStatus } from "./components/common";
import { RequestCard } from "./components/RequestCard";

export const RequestsView: React.FC = () => {
    const { data, updateRequestStatus } = useOmniStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [roleFilter, setRoleFilter] = useState("ALL");

    const enrichedRequests = data.requests.flatMap((req) => {
        const resp = data.responsibilities.find((r) => r.id === req.responsibilityId);
        if (!resp) return [];
        const role = data.roles.find((r) => r.id === resp.roleId);
        if (!role) return [];
        return [{ req, resp, role }];
    });

    const filtered = enrichedRequests.filter(({ req, resp, role }) => {
        if (statusFilter !== "ALL" && req.status !== statusFilter) return false;
        if (roleFilter !== "ALL" && role.id !== roleFilter) return false;
        if (
            searchQuery.trim() &&
            !req.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !resp.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !role.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
            return false;
        }
        return true;
    });

    filtered.sort((a, b) => {
        const statA = getDueDateStatus(a.req.dueDate, a.req.status);
        const statB = getDueDateStatus(b.req.dueDate, b.req.status);
        return statA.urgency !== statB.urgency
            ? statA.urgency - statB.urgency
            : new Date(a.req.dueDate).getTime() - new Date(b.req.dueDate).getTime();
    });

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search requests..."
                        className="w-full md:w-72"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="Ready">Ready</option>
                        <option value="Working">Working</option>
                        <option value="Complete">Complete</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                {filtered.map(({ req, resp, role }) => (
                    <RequestCard
                        key={req.id}
                        request={req}
                        roleTitle={role.title}
                        respTitle={resp.title}
                        onStatusChange={updateRequestStatus}
                    />
                ))}
            </div>
        </div>
    );
};
