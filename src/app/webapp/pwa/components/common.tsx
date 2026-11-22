import React from "react";
import { Search } from "lucide-react";
import { RequestStatus, RoleStatus, RespStatus } from "../useOmniStore";
import { marked } from "marked";

// --- 1. DUE DATE URGENCY HELPER ---
export interface UrgencyInfo {
    label: string;
    color: string;
    dot: string;
    urgency: number;
}

export const getDueDateStatus = (dueDateStr: string, status: RequestStatus): UrgencyInfo => {
    if (status === "CLOSED") {
        return {
            label: "Complete",
            color: "bg-emerald-50 text-emerald-700 border-emerald-200",
            dot: "bg-emerald-500",
            urgency: 3,
        };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // "YYYY-MM-DD" strings parse as UTC midnight, which is the previous day in
    // timezones behind UTC. Build the date in local time so "today" is not overdue.
    const parts = dueDateStr.split("-").map(Number);
    const due =
        parts.length === 3 && parts.every((n) => !isNaN(n))
            ? new Date(parts[0], parts[1] - 1, parts[2])
            : new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return {
            label: `Overdue (${Math.abs(diffDays)}d)`,
            color: "bg-rose-50 text-rose-700 border-rose-200",
            dot: "bg-rose-500 animate-pulse",
            urgency: 0,
        };
    } else if (diffDays <= 3) {
        return {
            label: diffDays === 0 ? "Due Today" : `Due in ${diffDays}d`,
            color: "bg-amber-50 text-amber-700 border-amber-200",
            dot: "bg-amber-500",
            urgency: 1,
        };
    } else {
        return {
            label: `Due ${dueDateStr}`,
            color: "bg-slate-50 text-slate-600 border-slate-200",
            dot: "bg-slate-400",
            urgency: 2,
        };
    }
};

// --- 2. REUSABLE STATUS BADGE ---
interface StatusBadgeProps {
    type: "role" | "resp" | "request";
    status?: RoleStatus | RespStatus | RequestStatus;
    dueDate?: string;
}

export const StatusBadge: React.FC<{
    type: "role" | "resp" | "request";
    status?: RoleStatus | RespStatus | RequestStatus;
    dueDate?: string;
}> = ({ type, status, dueDate }) => {
    if (status === "CLOSED") {
        return (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase bg-slate-200 text-slate-600 border border-slate-300">
                CLOSED
            </span>
        );
    }

    if (type === "role" || type === "resp") {
        return (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
                OPEN
            </span>
        );
    }

    if (type === "request") {
        return (
            <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    status === "IN_PROGRESS"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }`}
            >
                {status}
            </span>
        );
    }

    return null;
};

// --- 3. REUSABLE MARKDOWN / TEXT VIEWER ---
// Configure marked to override the default link renderer globally
marked.use({
    renderer: {
        link({ href, title, text }) {
            // Added text-blue-600 for color, hover:underline for interactivity, and font-medium for emphasis
            let out = `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-medium"`;
            if (title) {
                out += ` title="${title}"`;
            }
            out += `>${text}</a>`;
            return out;
        },
    },
});

export const MarkdownViewer: React.FC<{ content: string; className?: string }> = ({ content, className = "" }) => {
    const rawHtml = marked.parse(content, { async: false }) as string;

    return (
        <div
            className={`prose text-xs text-slate-700 leading-relaxed ${className}`}
            dangerouslySetInnerHTML={{ __html: rawHtml }}
        />
    );
};

// --- 4. REUSABLE REQUEST STATUS DROPDOWN ---
interface StatusSelectProps {
    value: RequestStatus;
    onChange: (newStatus: RequestStatus) => void;
    className?: string;
}

export const StatusSelect: React.FC<{
    value: RequestStatus;
    onChange: (newStatus: RequestStatus) => void;
}> = ({ value, onChange }) => {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as RequestStatus)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none shadow-sm font-medium"
        >
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="CLOSED">CLOSED</option>
        </select>
    );
};

// --- 5. REUSABLE SEARCH BAR ---
interface SearchBarProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "Search...", className = "" }) => {
    return (
        <div className={`relative ${className}`}>
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
        </div>
    );
};
