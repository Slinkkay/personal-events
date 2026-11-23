import React, { useState, useEffect, useRef } from "react";
import { useOmniStore, RespStatus } from "../useOmniStore";
import { X, GitCommit, Edit3, Lock, Loader2 } from "lucide-react";
import { useDialogStore } from "@/app/webapp/pwa/dialog";

interface FieldComponentProps {
    responsibilityId: string | undefined;
}

// 1. Parent Role Field Component
const RoleField: React.FC<
    FieldComponentProps & {
        roleId: string;
        setRoleId: (val: string) => void;
        isUnlocked: boolean;
        onToggleLock: () => void;
        isAnyLocked: boolean;
        originalValue: string;
    }
> = ({ responsibilityId, roleId, setRoleId, isUnlocked, onToggleLock, isAnyLocked, originalValue }) => {
    const { data } = useOmniStore();
    const [savingField, setSavingField] = useState(false);
    const isEditMode = Boolean(responsibilityId);
    const { updateResponsibilityRole } = useOmniStore();
    const saveButtonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        if (isEditMode && isUnlocked) {
            inputRef.current?.focus();
        }
    }, [isEditMode, isUnlocked]);

    const handleSave = async () => {
        setSavingField(true);
        if (responsibilityId === undefined || roleId === undefined) return;
        await updateResponsibilityRole(responsibilityId, roleId);
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
            setRoleId(originalValue);
            onToggleLock();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block font-semibold text-slate-700">Parent Role</label>
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
                value={roleId}
                disabled={isEditMode && !isUnlocked}
                onChange={(e) => setRoleId(e.target.value)}
                onKeyDown={handleKeyDown}
                required
                className={`w-full px-3 py-2 border rounded-xl text-xs transition-colors ${
                    isEditMode && !isUnlocked
                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                        : "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                }`}
            >
                {!isEditMode && <option value="">Select a role...</option>}
                {data.roles.map((role) => (
                    <option key={role.id} value={role.id}>
                        {role.title} ({role.status})
                    </option>
                ))}
            </select>
        </div>
    );
};

// 2. Responsibility Title Field Component
const TitleField: React.FC<
    FieldComponentProps & {
        title: string;
        setTitle: (val: string) => void;
        isUnlocked: boolean;
        onToggleLock: () => void;
        isAnyLocked: boolean;
        originalValue: string;
    }
> = ({ responsibilityId, title, setTitle, isUnlocked, onToggleLock, isAnyLocked, originalValue }) => {
    const [savingField, setSavingField] = useState(false);
    const isEditMode = Boolean(responsibilityId);
    const { updateResponsibilityTitle } = useOmniStore();
    const saveButtonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditMode && isUnlocked) {
            inputRef.current?.focus();
        }
    }, [isEditMode, isUnlocked]);

    const handleSave = async () => {
        setSavingField(true);
        if (!responsibilityId) return;
        await updateResponsibilityTitle(responsibilityId, title);
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
            setTitle(originalValue);
            onToggleLock();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block font-semibold text-slate-700">Responsibility Title</label>
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
                type="text"
                required
                disabled={isEditMode && !isUnlocked}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Lead for Feature X Development"
                className={`w-full px-3 py-2 border rounded-xl text-xs transition-colors ${
                    isEditMode && !isUnlocked
                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                        : "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                }`}
            />
        </div>
    );
};

// 3. Description Field Component
const DescriptionField: React.FC<
    FieldComponentProps & {
        description: string;
        setDescription: (val: string) => void;
        isUnlocked: boolean;
        onToggleLock: () => void;
        isAnyLocked: boolean;
        originalValue: string;
    }
> = ({ responsibilityId, description, setDescription, isUnlocked, onToggleLock, isAnyLocked, originalValue }) => {
    const [savingField, setSavingField] = useState(false);
    const isEditMode = Boolean(responsibilityId);
    const { updateResponsibilityDescription } = useOmniStore();
    const saveButtonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditMode && isUnlocked) {
            inputRef.current?.focus();
        }
    }, [isEditMode, isUnlocked]);

    const handleSave = async () => {
        if (responsibilityId === undefined) return;
        setSavingField(true);
        await updateResponsibilityDescription(responsibilityId, description);
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
                <label className="block font-semibold text-slate-700">Description (Markdown Supported)</label>
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
                disabled={isEditMode && !isUnlocked}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the guiding goals and targets..."
                className={`w-full px-3 py-2 border rounded-xl font-mono text-[11px] transition-colors ${
                    isEditMode && !isUnlocked
                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                        : "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                }`}
            />
        </div>
    );
};

// 4. Status Field Component
const StatusField: React.FC<
    FieldComponentProps & {
        status: RespStatus;
        setStatus: (val: RespStatus) => void;
        isUnlocked: boolean;
        onToggleLock: () => void;
        isAnyLocked: boolean;
        originalValue: RespStatus;
    }
