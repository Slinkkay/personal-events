import { Calendar } from "lucide-react";
interface DueDateBadgeProps {
    label?: string;
}

export const DueDateBadge: React.FC<DueDateBadgeProps> = ({ label = "Due Nov 30, 2026" }) => {
    return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded">
            <Calendar className="w-3 h-3 text-slate-400" />
            {label}
        </span>
    );
};
