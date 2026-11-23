import React, { useState, useEffect, useRef, useMemo } from "react";
import { useOmniStore, RequestStatus } from "../useOmniStore";
import { X, CheckSquare, Edit3, Search, Check, Lock, Loader2 } from "lucide-react";
import { useDialogStore } from "@/app/webapp/pwa/dialog";

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FieldComponentProps {
    requestId: string | undefined;
}

// 1. Responsibility Field Component
const ResponsibilityField: React.FC<
    FieldComponentProps & {
        responsibilityId: string;
        setResponsibilityId: (id: string) => void;
        isUnlocked: boolean;
        onToggleLock: () => void;
        isAnyLocked: boolean;
        originalValue: string;
    }
> = ({ requestId, responsibilityId, setResponsibilityId, isUnlocked, onToggleLock, isAnyLocked, originalValue }) => {
    const { data } = useOmniStore();
    const [respSearchQuery, setRespSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [savingField, setSavingField] = useState(false);
    const saveButtonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (requestId && isUnlocked) {
            inputRef.current?.focus();
        }
    }, [requestId, isUnlocked]);

    const selectedRespLabel = useMemo(() => {
        const selectedResp = data.responsibilities.find((r) => r.id === responsibilityId);
        if (!selectedResp) return "";
        const parentRole = data.roles.find((ro) => ro.id === selectedResp.roleId);
        return parentRole ? `${parentRole.title} › ${selectedResp.title}` : selectedResp.title;
    }, [responsibilityId, data.responsibilities, data.roles]);

    const handleSave = () => {
        setSavingField(true);
        setTimeout(() => {
            // TODO: Update backend/store with new responsibilityId here
            setSavingField(false);
            onToggleLock();
        }, 5000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Tab" && !e.shiftKey && isUnlocked) {
            e.preventDefault();
            saveButtonRef.current?.focus();
        } else if (e.key === "Escape" && isUnlocked) {
            e.preventDefault();
            e.stopPropagation();
            setResponsibilityId(originalValue);
            setIsDropdownOpen(false);
            onToggleLock();
        }
    };

    const isEditMode = Boolean(requestId);

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Parent Responsibility</label>
                {isEditMode && (
                    <div className="flex items-center gap-2">
                        {isUnlocked ? (
                            <button
                                ref={saveButtonRef}
                                type="button"
                                onClick={handleSave}
                                disabled={savingField}
                                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded text-[11px] flex items-center gap-1 transition-all disabled:opacity-50"
                            >
                                {savingField ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isAnyLocked) {
                                        onToggleLock();
                                        setIsDropdownOpen(true);
                                        setRespSearchQuery("");
                                    }
                                }}
                                disabled={isAnyLocked}
                                className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 flex items-center gap-1 transition-colors text-[11px]"
                            >
                                <Lock className="w-3 h-3" /> Locked
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div className="relative">
                <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                        ref={inputRef}
                        type="text"
                        required
                        disabled={isEditMode && !isUnlocked}
                        placeholder="Search responsibility or role..."
                        value={isDropdownOpen && isUnlocked ? respSearchQuery : selectedRespLabel}
                        onFocus={() => {
                            if (!isEditMode || isUnlocked) {
                                setIsDropdownOpen(true);
                                setRespSearchQuery("");
                            }
                        }}
                        onChange={(e) => setRespSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={`w-full pl-8 pr-8 py-2 border rounded-xl text-xs transition-colors ${
                            isEditMode && !isUnlocked
                                ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                                : "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                        }`}
                    />
                    {(!isEditMode || isUnlocked) && responsibilityId && (
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

                {(!isEditMode || isUnlocked) && isDropdownOpen && (
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
                                                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
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
    );
};

// 2. Description Field Component
const DescriptionField: React.FC<
    FieldComponentProps & {
        description: string;
        setDescription: (val: string) => void;
        isUnlocked: boolean;
        onToggleLock: () => void;
        isAnyLocked: boolean;
        originalValue: string;
    }
> = ({ requestId, description, setDescription, isUnlocked, onToggleLock, isAnyLocked, originalValue }) => {
    const { updateRequestDescription } = useOmniStore();
    const [savingField, setSavingField] = useState(false);
    const isEditMode = Boolean(requestId);
    const saveButtonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (requestId && isUnlocked) {
            inputRef.current?.focus();
        }
    }, [requestId, isUnlocked]);

    const handleSave = () => {
        setSavingField(true);
        if (requestId === undefined) {
            return;
        }
        updateRequestDescription(requestId, description);
        setSavingField(false);
        onToggleLock();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Tab" && !e.shiftKey && isUnlocked) {
            e.preventDefault();
            saveButtonRef.current?.focus();
        } else if (e.key === "Escape" && isUnlocked) {
            e.preventDefault();
            e.stopPropagation();
            setDescription(originalValue);
            onToggleLock();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">
                    Description (First line acts as Title, Markdown supported)
                </label>
                {isEditMode && (
                    <div className="flex items-center gap-2">
                        {isUnlocked ? (
                            <button
                                ref={saveButtonRef}
                                type="button"
                                onClick={handleSave}
                                disabled={savingField}
                                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded text-[11px] flex items-center gap-1 transition-all disabled:opacity-50"
                            >
                                {savingField ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isAnyLocked) onToggleLock();
                                }}
                                disabled={isAnyLocked}
                                className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 flex items-center gap-1 transition-colors text-[11px]"
                            >
                                <Lock className="w-3 h-3" /> Locked
                            </button>
                        )}
                    </div>
                )}
            </div>
            <textarea
                ref={inputRef}
                rows={5}
                required
                disabled={isEditMode && !isUnlocked}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={"API Spec Review\nDraft the OpenAPI 3.0 specification document..."}
                className={`w-full px-3 py-2 border rounded-xl font-mono text-[11px] transition-colors ${
                    isEditMode && !isUnlocked
                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                        : "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                }`}
            />
        </div>
    );
};

// 3. Due Date Field Component
const DueDateField: React.FC<
    FieldComponentProps & {
        dueDate: string;
        setDueDate: (val: string) => void;
        isUnlocked: boolean;
        onToggleLock: () => void;
        isAnyLocked: boolean;
        originalValue: string;
    }
> = ({ requestId, dueDate, setDueDate, isUnlocked, onToggleLock, isAnyLocked, originalValue }) => {
    const { updateRequestDueDate } = useOmniStore();
    const [savingField, setSavingField] = useState(false);
    const isEditMode = Boolean(requestId);
    const saveButtonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (requestId && isUnlocked) {
            inputRef.current?.focus();
        }
    }, [requestId, isUnlocked]);

    const handleSave = () => {
        setSavingField(true);
        if (requestId === undefined) {
            return;
        }
        updateRequestDueDate(requestId, dueDate);
        setSavingField(false);
        onToggleLock();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Tab" && !e.shiftKey && isUnlocked) {
            e.preventDefault();
            saveButtonRef.current?.focus();
        } else if (e.key === "Escape" && isUnlocked) {
            e.preventDefault();
            e.stopPropagation();
            setDueDate(originalValue);
            onToggleLock();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Due Date</label>
                {isEditMode && (
                    <div className="flex items-center gap-2">
                        {isUnlocked ? (
                            <button
                                ref={saveButtonRef}
                                type="button"
                                onClick={handleSave}
                                disabled={savingField}
                                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded text-[11px] flex items-center gap-1 transition-all disabled:opacity-50"
                            >
                                {savingField ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isAnyLocked) onToggleLock();
                                }}
                                disabled={isAnyLocked}
                                className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 flex items-center gap-1 transition-colors text-[11px]"
                            >
                                <Lock className="w-3 h-3" /> Locked
                            </button>
                        )}
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                type="date"
                required
                disabled={isEditMode && !isUnlocked}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full px-3 py-2 border rounded-xl text-xs transition-colors ${
                    isEditMode && !isUnlocked
                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                        : "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                }`}
            />
        </div>
    );
};