> = ({ responsibilityId, status, setStatus, isUnlocked, onToggleLock, isAnyLocked, originalValue }) => {
    const [savingField, setSavingField] = useState(false);
    const isEditMode = Boolean(responsibilityId);
    const { updateResponsibilityStatus } = useOmniStore();
    const saveButtonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        if (isEditMode && isUnlocked) {
            inputRef.current?.focus();
        }
    }, [isEditMode, isUnlocked]);

    const handleSave = async () => {
        setSavingField(true);
        if (responsibilityId === undefined) return;
        await updateResponsibilityStatus(responsibilityId, status);
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
                <label className="block font-semibold text-slate-700">Status</label>
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
                onChange={(e) => setStatus(e.target.value as RespStatus)}
                onKeyDown={handleKeyDown}
                className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold transition-colors ${
                    isEditMode && !isUnlocked
                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                        : "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                }`}
            >
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
            </select>
        </div>
    );
};

export const ResponsibilityModal: React.FC = () => {
    const { data, ecsData, addResponsibility } = useOmniStore();
    const { data: dialogData, closeResponsibility } = useDialogStore();

    const [roleId, setRoleId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<RespStatus>("OPEN");

    // Track original values when a field is unlocked so we can revert on escape
    const [originalRoleId, setOriginalRoleId] = useState("");
    const [originalTitle, setOriginalTitle] = useState("");
    const [originalDescription, setOriginalDescription] = useState("");
    const [originalStatus, setOriginalStatus] = useState<RespStatus>("OPEN");

    const [unlockedField, setUnlockedField] = useState<"role" | "title" | "description" | "status" | null>(null);

    const isOpen = dialogData.responsibility !== null;
    const responsibilityId = dialogData.responsibility?.id;
    const defaultRoleId = responsibilityId !== undefined ? ecsData.PartOf[responsibilityId] : undefined;

    useEffect(() => {
        if (responsibilityId) {
            const resp = data.responsibilities.find((r) => r.id === responsibilityId);
            if (resp) {
                setRoleId(resp.roleId);
                setTitle(resp.title);
                setDescription(resp.description);
                setStatus(resp.status);
            }
            setUnlockedField(null);
        } else {
            // Create mode: only pre-fill roleId if explicitly provided by the caller
            setRoleId(dialogData.responsibility?.roleId || "");
            setTitle("");
            setDescription("");
            setStatus("OPEN");
            setUnlockedField(null);
        }
    }, [responsibilityId, dialogData.responsibility?.roleId, data.responsibilities, data.roles, isOpen]);

    // Close modal on Escape when open and no field is actively being edited
    useEffect(() => {
        if (!isOpen) return;

        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && unlockedField === null) {
                e.preventDefault();
                closeResponsibility();
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [isOpen, unlockedField, closeResponsibility]);

    // Handle unlocking a field and capturing its starting value for Escape-reverts
    const handleToggleLock = (field: "role" | "title" | "description" | "status") => {
        if (unlockedField === field) {
            setUnlockedField(null);
        } else {
            if (unlockedField === null) {
                setOriginalRoleId(roleId);
                setOriginalTitle(title);
                setOriginalDescription(description);
                setOriginalStatus(status);
            }
            setUnlockedField(field);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !roleId) return;

        if (!responsibilityId) {
            addResponsibility({ roleId, title, description, status });
            closeResponsibility();
        }
    };

    const isEditMode = Boolean(responsibilityId);
    const isAnyLocked = unlockedField !== null;

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    closeResponsibility();
                }
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        {isEditMode ? (
                            <Edit3 className="w-4 h-4 text-indigo-600" />
                        ) : (
                            <GitCommit className="w-4 h-4 text-indigo-600" />
                        )}
                        {isEditMode ? "Edit Responsibility" : "Create New Responsibility"}
                    </h3>
                    <button
                        onClick={closeResponsibility}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Form Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
                    {isEditMode && (
                        <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between font-mono text-slate-600">
                            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                                Responsibility ID
                            </span>
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 select-all font-bold text-indigo-600">
                                {responsibilityId}
                            </span>
                        </div>
                    )}

                    <RoleField
                        responsibilityId={responsibilityId}
                        roleId={roleId}
                        setRoleId={setRoleId}
                        isUnlocked={unlockedField === "role"}
                        onToggleLock={() => handleToggleLock("role")}
                        isAnyLocked={isAnyLocked}
                        originalValue={originalRoleId}
                    />

                    <TitleField
                        responsibilityId={responsibilityId}
                        title={title}
                        setTitle={setTitle}
                        isUnlocked={unlockedField === "title"}
                        onToggleLock={() => handleToggleLock("title")}
                        isAnyLocked={isAnyLocked}
                        originalValue={originalTitle}
                    />

                    <DescriptionField
                        responsibilityId={responsibilityId}
                        description={description}
                        setDescription={setDescription}
                        isUnlocked={unlockedField === "description"}
                        onToggleLock={() => handleToggleLock("description")}
                        isAnyLocked={isAnyLocked}
                        originalValue={originalDescription}
                    />

                    <StatusField
                        responsibilityId={responsibilityId}
                        status={status}
                        setStatus={setStatus}
                        isUnlocked={unlockedField === "status"}
                        onToggleLock={() => handleToggleLock("status")}
                        isAnyLocked={isAnyLocked}
                        originalValue={originalStatus}
                    />

                    {/* Modal Actions */}
                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={closeResponsibility}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        {!isEditMode && (
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-sm"
                            >
                                Create Responsibility
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
