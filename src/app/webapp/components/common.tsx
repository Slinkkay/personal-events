import React from "react";
import { Search } from "lucide-react";
import { RequestStatus, RoleStatus, RespStatus } from "../useOmniStore";

// --- 1. DUE DATE URGENCY HELPER ---
export interface UrgencyInfo {
    label: string;
    color: string;
    dot: string;
    urgency: number;
}

export const getDueDateStatus = (dueDateStr: string, status: RequestStatus): UrgencyInfo => {
    if (status === "Complete") {
        return {
            label: "Complete",
            color: "bg-emerald-50 text-emerald-700 border-emerald-200",
            dot: "bg-emerald-500",
            urgency: 3,
        };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDateStr);
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

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status, dueDate }) => {
    if (type === "role") {
        return (
            <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                    status === "OPEN"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-700 text-slate-400 border border-slate-600"
                }`}
            >
                {status}
            </span>
        );
    }

    if (type === "resp") {
        return (
            <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    status === "Completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : status === "In Progress"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-200 text-slate-700"
                }`}
            >
                {status}
            </span>
        );
    }

    // Request Badge with Urgency Calculations
    if (type === "request" && dueDate && status) {
        const dueInfo = getDueDateStatus(dueDate, status as RequestStatus);
        return (
            <span
                className={`text-[10px] px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${dueInfo.color}`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${dueInfo.dot}`}></span>
                {dueInfo.label}
            </span>
        );
    }

    return null;
};

// --- 3. REUSABLE MARKDOWN / TEXT VIEWER ---
export const MarkdownViewer: React.FC<{ content: string; className?: string }> = ({ content, className = "" }) => {
    return (
        <div className={`prose text-xs text-slate-700 whitespace-pre-line leading-relaxed ${className}`}>{content}</div>
    );
};

// --- 4. REUSABLE REQUEST STATUS DROPDOWN ---
interface StatusSelectProps {
    value: RequestStatus;
    onChange: (newStatus: RequestStatus) => void;
    className?: string;
}

export const StatusSelect: React.FC<StatusSelectProps> = ({ value, onChange, className = "" }) => {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as RequestStatus)}
            className={`text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm font-medium ${className}`}
        >
            <option value="Ready">Ready</option>
            <option value="Working">Working</option>
            <option value="Complete">Complete</option>
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