// 4. Status Field Component
const StatusField: React.FC<
    FieldComponentProps & {
        status: RequestStatus;
        setStatus: (val: RequestStatus) => void;
        isUnlocked: boolean;
        onToggleLock: () => void;
        isAnyLocked: boolean;
        originalValue: RequestStatus;
    }
> = ({ requestId, status, setStatus, isUnlocked, onToggleLock, isAnyLocked, originalValue }) => {
    const { updateRequestStatus } = useOmniStore();
    const [savingField, setSavingField] = useState(false);
    const isEditMode = Boolean(requestId);
    const saveButtonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        if (requestId && isUnlocked) {
            inputRef.current?.focus();
        }
    }, [requestId, isUnlocked]);

    const handleSave = () => {
        setSavingField(true);
        if (requestId === undefined) {
            return;
        }
        updateRequestStatus(requestId, status);
        setSavingField(false);
        onToggleLock();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Tab" && !e.shiftKey && isUnlocked) {
            e.preventDefault();
            saveButtonRef.current?.focus();
        } else if (e.key === "Escape" && isUnlocked) {
            e.preventDefault();
            e.stopPropagation();
            setStatus(originalValue);
            onToggleLock();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Status</label>
                {isEditMode && (
                    <div className="flex items-center gap-2">
                        {isUnlocked ? (
                            <button
                                ref={saveButtonRef}
                                type="button"
                                onClick={handleSave}
                                disabled={savingField}
                                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded text-[11px] flex items-center gap-1 transition-all disabled:opacity-50"
                            >
                                {savingField ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isAnyLocked) onToggleLock();
                                }}
                                disabled={isAnyLocked}
                                className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 flex items-center gap-1 transition-colors text-[11px]"
                            >
                                <Lock className="w-3 h-3" /> Locked
                            </button>
                        )}
                    </div>
                )}
            </div>
            <select
                ref={inputRef}
                value={status}
                disabled={isEditMode && !isUnlocked}
                onChange={(e) => setStatus(e.target.value as RequestStatus)}
                onKeyDown={handleKeyDown}
                className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold transition-colors ${
                    isEditMode && !isUnlocked
                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                        : "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                }`}
            >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="CLOSED">CLOSED</option>
            </select>
        </div>
    );
};

