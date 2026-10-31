export function getDueDateStatus(dueDateStr: string, status: string) {
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

    const dueParts = dueDateStr.split("-");
    const due =
        dueParts.length === 3
            ? new Date(parseInt(dueParts[0]), parseInt(dueParts[1]) - 1, parseInt(dueParts[2]))
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
}
