import React, { useState } from "react";
import { useOmniStore } from "./useOmniStore";
import { SearchBar, getDueDateStatus } from "./components/common";
import { RequestCard } from "./components/RequestCard";

export const RequestsView: React.FC = () => {
    const { data } = useOmniStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("NOT_CLOSED");

    const filtered = data.requests.filter((req) => {
        if (statusFilter === "NOT_CLOSED") {
            if (req.status === "CLOSED") {
                return false;
            }
        } else {
            if (req.status !== statusFilter) {
                return false;
            }
        }
        if (searchQuery.trim() && !req.description.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true;
    });

    filtered.sort((a, b) => {
        const statA = getDueDateStatus(a.dueDate, a.status);
        const statB = getDueDateStatus(b.dueDate, b.status);
        return statA.urgency !== statB.urgency
            ? statA.urgency - statB.urgency
            : new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
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
                        <option value="NOT_CLOSED">Not Closed</option>
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="CLOSED">CLOSED</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                {filtered.map((req) => (
                    <RequestCard key={req.id} requestId={req.id} roleTag={true} />
                ))}
            </div>
        </div>
    );
};
