import React, { useState, useEffect } from "react";
import { useOmniStore, RespStatus } from "../useOmniStore";
import { X, GitCommit, Edit3 } from "lucide-react";

interface ResponsibilityModalProps {
    isOpen: boolean;
    responsibilityId?: string | null; // If present, Edit mode. If null, Create mode.
    defaultRoleId?: string | null; // Pre-selected role when opened from a specific role header
    onClose: () => void;
}

export const ResponsibilityModal: React.FC<ResponsibilityModalProps> = ({
    isOpen,
    responsibilityId,
    defaultRoleId,
    onClose,
}) => {
    const { data, addResponsibility, updateResponsibility } = useOmniStore();

    const [roleId, setRoleId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<RespStatus>("Active");

    useEffect(() => {
        if (responsibilityId) {
            const resp = data.responsibilities.find((r) => r.id === responsibilityId);
            if (resp) {
                setRoleId(resp.roleId);
                setTitle(resp.title);
                setDescription(resp.description);
                setStatus(resp.status);
            }
        } else {
            setRoleId(defaultRoleId || data.roles[0]?.id || "");
            setTitle("");
            setDescription("");
            setStatus("Active");
        }
    }, [responsibilityId, defaultRoleId, data.responsibilities, data.roles, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !roleId) return;

        if (responsibilityId) {
            updateResponsibility(responsibilityId, { roleId, title, description, status });
        } else {
            addResponsibility({ roleId, title, description, status });
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        {responsibilityId ? (
                            <Edit3 className="w-4 h-4 text-indigo-600" />
                        ) : (
                            <GitCommit className="w-4 h-4 text-indigo-600" />
                        )}
                        {responsibilityId ? "Edit Responsibility" : "Create New Responsibility"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Form Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
                    {responsibilityId && (
                        <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between font-mono text-slate-600">
                            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                                Responsibility ID
                            </span>
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 select-all font-bold text-indigo-600">
                                {responsibilityId}
                            </span>
                        </div>
                    )}

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Parent Role</label>
                        <select
                            value={roleId}
                            onChange={(e) => setRoleId(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            {data.roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.title} ({role.status})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Responsibility Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Lead for Feature X Development"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                            Description (Markdown Supported)
                        </label>
                        <textarea
                            rows={5}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the guiding goals and targets..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as RespStatus)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="Active">Active</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-sm"
                        >
                            {responsibilityId ? "Save Changes" : "Create Responsibility"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
