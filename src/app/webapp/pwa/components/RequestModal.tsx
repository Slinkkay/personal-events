import React, { useState, useEffect, useMemo } from "react";
import { useOmniStore, RequestStatus } from "../useOmniStore";
import { X, CheckSquare, Edit3, Search, Check } from "lucide-react";

interface RequestModalProps {
    isOpen: boolean;
    requestId?: string | null; // If set, Edit mode. If null, Create mode.
    defaultResponsibilityId?: string | null; // Pre-selects parent responsibility
    onClose: () => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({ isOpen, requestId, defaultResponsibilityId, onClose }) => {
    const { data, addRequest, updateRequest } = useOmniStore();

    const [responsibilityId, setResponsibilityId] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [status, setStatus] = useState<RequestStatus>("Ready");

    // Search & Combobox states for parent responsibility selection
    const [respSearchQuery, setRespSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Synchronize state on open / edit mode change
    useEffect(() => {
        if (requestId) {
            const existingReq = data.requests.find((r) => r.id === requestId);
            if (existingReq) {
                setResponsibilityId(existingReq.responsibilityId);
                setDescription(existingReq.description);
                setDueDate(existingReq.dueDate);
                setStatus(existingReq.status);
            }
        } else {
            const initialRespId = defaultResponsibilityId || data.responsibilities[0]?.id || "";
            setResponsibilityId(initialRespId);
            setDescription("");
            setDueDate(new Date().toISOString().split("T")[0]);
            setStatus("Ready");
        }
        setRespSearchQuery("");
        setIsDropdownOpen(false);
    }, [requestId, defaultResponsibilityId, data.requests, data.responsibilities, isOpen]);

    // Derived selected responsibility label for input display
    const selectedRespLabel = useMemo(() => {
        const selectedResp = data.responsibilities.find((r) => r.id === responsibilityId);
        if (!selectedResp) return "";
        const parentRole = data.roles.find((ro) => ro.id === selectedResp.roleId);
        return parentRole ? `${parentRole.title} › ${selectedResp.title}` : selectedResp.title;
    }, [responsibilityId, data.responsibilities, data.roles]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim() || !responsibilityId) return;

        if (requestId) {
            updateRequest(requestId, { responsibilityId, description, dueDate, status });
        } else {
            addRequest({ responsibilityId, description, dueDate, status });
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        {requestId ? (
                            <Edit3 className="w-4 h-4 text-indigo-600" />
                        ) : (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                        )}
                        {requestId ? "Edit Request" : "Create New Request"}
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
                    {requestId && (
                        <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between font-mono text-slate-600">
                            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                                Request ID
                            </span>
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 select-all font-bold text-indigo-600">
                                {requestId}
                            </span>
                        </div>
                    )}

                    {/* Searchable Responsibility Picker */}
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Parent Responsibility</label>
                        <div className="relative">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Search responsibility or role..."
                                    value={isDropdownOpen ? respSearchQuery : selectedRespLabel}
                                    onFocus={() => {
                                        setIsDropdownOpen(true);
                                        setRespSearchQuery("");
                                    }}
                                    onChange={(e) => setRespSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
                                />
                                {responsibilityId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setResponsibilityId("");
                                            setRespSearchQuery("");
                                            setIsDropdownOpen(true);
                                        }}
                                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Responsibility Search Results Dropdown */}
                            {isDropdownOpen && (
                                <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                                    {data.roles.map((role) => {
                                        const matchingResps = data.responsibilities
                                            .filter((resp) => resp.roleId === role.id)
                                            .filter(
                                                (resp) =>
                                                    !respSearchQuery ||
                                                    resp.title.toLowerCase().includes(respSearchQuery.toLowerCase()) ||
                                                    role.title.toLowerCase().includes(respSearchQuery.toLowerCase()),
                                            );

                                        if (matchingResps.length === 0) return null;

                                        return (
                                            <div key={role.id}>
                                                <div className="p-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {role.title}
                                                </div>
                                                {matchingResps.map((resp) => {
                                                    const isSelected = resp.id === responsibilityId;
                                                    return (
                                                        <button
                                                            key={resp.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setResponsibilityId(resp.id);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${
                                                                isSelected
                                                                    ? "bg-indigo-50/70 text-indigo-600 font-medium"
                                                                    : "text-slate-700"
                                                            }`}
                                                        >
                                                            <span>{resp.title}</span>
                                                            {isSelected && (
                                                                <Check className="w-3.5 h-3.5 text-indigo-600" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                            Description (First line acts as Title, Markdown supported)
                        </label>
                        <textarea
                            rows={5}
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={"API Spec Review\nDraft the OpenAPI 3.0 specification document..."}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>

                    {/* Due Date & Status */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                required
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as RequestStatus)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
                            >
                                <option value="Ready">Ready</option>
                                <option value="Working">Working</option>
                                <option value="Complete">Complete</option>
                            </select>
                        </div>
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
                            {requestId ? "Save Changes" : "Create Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