export const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose }) => {
    const { data, addRequest } = useOmniStore();
    const { data: dialogData } = useDialogStore();

    const formRef = useRef<HTMLFormElement>(null);
    const [responsibilityId, setResponsibilityId] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [status, setStatus] = useState<RequestStatus>("OPEN");

    // Track original values for Escape-reverts
    const [originalResponsibilityId, setOriginalResponsibilityId] = useState("");
    const [originalDescription, setOriginalDescription] = useState("");
    const [originalDueDate, setOriginalDueDate] = useState("");
    const [originalStatus, setOriginalStatus] = useState<RequestStatus>("OPEN");

    // Track which field is currently unlocked (null means all are locked)
    const [unlockedField, setUnlockedField] = useState<"responsibility" | "description" | "dueDate" | "status" | null>(
        null,
    );

    const requestId = dialogData.request?.id;

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
            // Edit state: all fields locked by default
            setUnlockedField(null);
        } else {
            const initialRespId = dialogData.request?.responsibilityId || data.responsibilities[0]?.id || "";
            setResponsibilityId(initialRespId);
            setDescription("");
            setDueDate(new Date().toISOString().split("T")[0]);
            setStatus("OPEN");
        }
    }, [requestId, dialogData.request?.id, data.requests, data.responsibilities, isOpen]);

    // On create, focus the first editable field so the user can start typing right away.
    // If the responsibility is preset by the caller, skip to the description.
    const presetResponsibilityId = dialogData.request?.responsibilityId;
    useEffect(() => {
        if (!isOpen || requestId) return;
        const target = presetResponsibilityId
            ? formRef.current?.querySelector<HTMLElement>("textarea")
            : formRef.current?.querySelector<HTMLElement>("input:not(:disabled)");
        target?.focus();
    }, [isOpen, requestId, presetResponsibilityId]);

    // Close modal on Escape when open and no field is actively being edited
    useEffect(() => {
        if (!isOpen) return;

        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && unlockedField === null) {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [isOpen, unlockedField, onClose]);

    // Handle unlocking a field and caching its original value for potential escapes
    const handleToggleLock = (field: "responsibility" | "description" | "dueDate" | "status") => {
        if (unlockedField === field) {
            setUnlockedField(null);
        } else {
            if (unlockedField === null) {
                setOriginalResponsibilityId(responsibilityId);
                setOriginalDescription(description);
                setOriginalDueDate(dueDate);
                setOriginalStatus(status);
            }
            setUnlockedField(field);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim() || !responsibilityId) return;

        if (!requestId) {
            addRequest({ responsibilityId, description, dueDate, status });
            onClose();
        }
    };

    const isEditMode = Boolean(requestId);
    const isAnyLocked = unlockedField !== null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        {isEditMode ? (
                            <Edit3 className="w-4 h-4 text-indigo-600" />
                        ) : (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                        )}
                        {isEditMode ? "Edit Request" : "Create New Request"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Form Body */}
                <form ref={formRef} onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
                    {isEditMode && (
                        <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between font-mono text-slate-600">
                            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                                Request ID
                            </span>
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 select-all font-bold text-indigo-600">
                                {requestId}
                            </span>
                        </div>
                    )}

                    <ResponsibilityField
                        requestId={requestId}
                        responsibilityId={responsibilityId}
                        setResponsibilityId={setResponsibilityId}
                        isUnlocked={unlockedField === "responsibility"}
                        onToggleLock={() => handleToggleLock("responsibility")}
                        isAnyLocked={isAnyLocked}
                        originalValue={originalResponsibilityId}
                    />

                    <DescriptionField
                        requestId={requestId}
                        description={description}
                        setDescription={setDescription}
                        isUnlocked={unlockedField === "description"}
                        onToggleLock={() => handleToggleLock("description")}
                        isAnyLocked={isAnyLocked}
                        originalValue={originalDescription}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <DueDateField
                            requestId={requestId}
                            dueDate={dueDate}
                            setDueDate={setDueDate}
                            isUnlocked={unlockedField === "dueDate"}
                            onToggleLock={() => handleToggleLock("dueDate")}
                            isAnyLocked={isAnyLocked}
                            originalValue={originalDueDate}
                        />
                        <StatusField
                            requestId={requestId}
                            status={status}
                            setStatus={setStatus}
                            isUnlocked={unlockedField === "status"}
                            onToggleLock={() => handleToggleLock("status")}
                            isAnyLocked={isAnyLocked}
                            originalValue={originalStatus}
                        />
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
                        {!isEditMode && (
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-sm"
                            >
                                Create Request
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
