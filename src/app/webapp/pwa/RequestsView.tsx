import React, { useState } from "react";
import { useOmniStore } from "./useOmniStore";
import { SearchBar, getDueDateStatus } from "./components/common";
import { RequestCard } from "./components/RequestCard";

// Buckets keyed by the `urgency` value returned from getDueDateStatus.
const BUCKETS = [
    {
        urgency: 0,
        title: "Overdue",
        subtitle: "Past due date",
        text: "text-rose-700",
        line: "border-rose-200",
        dot: "bg-rose-500 animate-pulse",
    },
    {
        urgency: 1,
        title: "Due Soon",
        subtitle: "Next 3 days",
        text: "text-amber-700",
        line: "border-amber-200",
        dot: "bg-amber-500",
    },
    {
        urgency: 2,
        title: "Due Later",
        subtitle: "More than 3 days away",
        text: "text-slate-600",
        line: "border-slate-200",
        dot: "bg-slate-400",
    },
    {
        urgency: 3,
        title: "Complete",
        subtitle: "Closed requests",
        text: "text-emerald-700",
        line: "border-emerald-200",
        dot: "bg-emerald-500",
    },
];

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

    // Group the filtered + sorted requests into non-empty buckets before rendering.
    const sections = BUCKETS.map((bucket) => ({
        bucket,
        items: filtered.filter((req) => getDueDateStatus(req.dueDate, req.status).urgency === bucket.urgency),
    })).filter((section) => section.items.length > 0);

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

            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-6">
                {filtered.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No requests found.</p>}
                {sections.map(({ bucket, items }) => (
                    <section key={bucket.urgency} className="space-y-3">
                        <div className={`flex items-center gap-3 ${bucket.text}`} role="separator">
                            <hr className={`flex-1 border-t-2 ${bucket.line}`} />
                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`w-2 h-2 rounded-full ${bucket.dot}`} />
                                <h3 className="text-xs font-bold uppercase tracking-wider">{bucket.title}</h3>
                                <span className="text-[10px] font-semibold opacity-70">
                                    {bucket.subtitle} · {items.length}
                                </span>
                            </div>
                            <hr className={`flex-1 border-t-2 ${bucket.line}`} />
                        </div>
                        {items.map((req) => (
                            <RequestCard key={req.id} requestId={req.id} roleTag={true} />
                        ))}
                    </section>
                ))}
            </div>
        </div>
    );
};
