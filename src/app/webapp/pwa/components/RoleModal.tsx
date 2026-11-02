import React, { useState, useEffect } from "react";
import { useOmniStore, RoleStatus } from "../useOmniStore";
import { X, FolderPlus, Edit3 } from "lucide-react";

interface RoleModalProps {
    isOpen: boolean;
    roleId?: string | null; // If present, it's Edit mode. If null, it's Create mode.
    onClose: () => void;
}

export const RoleModal: React.FC<RoleModalProps> = ({ isOpen, roleId, onClose }) => {
    const { data, addRole } = useOmniStore();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<RoleStatus>("OPEN");

    // Populate form fields if editing an existing role
    useEffect(() => {
        if (roleId) {
            const existingRole = data.roles.find((r) => r.id === roleId);
            if (existingRole) {
                setTitle(existingRole.title);
                setDescription(existingRole.description);
                setStatus(existingRole.status);
            }
        } else {
            setTitle("");
            setDescription("");
            setStatus("OPEN");
        }
    }, [roleId, data.roles, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        if (roleId) {
            alert("Need to update to handle editing a Role");
        } else {
            addRole({ title, description, status: "OPEN" });
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        {roleId ? (
                            <Edit3 className="w-4 h-4 text-indigo-600" />
                        ) : (
                            <FolderPlus className="w-4 h-4 text-indigo-600" />
                        )}
                        {roleId ? "Edit Role" : "Create New Role"}
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
                    {roleId && (
                        <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between font-mono text-slate-600">
                            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                                Role ID
                            </span>
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 select-all font-bold text-indigo-600">
                                {roleId}
                            </span>
                        </div>
                    )}

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Role Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Director of Technology"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                            Description (Markdown Supported: Tables, Links, Lists)
                        </label>
                        <textarea
                            rows={6}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={"## Overview\nDescribe responsibilities and resources..."}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>

                    {roleId && (
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as RoleStatus)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="OPEN">OPEN</option>
                                <option value="CLOSED">CLOSED</option>
                            </select>
                        </div>
                    )}

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
                            {roleId ? "Save Changes" : "Create Role"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
